const { sendAlert } = require('../../app/alert')
const { DATA_STATEMENT_RECEIVER_ERROR } = require('../../app/constants/alerts')
const { dataProcessingAlert } = require('ffc-alerting-utils')

jest.mock('ffc-alerting-utils', () => ({
  dataProcessingAlert: jest.fn()
}))

describe('sendAlert', () => {
  const mockProcess = 'TestProcess'
  const mockError = new Error('Something went wrong')
  const mockMessage = 'Alert message'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should call dataProcessingAlert with default type', async () => {
    await sendAlert(mockProcess, mockError, mockMessage)

    expect(dataProcessingAlert).toHaveBeenCalledWith(
      {
        process: mockProcess,
        error: mockError,
        message: mockMessage
      },
      DATA_STATEMENT_RECEIVER_ERROR
    )
  })

  test('should call dataProcessingAlert with custom type', async () => {
    const customType = 'CUSTOM_ALERT_TYPE'

    await sendAlert(mockProcess, mockError, mockMessage, customType)

    expect(dataProcessingAlert).toHaveBeenCalledWith(
      {
        process: mockProcess,
        error: mockError,
        message: mockMessage
      },
      customType
    )
  })
})
