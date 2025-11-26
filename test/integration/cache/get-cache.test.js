const config = require('../../../app/config')
const createServer = require('../../../app/server')
const getCache = require('../../../app/cache/get-cache')

let request
let server

beforeEach(async () => {
  server = await createServer()
  await server.initialize()

  const options = {
    method: 'GET',
    url: '/get'
  }

  request = (await server.inject(options)).request
})

afterEach(async () => {
  jest.resetAllMocks()
})

describe('getCache', () => {
  test('should return defined', async () => {
    const result = await getCache(request)
    expect(result).toBeDefined()
  })

  test.each([
    ['request.server.app.cache', (result, request) => result, (request) => request.server.app.cache],
    ['rule.expiresIn as config.cache.ttl', (result) => result.rule.expiresIn, () => config.cache.ttl],
    ['ttl() as config.cache.ttl', (result) => result.ttl(), () => config.cache.ttl],
    ['_segment as config.cache.segment', (result) => result._segment, () => config.cache.segment]
  ])('should return %s', async (_, getResultValue, getExpectedValue) => {
    const result = await getCache(request)
    expect(getResultValue(result, request)).toStrictEqual(getExpectedValue(request))
  })
})
