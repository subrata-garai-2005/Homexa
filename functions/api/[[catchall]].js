export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Target Backend API
  const backendBase = (env.BACKEND_URL || '').replace(/\/+$/, '');

  if (!backendBase) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'BACKEND_URL environment variable is not configured in Cloudflare Pages.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }

  const targetUrl = `${backendBase}${url.pathname}${url.search}`;

  // Handle CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': url.origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  // Forward headers to backend
  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.delete('host');
  // Forward real client IP to prevent shared rate-limiting DoS
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
  if (clientIp) {
    forwardHeaders.set('X-Forwarded-For', clientIp);
  }
  forwardHeaders.delete('cf-connecting-ip');
  forwardHeaders.delete('cf-ray');
  forwardHeaders.delete('cf-visitor');
  forwardHeaders.set('X-Forwarded-Host', url.host);
  forwardHeaders.set('X-Forwarded-Proto', 'https');

  const init = {
    method: request.method,
    headers: forwardHeaders,
    redirect: 'follow',
  };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && request.body) {
    init.body = request.body;
  }

  try {
    const response = await fetch(targetUrl, init);

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', url.origin);
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Cloudflare Proxy could not reach Backend',
        error: err.message,
        target: targetUrl,
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
