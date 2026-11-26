const BOT_USER_AGENTS = [
  'bingbot',
  'msnbot',
  'adidxbot',
  'bingpreview',
  'googlebot',
  'google-inspectiontool',
  'yandex',
  'baiduspider',
  'duckduckbot',
  'applebot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'slackbot',
  'discordbot',
  'redditbot',
  'pinterest',
  'chrome-lighthouse',
];

const isCrawlerRequest = (request) => {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
};

const hasFileExtension = (pathname) => /\.[a-zA-Z0-9]{1,8}$/.test(pathname);

const buildForwardHeaders = (request, url) => {
  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.delete('host');
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
  if (clientIp) {
    forwardHeaders.set('X-Forwarded-For', clientIp);
    forwardHeaders.set('CF-Connecting-IP', clientIp);
  }
  forwardHeaders.set('X-Forwarded-Host', url.host);
  forwardHeaders.set('X-Forwarded-Proto', 'https');
  return forwardHeaders;
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const backendBase = (env.BACKEND_URL || '').replace(/\/+$/, '');
    const isApiOrSitemap =
      url.pathname.startsWith('/api') ||
      url.pathname === '/sitemap.xml' ||
      url.pathname === '/sitemap.xsl';

    // 1. Proxy /api/* and dynamic sitemap to Backend API
    if (isApiOrSitemap) {
      // CORS Preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          },
        });
      }

      if (!backendBase) {
        // Fallback to static asset if backend is not configured for sitemap
        if (url.pathname === '/sitemap.xml' && env.ASSETS) {
          return env.ASSETS.fetch(request);
        }
        return new Response(
          JSON.stringify({
            success: false,
            message: 'BACKEND_URL environment variable is not configured in Cloudflare.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        );
      }

      const backendUrl = `${backendBase}${url.pathname}${url.search}`;
      const init = {
        method: request.method,
        headers: buildForwardHeaders(request, url),
        redirect: 'follow',
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const bodyBuffer = await request.arrayBuffer();
        if (bodyBuffer && bodyBuffer.byteLength > 0) {
          init.body = bodyBuffer;
        }
      }

      try {
        const response = await fetch(backendUrl, init);
        // If backend returns 5xx for sitemap, fall back to static sitemap.xml so crawlers never see a 502/503
        if (response.status >= 500 && url.pathname === '/sitemap.xml' && env.ASSETS) {
          return env.ASSETS.fetch(request);
        }
        const resHeaders = new Headers(response.headers);
        resHeaders.set('Access-Control-Allow-Origin', '*');
        resHeaders.set('Access-Control-Allow-Credentials', 'true');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: resHeaders,
        });
      } catch (err) {
        // Fallback to static asset if backend is unreachable for sitemap
        if (url.pathname === '/sitemap.xml' && env.ASSETS) {
          return env.ASSETS.fetch(request);
        }
        return new Response(
          JSON.stringify({
            success: false,
            message: `Backend connection failed: ${err.message || 'Server unreachable'}. Check that your backend (${backendBase}) is active.`,
            error: err.message,
            target: backendUrl,
          }),
          {
            status: 502,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'X-Proxy-Error': String(err.message || '502 Bad Gateway'),
            },
          }
        );
      }
    }

    // 2. For search engine / social crawlers requesting HTML pages, proxy to backend SEO prerenderer
    // so Bingbot/Googlebot receive route-specific meta tags, canonical URLs, JSON-LD, and 404 statuses.
    if (
      backendBase &&
      (request.method === 'GET' || request.method === 'HEAD') &&
      !hasFileExtension(url.pathname) &&
      isCrawlerRequest(request)
    ) {
      try {
        const backendUrl = `${backendBase}${url.pathname}${url.search}`;
        const response = await fetch(backendUrl, {
          method: request.method,
          headers: buildForwardHeaders(request, url),
          redirect: 'follow',
        });
        const contentType = response.headers.get('content-type') || '';
        if (response.status < 500 && contentType.includes('text/html')) {
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        }
      } catch {
        // Fall through to static SPA assets if backend prerender is unreachable
      }
    }

    // 3. Serve static frontend files (React SPA)
    return env.ASSETS.fetch(request);
  },
};
