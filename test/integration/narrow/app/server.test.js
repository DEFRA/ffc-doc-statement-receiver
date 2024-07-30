const Hapi = require('@hapi/hapi')
const createServer = require('../../../../app/server')
const config = require('../../../../app/config')

jest.mock('@hapi/hapi')
jest.mock('../../../../app/config')

describe('Server test', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('createServer returns server', async () => {
    const mockServer = {
      register: jest.fn(),
      cache: jest.fn().mockReturnValue({}),
      app: {}
    }
    Hapi.server.mockReturnValue(mockServer)
    config.port = 3000
    config.cache = {
      cacheName: 'testCache',
      catbox: jest.fn(),
      catboxOptions: {},
      segment: 'testSegment',
      ttl: 1000
    }

    const server = await createServer()
    expect(server).toBeDefined()
    expect(logSpy).toHaveBeenCalledWith('Server created successfully')
  })

  test('createServer throws error on failure', async () => {
    const mockError = new Error('Test Error')
    Hapi.server.mockImplementation(() => { throw mockError })

    await expect(createServer()).rejects.toThrow('Test Error')
    expect(errorSpy).toHaveBeenCalledWith('Error creating server:', mockError)
  })
})
