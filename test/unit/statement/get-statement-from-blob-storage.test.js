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
  beforeEach(() => {
    request = require('../../mock-components/request')
    filename = require('../../mock-components/filename')
    fileContent = require('../../mock-components/file-content')

    getFileStream.mockResolvedValue({
      readableStreamBody: Readable.from(fileContent, { encoding: 'utf8' })
    })
    streamToBuffer.mockResolvedValue(Buffer.from(fileContent))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('normal flow', () => {
    test.each([
      ['calls getFileStream', () => expect(getFileStream).toHaveBeenCalled()],
      ['calls getFileStream once', () => expect(getFileStream).toHaveBeenCalledTimes(1)],
      ['calls getFileStream with filename', () => expect(getFileStream).toHaveBeenCalledWith(filename)],
      ['calls streamToBuffer', () => expect(streamToBuffer).toHaveBeenCalled()],
      ['calls streamToBuffer once', () => expect(streamToBuffer).toHaveBeenCalledTimes(1)],
      ['calls streamToBuffer with readableStreamBody', async () => expect(streamToBuffer).toHaveBeenCalledWith((await getFileStream()).readableStreamBody)]
    ])('%s', async (_, assertion) => {
      await getStatementFromBlobStorage(request, filename)
      await assertion()
    })

    test('returns Buffer from streamToBuffer', async () => {
      const result = await getStatementFromBlobStorage(request, filename)
      expect(result).toStrictEqual(await streamToBuffer())
    })
  })

  describe('error handling', () => {
    test.each([
      ['getFileStream throws', async () => {
        getFileStream.mockRejectedValue(new Error(`${filename} does not exist`))
        await expect(getStatementFromBlobStorage(request, filename)).rejects.toThrow()
        expect(streamToBuffer).not.toHaveBeenCalled()
      }],
      ['streamToBuffer throws', async () => {
        streamToBuffer.mockRejectedValue(new Error('Issue converting file stream to Buffer'))
        await expect(getStatementFromBlobStorage(request, filename)).rejects.toThrow()
      }]
    ])('%s', async (_, testFn) => {
      await testFn()
    })
  })
})
