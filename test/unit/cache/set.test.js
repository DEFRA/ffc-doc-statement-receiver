jest.mock('../../../app/cache/get-cache')
const getCache = require('../../../app/cache/get-cache')

jest.mock('../../../app/cache/set-cache-value')
const setCacheValue = require('../../../app/cache/set-cache-value')

const { set } = require('../../../app/cache')

const key = 'Key'
const value = 'Value'
let request

beforeEach(async () => {
  request = require('../../mock-components/request')
  getCache.mockReturnValue(request.server.app.cache)
  setCacheValue.mockResolvedValue(undefined)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('set cache', () => {
  // Call assertions
  test.each([
    ['should call getCache', () => expect(getCache).toHaveBeenCalled()],
    ['should call getCache once', () => expect(getCache).toHaveBeenCalledTimes(1)],
    ['should call getCache with request', (r) => expect(getCache).toHaveBeenCalledWith(r)],
    ['should call setCacheValue', () => expect(setCacheValue).toHaveBeenCalled()],
    ['should call setCacheValue once', () => expect(setCacheValue).toHaveBeenCalledTimes(1)],
    ['should call setCacheValue with getCache, key and value', () =>
      expect(setCacheValue).toHaveBeenCalledWith(getCache(), key, value)]
  ])('%s', async (_, assertion) => {
    await set(request, key, value)
    assertion(request)
  })

  test('should return undefined', async () => {
    const result = await set(request, key, value)
    expect(result).toBeUndefined()
  })

  // Error handling
  describe.each([
    ['getCache throws', () => getCache.mockImplementation(() => { throw new Error('Redis retrieval error') }), 'Redis retrieval error'],
    ['setCacheValue throws', () => setCacheValue.mockRejectedValue(new Error('Redis write error')), 'Redis write error']
  ])('error handling when %s', (_, setup, message) => {
    beforeEach(setup)

    test.each([
      ['throws generic error', async () => {
        await expect(set(request, key, value)).rejects.toThrowError()
      }],
      ['throws Error instance', async () => {
        await expect(set(request, key, value)).rejects.toThrowError(Error)
      }],
      [`throws message "${message}"`, async () => {
        await expect(set(request, key, value)).rejects.toThrowError(new RegExp(`^${message}$`))
      }]
    ])('%s', async (_, assertion) => {
      await assertion()
    })
  })
})
