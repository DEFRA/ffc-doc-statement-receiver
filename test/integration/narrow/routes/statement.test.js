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

const createServer = require('../../../../app/server')

const { get, set, drop } = require('../../../../app/cache')

const apiVersions = require('../../../../app/constants/api-versions')

let server
let request
let version

let filename
let fileContent

describe('Statement route', () => {
  beforeEach(async () => {
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

  test('GET /{version}/statements/statement/{filename} route should set cache for filename', async () => {
    const cacheForFilenameBefore = await get(request, filename)
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    await server.inject(options)

    const cacheForFilenameAfter = await get(request, filename)
    expect(cacheForFilenameBefore).toBeNull()
    expect(cacheForFilenameAfter).toBeDefined()
  })

  test('GET /{version}/statements/statement/{filename} route should return response status code 200', async () => {
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
  })

  test('GET /{version}/statements/statement/{filename} route should return content type as pdf', async () => {
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.headers['content-type']).toBe('application/pdf')
  })

  test('GET /{version}/statements/statement/{filename} route should return content disposition header as attachment of the filename', async () => {
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.headers['content-disposition']).toBe(`attachment;filename=${filename}`)
  })

  test('GET /{version}/statements/statement/{filename} route should return connection header as keep-alive', async () => {
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.headers.connection).toBe('keep-alive')
  })

  test('GET /{version}/statements/statement/{filename} route should return cache control header as no', async () => {
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.headers['cache-control']).toBe('no-cache')
  })

  test('GET /{version}/statements/statement/{filename} route should return result as fileContent', async () => {
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.result).toBe(fileContent)
  })

  test('GET /{version}/statements/statement/{filename} route should return response status code 200 when filename exists in cache', async () => {
    set(request, filename, Buffer.from(fileContent))
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
  })

  test('GET /{version}/statements/statement/{filename} route should return content type as pdf when filename exists in cache', async () => {
    set(request, filename, Buffer.from(fileContent))
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.headers['content-type']).toBe('application/pdf')
  })

  test('GET /{version}/statements/statement/{filename} route should return content disposition header as attachment of the filename when filename exists in cache', async () => {
    set(request, filename, Buffer.from(fileContent))
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.headers['content-disposition']).toBe(`attachment;filename=${filename}`)
  })

  test('GET /{version}/statements/statement/{filename} route should return result as fileContent when filename exists in cache', async () => {
    set(request, filename, Buffer.from(fileContent))
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.result).toBe(fileContent)
  })

  test('GET /{version}/statements/statement/{filename} route should return status code 400 if version is not a valid one', async () => {
    version = 'notValidVersion'
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(400)
  })

  test('GET /{version}/statements/statement/{filename} route should return result message "Version must be one of: apiVersions" if version is not a valid one', async () => {
    version = 'notValidVersion'
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.result.message).toBe(`Version must be one of: ${apiVersions}.`)
  })

  test('GET /{version}/statements/statement/{filename} route should return response status code 404 when storage cannot retreive file', async () => {
    mockDownload.mockRejectedValue(new Error('Blob storage retreival issue'))
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(404)
  })

  test('GET /{version}/statements/statement/{filename} route should return response result message "filename does not exist" when storage cannot retreive file', async () => {
    mockDownload.mockRejectedValue(new Error('Blob storage retreival issue'))
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.result.message).toBe(`${filename} does not exist`)
  })

  test('GET /{version}/statements/statement/{filename} route should return response status code 200 when storage returns empty string', async () => {
    mockDownload.mockResolvedValue({
      readableStreamBody: Readable.from('', { encoding: 'utf8' })
    })
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
  })

  test('GET /{version}/statements/statement/{filename} route should return response status code 200 when storage returns empty array', async () => {
    mockDownload.mockResolvedValue({
      readableStreamBody: Readable.from([], { encoding: 'utf8' })
    })
    const options = {
      method: 'GET',
      url: `/${version}/statements/statement/${filename}`
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(200)
  })
})
