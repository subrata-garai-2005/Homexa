export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Proxy /api/* to AWS EC2 Backend
    if (url.pathname.startsWith('/api')) {
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

      const backendUrl = `http://44.222.204.56:5000${url.pathname}${url.search}`;
      const forwardHeaders = new Headers(request.headers);
      forwardHeaders.delete('host');

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
