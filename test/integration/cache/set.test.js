const config = require('../../../app/config')
const createServer = require('../../../app/server')

const { set, drop } = require('../../../app/cache')
const getCache = require('../../../app/cache/get-cache')
const getCacheValue = require('../../../app/cache/get-cache-value')

let key
let value
let request
let server

beforeEach(async () => {
  server = await createServer()
  await server.initialize()

  const options = {
    method: 'GET',
    url: '/set'
  }

  key = 'Key'
  value = 'Value'
  request = (await server.inject(options)).request
})

afterEach(async () => {
  await drop(request, key)
  jest.resetAllMocks()
})

describe('set cache', () => {
  test('should return undefined', async () => {
    const result = await set(request, key, value)
    expect(result).toBeUndefined()
  })

  test('should populate cache with key', async () => {
    await set(request, key, value)

    const result = await getCacheValue(getCache(request), key)
    expect(result).toBeDefined()
  })

  test('should populate cache with value', async () => {
    await set(request, key, value)

    const result = await getCacheValue(getCache(request), key)
    expect(result).toBe(value)
  })

  test('should populate cache with empty array value', async () => {
    value = []

    await set(request, key, value)

    const result = await getCacheValue(getCache(request), key)
    expect(result).toStrictEqual(value)
  })

  test('should populate cache with empty object value', async () => {
    value = {}

    await set(request, key, value)

    const result = await getCacheValue(getCache(request), key)
    expect(result).toStrictEqual(value)
  })

  test('should populate cache with true value', async () => {
    value = true

    await set(request, key, value)

    const result = await getCacheValue(getCache(request), key)
    expect(result).toBe(value)
  })

  test('should populate cache with false value', async () => {
    value = false

    await set(request, key, value)

    const result = await getCacheValue(getCache(request), key)
    expect(result).toBe(false)
  })

  test('should not populate cache with null value', async () => {
    value = null

    await set(request, key, value)

    const result = await getCacheValue(getCache(request), key)
    expect(result).toBeNull()
  })

  test('should not populate cache with undefined value and throw when trying to retreive', async () => {
    value = undefined

    await set(request, key, value)

    const wrapper = async () => {
      await getCacheValue(getCache(request), key)
    }
    expect(wrapper).rejects.toThrowError()
  })

  test('should have cache value expire after config.cache.ttl has passed', async () => {
    await set(request, key, value)

    const beforeTtlTimeout = await getCacheValue(getCache(request), key)

    jest.useFakeTimers()
    jest.setSystemTime(new Date(new Date().getTime() + config.cache.ttl + 999))
    const afterTtlTimeout = await getCacheValue(getCache(request), key)

    expect(beforeTtlTimeout).toBe(value)
    expect(afterTtlTimeout).toBeNull()
  })
})
