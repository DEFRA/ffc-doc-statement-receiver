const createServer = require('../../app/server')
jest.mock('../../app/server')

describe('Server initialization', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should start the server and log the URI', async () => {
    const mockStart = jest.fn().mockResolvedValue(undefined)
    const mockServer = { start: mockStart, info: { uri: 'http://localhost:3022' } }
    createServer.mockResolvedValue(mockServer)

    jest.isolateModules(() => {
      require('../../app/index')
    })

    await new Promise(process.nextTick)
    expect(mockStart).toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith('Server running on %s', 'http://localhost:3022')
  })

  test('handles unhandledRejection by logging the error and exiting with status 1', async () => {
    require('../../app/index')

    process.emit('unhandledRejection', new Error('Test Error'))

    await new Promise(process.nextTick)

    expect(logSpy).toHaveBeenCalledWith(expect.any(Error))
    expect(exitSpy).toHaveBeenCalledWith(1)
  })
})
