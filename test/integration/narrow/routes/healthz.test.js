let createServer
let server
describe('Healthz test', () => {
  beforeEach(async () => {
    createServer = require('../../../../app/server')
    server = await createServer()
    await server.start()
  })

  test('GET /healthz route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/healthz'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
