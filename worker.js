export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Proxy /api/* and dynamic sitemap to Backend API
    if (url.pathname.startsWith('/api') || url.pathname === '/sitemap.xml' || url.pathname === '/sitemap.xsl') {
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

      const backendBase = (env.BACKEND_URL || '').replace(/\/+$/, '');

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
      const forwardHeaders = new Headers(request.headers);
      forwardHeaders.delete('host');
      const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
      if (clientIp) {
        forwardHeaders.set('X-Forwarded-For', clientIp);
      }
      forwardHeaders.set('X-Forwarded-Host', url.host);
      forwardHeaders.set('X-Forwarded-Proto', 'https');

      const init = {
        method: request.method,
        headers: forwardHeaders,
        redirect: 'follow',
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        init.body = request.body;
      }

      try {
        const response = await fetch(backendUrl, init);
        const resHeaders = new Headers(response.headers);
        resHeaders.set('Access-Control-Allow-Origin', '*');
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
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    // 2. Serve static frontend files (React SPA)
    return env.ASSETS.fetch(request);
  },
};
