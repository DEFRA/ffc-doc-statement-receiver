const createServer = require('../../app/server')
jest.mock('../../app/server')
jest.mock('ffc-alerting-utils', () => {
  return {
    init: jest.fn().mockResolvedValue()
  }
})

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

  test('Should init alerting', async () => {
    jest.isolateModules(() => {
      require('../../app/index')
    })

    await new Promise(process.nextTick)
    const { init } = require('ffc-alerting-utils')
    expect(init).toHaveBeenCalled()
  })

  test('should use environment vairables if alerting init return false', async () => {
    const { init } = require('ffc-alerting-utils')
    init.mockResolvedValueOnce(false)

    jest.isolateModules(() => {
      require('../../app/index')
    })

    await new Promise(process.nextTick)
    expect(init).toHaveBeenCalled()
  })

  test('should set environment variables when alerting.init is not available', async () => {
    jest.resetModules()

    jest.doMock('../../app/server', () =>
      jest.fn().mockResolvedValue({
        start: jest.fn(),
        info: { uri: 'test' }
      })
    )

    jest.doMock('ffc-alerting-utils', () => ({}))

    jest.isolateModules(() => {
      require('../../app/index')
    })

    await new Promise(process.nextTick)

    const messageConfig = require('../../app/config/message')
    const { SOURCE } = require('../../app/constants/source')
    const { DATA_STATEMENT_RECEIVER_ERROR } = require('../../app/constants/alerts')

    expect(process.env.ALERT_TOPIC).toBe(JSON.stringify(messageConfig.alertTopic))
    expect(process.env.ALERT_SOURCE).toBe(SOURCE)
    expect(process.env.ALERT_TYPE).toBe(DATA_STATEMENT_RECEIVER_ERROR)
  })
})
