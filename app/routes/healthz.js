module.exports = [
  {
    method: 'GET',
    path: '/healthz',
    handler: (request, h) => h.response('ok').code(200)
  },

  // Following code added to handle AFD's synthetic health check probes
  {
    method: 'GET',
    path: '/{any*}',
    handler: (request, h) => {
      const ua = request.headers['user-agent'] || ''

      // Azure Front Door synthetic probes often have no UA or a minimal UA
      const looksLikeProbe =
        ua.includes('Azure Front Door') ||
        ua === '' ||
        request.method === 'head' ||
        request.url === '/'

      if (looksLikeProbe) {
        return h.response('ok').code(200)
      }

      // Otherwise behave like a normal 404
      return h.response({ error: 'Not Found' }).code(404)
    }
  }
]
