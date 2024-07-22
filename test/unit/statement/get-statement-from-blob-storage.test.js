const { Readable } = require('stream')

jest.mock('../../../app/storage')
const { getFileStream } = require('../../../app/storage')

jest.mock('../../../app/stream-to-buffer')
const streamToBuffer = require('../../../app/stream-to-buffer')

const getStatementFromBlobStorage = require('../../../app/statement/get-statement-from-blob-storage')

let request
let filename
let fileContent

describe('Get statement file from Blob Storage', () => {
  beforeEach(async () => {
    request = require('../../mock-components/request')
    filename = require('../../mock-components/filename')
    fileContent = require('../../mock-components/file-content')

    getFileStream.mockResolvedValue({
      readableStreamBody: Readable.from(fileContent, { encoding: 'utf8' })
    })
    streamToBuffer.mockResolvedValue(Buffer.from(fileContent))
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call getFileStream', async () => {
    await getStatementFromBlobStorage(request, filename)
    expect(getFileStream).toHaveBeenCalled()
  })

  test('should call getFileStream once', async () => {
    await getStatementFromBlobStorage(request, filename)
    expect(getFileStream).toHaveBeenCalledTimes(1)
  })

  test('should call getFileStream with filename', async () => {
    await getStatementFromBlobStorage(request, filename)
    expect(getFileStream).toHaveBeenCalledWith(filename)
  })

  test('should call streamToBuffer', async () => {
    await getStatementFromBlobStorage(request, filename)
    expect(streamToBuffer).toHaveBeenCalled()
  })

  test('should call streamToBuffer once', async () => {
    await getStatementFromBlobStorage(request, filename)
    expect(streamToBuffer).toHaveBeenCalledTimes(1)
  })

  test('should call streamToBuffer with getFileStream().readableStreamBody', async () => {
    await getStatementFromBlobStorage(request, filename)
    expect(streamToBuffer).toHaveBeenCalledWith((await getFileStream()).readableStreamBody)
  })

  test('should return streamToBuffer', async () => {
    const result = await getStatementFromBlobStorage(request, filename)
    expect(result).toStrictEqual(await streamToBuffer())
  })

  test('should not call streamToBuffer when getFileStream throws', async () => {
    getFileStream.mockRejectedValue(new Error(`${filename} does not exist`))
    try { await getStatementFromBlobStorage(request, filename) } catch {}
    expect(streamToBuffer).not.toHaveBeenCalled()
  })

  test('should throw when getFileStream throws', async () => {
    getFileStream.mockRejectedValue(new Error(`${filename} does not exist`))

    const wrapper = async () => {
      await getStatementFromBlobStorage(request, filename)
    }

    expect(wrapper).rejects.toThrow()
  })

  test('should throw when streamToBuffer throws', async () => {
    streamToBuffer.mockRejectedValue(new Error('Issue converting file stream to Buffer'))

    const wrapper = async () => {
      await getStatementFromBlobStorage(request, filename)
    }

    expect(wrapper).rejects.toThrow()
  })
})
