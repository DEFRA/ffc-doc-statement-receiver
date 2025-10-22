const { dataProcessingAlert } = require('ffc-alerting-utils')
const { DATA_STATEMENT_RECEIVER_ERROR } = require('./constants/alerts')

const sendAlert = async (process, error, message, type = DATA_STATEMENT_RECEIVER_ERROR) => {
  await dataProcessingAlert({
    process,
    error,
    message
  }, type)
}

module.exports = { sendAlert }