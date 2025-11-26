jest.mock('../../../app/cache')
const { set } = require('../../../app/cache')

jest.mock('../../../app/statement/get-statement-from-cache')
const getStatementFromCache = require('../../../app/statement/get-statement-from-cache')

jest.mock('../../../app/statement/get-statement-from-blob-storage')
const getStatementFromBlobStorage = require('../../../app/statement/get-statement-from-blob-storage')

const getReadThroughStatement = require('../../../app/statement')

let request
let filename
let fileContent

describe('Return statement from either cache or Blob Storage', () => {
  beforeEach(async () => {
    request = require('../../mock-components/request')
    filename = require('../../mock-components/filename')
    fileContent = require('../../mock-components/file-content')

    getStatementFromCache.mockResolvedValue(fileContent)
    getStatementFromBlobStorage.mockResolvedValue(fileContent)
    set.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when cache returns a value', () => {
    test.each([
      ['calls getStatementFromCache', () => expect(getStatementFromCache).toHaveBeenCalled()],
      ['calls getStatementFromCache once', () => expect(getStatementFromCache).toHaveBeenCalledTimes(1)],
      ['calls getStatementFromCache with request and filename', () => expect(getStatementFromCache).toHaveBeenCalledWith(request, filename)],
      ['does not call getStatementFromBlobStorage', () => expect(getStatementFromBlobStorage).not.toHaveBeenCalled()],
      ['does not call set', () => expect(set).not.toHaveBeenCalled()]
    ])('%s', async (_, assertion) => {
      await getReadThroughStatement(request, filename)
      assertion()
    })

    test('returns cache value', async () => {
      const result = await getReadThroughStatement(request, filename)
      expect(result).toStrictEqual(await getStatementFromCache())
    })
  })

  describe('when cache returns undefined', () => {
    beforeEach(() => getStatementFromCache.mockResolvedValue(undefined))

    test.each([
      ['calls getStatementFromBlobStorage', () => expect(getStatementFromBlobStorage).toHaveBeenCalled()],
      ['calls getStatementFromBlobStorage once', () => expect(getStatementFromBlobStorage).toHaveBeenCalledTimes(1)],
      ['calls getStatementFromBlobStorage with request and filename', () => expect(getStatementFromBlobStorage).toHaveBeenCalledWith(request, filename)],
      ['calls set', () => expect(set).toHaveBeenCalled()],
      ['calls set once', () => expect(set).toHaveBeenCalledTimes(1)],
      ['calls set with request, filename and blob value', async () => expect(set).toHaveBeenCalledWith(request, filename, await getStatementFromBlobStorage())]
    ])('%s', async (_, assertion) => {
      await getReadThroughStatement(request, filename)
      await assertion()
    })

    test('returns blob value', async () => {
      const result = await getReadThroughStatement(request, filename)
      expect(result).toStrictEqual(await getStatementFromBlobStorage())
    })
  })

  describe('error handling', () => {
    const scenarios = [
      ['cache throws', async () => {
        getStatementFromCache.mockRejectedValue(new Error('Redis retrieval issue'))
      }],
      ['blob throws', async () => {
        getStatementFromCache.mockResolvedValue(undefined)
        getStatementFromBlobStorage.mockRejectedValue(new Error('Blob Storage retrieval issue'))
      }],
      ['set throws', async () => {
        getStatementFromCache.mockResolvedValue(undefined)
        set.mockRejectedValue(new Error('Redis save down issue'))
      }]
    ]

    test.each(scenarios)('%s', async (_, setup) => {
      await setup() // configure mocks
      await expect(getReadThroughStatement(request, filename)).rejects.toThrow()
    })

    test('does not call blob or set when cache throws', async () => {
      getStatementFromCache.mockRejectedValue(new Error('Redis retrieval issue'))
      try { await getReadThroughStatement(request, filename) } catch {}
      expect(getStatementFromBlobStorage).not.toHaveBeenCalled()
      expect(set).not.toHaveBeenCalled()
    })

    test('does not call set when blob throws', async () => {
      getStatementFromCache.mockResolvedValue(undefined)
      getStatementFromBlobStorage.mockRejectedValue(new Error('Blob Storage retrieval issue'))
      try { await getReadThroughStatement(request, filename) } catch {}
      expect(set).not.toHaveBeenCalled()
    })
  })
})
