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

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call getStatementFromCache', async () => {
    await getReadThroughStatement(request, filename)
    expect(getStatementFromCache).toHaveBeenCalled()
  })

  test('should call getStatementFromCache once', async () => {
    await getReadThroughStatement(request, filename)
    expect(getStatementFromCache).toHaveBeenCalledTimes(1)
  })

  test('should call getStatementFromCache with request and filename', async () => {
    await getReadThroughStatement(request, filename)
    expect(getStatementFromCache).toHaveBeenCalledWith(request, filename)
  })

  test('should return getStatementFromCache', async () => {
    const result = await getReadThroughStatement(request, filename)
    expect(result).toStrictEqual(await getStatementFromCache())
  })

  test('should not call getStatementFromBlobStorage', async () => {
    await getReadThroughStatement(request, filename)
    expect(getStatementFromBlobStorage).not.toHaveBeenCalled()
  })

  test('should not call set', async () => {
    await getReadThroughStatement(request, filename)
    expect(set).not.toHaveBeenCalled()
  })

  test('should call getStatementFromBlobStorage when getStatementFromCache returns undefined', async () => {
    getStatementFromCache.mockResolvedValue(undefined)
    await getReadThroughStatement(request, filename)
    expect(getStatementFromBlobStorage).toHaveBeenCalled()
  })

  test('should call getStatementFromBlobStorage once when getStatementFromCache returns undefined', async () => {
    getStatementFromCache.mockResolvedValue(undefined)
    await getReadThroughStatement(request, filename)
    expect(getStatementFromBlobStorage).toHaveBeenCalledTimes(1)
  })

  test('should call getStatementFromBlobStorage with request and filename when getStatementFromCache returns undefined', async () => {
    getStatementFromCache.mockResolvedValue(undefined)
    await getReadThroughStatement(request, filename)
    expect(getStatementFromBlobStorage).toHaveBeenCalledWith(request, filename)
  })

  test('should call set when getStatementFromCache returns undefined', async () => {
    getStatementFromCache.mockResolvedValue(undefined)
    await getReadThroughStatement(request, filename)
    expect(set).toHaveBeenCalled()
  })

  test('should call set once when getStatementFromCache returns undefined', async () => {
    getStatementFromCache.mockResolvedValue(undefined)
    await getReadThroughStatement(request, filename)
    expect(set).toHaveBeenCalledTimes(1)
  })

  test('should call set with request, filename and getStatementFromBlobStorage when getStatementFromCache returns undefined', async () => {
    getStatementFromCache.mockResolvedValue(undefined)
    await getReadThroughStatement(request, filename)
    expect(set).toHaveBeenCalledWith(request, filename, await getStatementFromBlobStorage())
  })

  test('should return getStatementFromBlobStorage when getStatementFromCache returns undefined', async () => {
    getStatementFromCache.mockResolvedValue(undefined)
    const result = await getReadThroughStatement(request, filename)
    expect(result).toStrictEqual(await getStatementFromBlobStorage())
  })

  test('should throw when getStatementFromCache throws', async () => {
    getStatementFromCache.mockRejectedValue(new Error('Redis retrieval issue'))

    const wrapper = async () => {
      await getReadThroughStatement(request, filename)
    }

    expect(wrapper).rejects.toThrow()
  })

  test('should not call getStatementFromBlobStorage when getStatementFromCache throws', async () => {
    getStatementFromCache.mockRejectedValue(new Error('Redis retrieval issue'))
    try { await getReadThroughStatement(request, filename) } catch {}
    expect(getStatementFromBlobStorage).not.toHaveBeenCalled()
  })

  test('should not call set when getStatementFromCache throws', async () => {
    getStatementFromCache.mockRejectedValue(new Error('Redis retrieval issue'))
    try { await getReadThroughStatement(request, filename) } catch {}
    expect(set).not.toHaveBeenCalled()
  })

  test('should throw when getStatementFromCache returns undefined and getStatementFromCache throws', async () => {
    getStatementFromCache.mockRejectedValue(new Error('Redis retrieval issue'))

    const wrapper = async () => {
      await getReadThroughStatement(request, filename)
    }

    expect(wrapper).rejects.toThrow()
  })

  test('should throw when when getStatementFromCache returns undefined and getStatementFromBlobStorage throws', async () => {
    getStatementFromCache.mockResolvedValue(undefined)
    getStatementFromBlobStorage.mockRejectedValue(new Error('Blob Storage retrieval issue'))

    const wrapper = async () => {
      await getReadThroughStatement(request, filename)
    }

    expect(wrapper).rejects.toThrow()
  })

  test('should not call set when getStatementFromCache returns undefined and getStatementFromBlobStorage throws', async () => {
    getStatementFromCache.mockResolvedValue(undefined)
    getStatementFromBlobStorage.mockRejectedValue(new Error('Blob Storage retrieval issue'))

    try { await getReadThroughStatement(request, filename) } catch {}

    expect(set).not.toHaveBeenCalled()
  })

  test('should throw when when getStatementFromCache returns undefined and set throws', async () => {
    getStatementFromCache.mockResolvedValue(undefined)
    set.mockRejectedValue(new Error('Redis save down issue'))

    const wrapper = async () => {
      await getReadThroughStatement(request, filename)
    }

    expect(wrapper).rejects.toThrow()
  })
})
