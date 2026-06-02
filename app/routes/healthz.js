const HTTP_OK = 200
const HTTP_NOT_FOUND = 404

module.exports = [

  {
    method: 'GET',
    path: '/healthz',
    handler: (_request, h) => h.response('ok').code(HTTP_OK)
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
        request.url.pathname === '/'

      if (looksLikeProbe) {
        return h.response('ok').code(HTTP_OK)
      }

      // Otherwise behave like a normal 404
      return h.response({ error: 'Not Found' }).code(HTTP_NOT_FOUND)
    }
  }
]
