jest.mock('../../../app/cache/get-cache')
const getCache = require('../../../app/cache/get-cache')

jest.mock('../../../app/cache/drop-cache-key')
const dropCacheKey = require('../../../app/cache/drop-cache-key')

const { drop } = require('../../../app/cache')
const key = 'Key'
let request

beforeEach(async () => {
  request = require('../../mock-components/request')
  getCache.mockReturnValue(request.server.app.cache)
  dropCacheKey.mockResolvedValue(undefined)
})

afterEach(async () => {
  jest.resetAllMocks()
})

describe('drop cache', () => {
  test.each([
    ['should call getCache', () => expect(getCache).toHaveBeenCalled()],
    ['should call getCache once', () => expect(getCache).toHaveBeenCalledTimes(1)],
    ['should call getCache with request', (req) => expect(getCache).toHaveBeenCalledWith(req)],
    ['should call dropCacheKey', () => expect(dropCacheKey).toHaveBeenCalled()],
    ['should call dropCacheKey once', () => expect(dropCacheKey).toHaveBeenCalledTimes(1)],
    ['should call dropCacheKey with getCache() and key', (req, k) =>
      expect(dropCacheKey).toHaveBeenCalledWith(getCache(), k)]
  ])('%s', async (_, assertion) => {
    await drop(request, key)
    assertion(request, key)
  })

  test('should return undefined', async () => {
    const result = await drop(request, key)
    expect(result).toBeUndefined()
  })

  describe.each([
    ['getCache throws', () => getCache.mockImplementation(() => { throw new Error('Redis retrieval error') }), 'Redis retrieval error'],
    ['dropCacheKey rejects', () => dropCacheKey.mockRejectedValue(new Error('Redis drop error')), 'Redis drop error']
  ])('error handling when %s', (_, setup, message) => {
    beforeEach(setup)

    test.each([
      ['throws generic error', async () => {
        await expect(drop(request, key)).rejects.toThrowError()
      }],
      ['throws Error instance', async () => {
        await expect(drop(request, key)).rejects.toThrowError(Error)
      }],
      [`throws message "${message}"`, async () => {
        await expect(drop(request, key)).rejects.toThrowError(new RegExp(`^${message}$`))
      }]
    ])('%s', async (_, assertion) => {
      await assertion()
    })
  })
})
