const config = require('../../../../app/config')

let createServer
let server
let version
let filename

describe('disabledEndpoint', () => {
  beforeEach(async () => {
    config.endpointEnabled = false
    createServer = require('../../../../app/server')
    server = await createServer()
    await server.initialize()

    version = require('../../../mock-components/version')
    filename = require('../../../mock-components/filename')
  })

  afterEach(async () => {
    await server.stop()
  })

  test.each([
    ['GET /{version}/statements/statement/{filename} returns 503 if endpoint disabled', (v, f) => `/${v}/statements/statement/${f}`, 503, 'statusCode'],
    ['GET /{version}/statements/statement/{filename} returns disabled message if endpoint disabled', (v, f) => `/${v}/statements/statement/${f}`, 'Service is intentionally disabled in this environment', 'payload'],
    ['GET /healthy returns 200 if endpoint disabled', () => '/healthy', 200, 'statusCode'],
    ['GET /healthz returns 200 if endpoint disabled', () => '/healthz', 200, 'statusCode']
  ])('should verify %s', async (_, getUrl, expected, property) => {
    const options = { method: 'GET', url: getUrl(version, filename) }
    const response = await server.inject(options)
    expect(response[property]).toBe(expected)
  })
})
