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

describe('get cache object', () => {
  test('should return defined', async () => {
    const result = await getCache(request)
    expect(result).toBeDefined()
  })

  test('should return request.server.app.cache', async () => {
    const result = await getCache(request)
    expect(result).toStrictEqual(request.server.app.cache)
  })

  test('should return rule.expiresIn as config.cache.ttl', async () => {
    const result = await getCache(request)
    expect(result.rule.expiresIn).toBe(config.cache.ttl)
  })

  test('should return ttl() as config.cache.ttl', async () => {
    const result = await getCache(request)
    expect(result.ttl()).toBe(config.cache.ttl)
  })

  test('should return _segment as config.cache.segment', async () => {
    const result = await getCache(request)
    expect(result._segment).toBe(config.cache.segment)
  })
})
