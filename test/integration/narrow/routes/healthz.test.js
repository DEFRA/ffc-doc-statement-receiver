let createServer
let server

describe('Healthz and synthetic probe tests', () => {
  beforeEach(async () => {
    createServer = require('../../../../app/server')
    server = await createServer()
    await server.start()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('GET /healthz returns 200', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/healthz'
    })
    expect(response.statusCode).toBe(200)
    expect(response.payload).toBe('ok')
  })

  test('GET / returns 200 for synthetic probe fallback', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(response.statusCode).toBe(200)
  })
})
