export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      });
    }

    // 2. Forward request directly to AWS EC2 Backend
    const backendUrl = `http://44.222.204.56:5000${url.pathname}${url.search}`;

    const newHeaders = new Headers(request.headers);
    newHeaders.delete('host');

    const init = {
      method: request.method,
      headers: newHeaders,
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
      return new Response(JSON.stringify({ error: err.message, target: backendUrl }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
