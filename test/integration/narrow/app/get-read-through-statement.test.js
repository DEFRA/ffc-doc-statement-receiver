const mockDownload = jest.fn()
jest.mock('@azure/storage-blob', () => {
  return {
    BlobServiceClient: {
      fromConnectionString: jest.fn().mockImplementation(() => {
        return {
          getContainerClient: jest.fn().mockImplementation(() => {
            return {
              createIfNotExists: jest.fn(),
              getBlockBlobClient: jest.fn().mockImplementation(() => {
                return {
                  download: mockDownload,
                  upload: jest.fn()
                }
              })
            }
          })
        }
      })
    }
  }
})

const { Readable } = require('stream')

const createServer = require('../../../../app/server')

const { get, set, drop } = require('../../../../app/cache')

const getReadThroughStatement = require('../../../../app/statement/get-read-through-statement')

let server
let request

let filename
let fileContent

describe('Get read through statement', () => {
  beforeEach(async () => {
    server = await createServer()
    request = { server: { app: { cache: server.app.cache } } }

    filename = require('../../../mock-components/filename')
    fileContent = require('../../../mock-components/file-content')

    mockDownload.mockResolvedValue({
      readableStreamBody: Readable.from(fileContent, { encoding: 'utf8' })
    })

    await server.initialize()
    await drop(request, filename)
  })

  afterEach(async () => {
    await drop(request, filename)
    await server.stop()
  })

  test('should return Buffer cache file', async () => {
    await set(request, filename, fileContent)
    const result = await getReadThroughStatement(request, filename)
    expect(result).toStrictEqual(Buffer.from(fileContent))
  })

  test('should return Buffer Blob file when filename not in cache', async () => {
    const result = await getReadThroughStatement(request, filename)
    expect(result).toStrictEqual(Buffer.from(fileContent))
  })

  test('should set cache for filename when filename not in cache', async () => {
    const cacheForFilenameBefore = await get(request, filename)

    await getReadThroughStatement(request, filename)

    const cacheForFilenameAfter = await get(request, filename)
    expect(cacheForFilenameBefore).toBeNull()
    expect(cacheForFilenameAfter).toBeDefined()
  })

  test('should throw when filename not in cache and Blob throws', async () => {
    mockDownload.mockRejectedValue(new Error('Blob storage retreival issue'))

    const wrapper = async () => {
      await getReadThroughStatement(request, filename)
    }

    expect(wrapper).rejects.toThrow()
  })

  test('should throw Error when filename not in cache and Blob throws', async () => {
    mockDownload.mockRejectedValue(new Error('Blob storage retreival issue'))

    const wrapper = async () => {
      await getReadThroughStatement(request, filename)
    }

    expect(wrapper).rejects.toThrow(Error)
  })

  test('should throw error with "filename does not exist" when filename not in cache and Blob throws', async () => {
    mockDownload.mockRejectedValue(new Error('Blob storage retreival issue'))

    const wrapper = async () => {
      await getReadThroughStatement(request, filename)
    }

    expect(wrapper).rejects.toThrow(`${filename} does not exist`)
  })
})
