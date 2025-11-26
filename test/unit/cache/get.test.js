jest.mock('../../../app/cache/get-cache')
const getCache = require('../../../app/cache/get-cache')

jest.mock('../../../app/cache/get-cache-value')
const getCacheValue = require('../../../app/cache/get-cache-value')

const { get } = require('../../../app/cache')

const key = 'Key'
let request

beforeEach(async () => {
  request = require('../../mock-components/request')

  getCache.mockReturnValue(request.server.app.cache)
  getCacheValue.mockResolvedValue(request.server.app.cache.key)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('get cache', () => {
  test.each([
    ['should call getCache', () => expect(getCache).toHaveBeenCalled()],
    ['should call getCache once', () => expect(getCache).toHaveBeenCalledTimes(1)],
    ['should call getCache with request', (r) => expect(getCache).toHaveBeenCalledWith(r)]
  ])('%s', async (_, assertion) => {
    await get(request, key)
    assertion(request)
  })

  test.each([
    ['should call getCacheValue', () => expect(getCacheValue).toHaveBeenCalled()],
    ['should call getCacheValue once', () => expect(getCacheValue).toHaveBeenCalledTimes(1)],
    ['should call getCacheValue with getCache and key', () =>
      expect(getCacheValue).toHaveBeenCalledWith(getCache(), key)]
  ])('%s', async (_, assertion) => {
    await get(request, key)
    assertion()
  })

  test('should return getCacheValue', async () => {
    const result = await get(request, key)
    expect(result).toStrictEqual(await getCacheValue())
  })

  test('should return null when getCacheValue returns null', async () => {
    getCacheValue.mockResolvedValue(null)
    const result = await get(request, key)
    expect(result).toBeNull()
  })

  test.each([
    ['getCache throws', () => getCache.mockImplementation(() => { throw new Error('Redis retrieval error') })],
    ['getCacheValue throws', () => getCacheValue.mockRejectedValue(new Error('Redis retrieval error'))]
  ])('should return undefined when %s', async (_, setup) => {
    setup()
    const result = await get(request, key)
    expect(result).toBeUndefined()
  })
})
