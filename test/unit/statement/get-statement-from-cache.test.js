jest.mock('../../../app/cache')
const { get } = require('../../../app/cache')

const getStatementFromCache = require('../../../app/statement/get-statement-from-cache')

let request
let filename
let fileContent

describe('Get statement file from cache', () => {
  beforeEach(() => {
    request = require('../../mock-components/request')
    filename = require('../../mock-components/filename')
    fileContent = require('../../mock-components/file-content')

    get.mockResolvedValue(Buffer.from(fileContent))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('normal flow', () => {
    test.each([
      ['calls get', () => expect(get).toHaveBeenCalled()],
      ['calls get once', () => expect(get).toHaveBeenCalledTimes(1)],
      ['calls get with request and filename', () => expect(get).toHaveBeenCalledWith(request, filename)]
    ])('%s', async (_, assertion) => {
      await getStatementFromCache(request, filename)
      assertion()
    })

    test('returns Buffer.from(get)', async () => {
      const result = await getStatementFromCache(request, filename)
      expect(result).toStrictEqual(Buffer.from(await get()))
    })
  })

  describe('returns undefined when get returns null or undefined', () => {
    test.each([
      ['get returns null', null],
      ['get returns undefined', undefined]
    ])('%s', async (_, value) => {
      get.mockResolvedValue(value)
      const result = await getStatementFromCache(request, filename)
      expect(result).toBeUndefined()
    })
  })
})
