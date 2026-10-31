export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Target AWS Backend (uses BACKEND_URL env var if set, otherwise defaults to the EC2 URL)
  const backendBase = (env.BACKEND_URL || 'http://44.222.204.56:5000').replace(/\/+$/, '');
  const targetUrl = `${backendBase}${url.pathname}${url.search}`;

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

  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.set('X-Forwarded-Host', url.host);
  forwardHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

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
        message: 'Cloudflare could not reach AWS Backend. Check if EC2 is running and Port 5000 is open in Security Group.',
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

