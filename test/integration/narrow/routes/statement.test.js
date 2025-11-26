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

jest.mock('../../../../app/alert', () => {
  return {
    sendAlert: jest.fn()
  }
})

const { Readable } = require('stream')
const { get, set, drop } = require('../../../../app/cache')
const createServer = require('../../../../app/server')
const apiVersions = require('../../../../app/constants/api-versions')

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn().mockImplementation(() => ({
      getContainerClient: jest.fn().mockImplementation(() => ({
        createIfNotExists: jest.fn(),
        getBlockBlobClient: jest.fn().mockImplementation(() => ({
          download: mockDownload,
          upload: jest.fn()
        }))
      }))
    }))
  }
}))

let server
let request
let version
let filename
let fileContent

describe('Statement route', () => {
  beforeEach(async () => {
    jest.resetModules()
    server = await createServer()
    request = { server: { app: { cache: server.app.cache } } }

    version = require('../../../mock-components/version')
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

  const getRoute = (ver = version, name = filename) => ({
    method: 'GET',
    url: `/${ver}/statements/statement/${name}`
  })

  test('sets cache for filename when first retrieved', async () => {
    const before = await get(request, filename)
    expect(before).toBeNull()

    await server.inject(getRoute())

    const after = await get(request, filename)
    expect(after).toBeDefined()
  })

  test('returns 200 when file retrieved successfully', async () => {
    const response = await server.inject(getRoute())
    expect(response.statusCode).toBe(200)
  })

  test.each([
    ['content-type', 'application/pdf'],
    ['content-disposition', (filename) => `attachment;filename=${filename}`],
    ['connection', 'keep-alive'],
    ['cache-control', 'no-cache']
  ])('returns header %s correctly', async (header, expected) => {
    const response = await server.inject(getRoute())
    const expectedValue = typeof expected === 'function' ? expected(filename) : expected
    expect(response.headers[header]).toBe(expectedValue)
  })

  test('returns file content as result', async () => {
    const response = await server.inject(getRoute())
    expect(response.result).toBe(fileContent)
  })

  describe('when filename exists in cache', () => {
    beforeEach(async () => {
      await set(request, filename, Buffer.from(fileContent))
    })

    test('returns 200', async () => {
      const response = await server.inject(getRoute())
      expect(response.statusCode).toBe(200)
    })

    test.each([
      ['content-type', 'application/pdf'],
      ['content-disposition', (filename) => `attachment;filename=${filename}`]
    ])('returns cached header %s correctly', async (header, expected) => {
      const response = await server.inject(getRoute())
      const expectedValue = typeof expected === 'function' ? expected(filename) : expected
      expect(response.headers[header]).toBe(expectedValue)
    })

    test('returns cached file content', async () => {
      const response = await server.inject(getRoute())
      expect(response.result).toBe(fileContent)
    })
  })

  describe('when version is invalid', () => {
    test('returns 400 and correct message', async () => {
      const invalidVersion = 'invalidVersion'
      const response = await server.inject(getRoute(invalidVersion))
      expect(response.statusCode).toBe(400)
      expect(response.result.message).toBe(`Version must be one of: ${apiVersions}.`)
    })
  })

  describe('when blob storage retrieval fails', () => {
    beforeEach(() => {
      mockDownload.mockRejectedValue(new Error('Blob storage retrieval issue'))
    })

    test('returns 404 and message that filename does not exist', async () => {
      const response = await server.inject(getRoute())
      expect(response.statusCode).toBe(404)
      expect(response.result.message).toBe(`${filename} does not exist`)
    })
  })

  describe('when blob returns empty data', () => {
    test.each([
      ['empty string', ''],
      ['empty array', []]
    ])('returns 200 when stream is %s', async (_, streamContent) => {
      mockDownload.mockResolvedValue({
        readableStreamBody: Readable.from(streamContent, { encoding: 'utf8' })
      })
      const response = await server.inject(getRoute())
      expect(response.statusCode).toBe(200)
    })
  })
})
