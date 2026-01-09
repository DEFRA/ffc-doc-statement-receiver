const { EventPublisher } = require('ffc-pay-event-publisher')
const createServer = require('./server')

const { DATA_STATEMENT_RECEIVER_ERROR } = require('./constants/alerts')
const { SOURCE } = require('./constants/source')

const messageConfig = require('./config/message')

try {
  const alerting = require('ffc-alerting-utils')

  if (alerting.init) {
    alerting.init({
      topic: messageConfig.alertTopic,
      source: SOURCE,
      defaultType: DATA_STATEMENT_RECEIVER_ERROR,
      EventPublisherClass: EventPublisher
    })
  } else {
    process.env.ALERT_TOPIC = JSON.stringify(messageConfig.alertTopic)
    process.env.ALERT_SOURCE = SOURCE
    process.env.ALERT_TYPE = DATA_STATEMENT_RECEIVER_ERROR
  }
} catch (err) {
  console.warn('Failed to initialize alerting utils:', err.message)
}

const init = async () => {
  const server = await createServer()
  await server.start()
  console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

module.exports = (async () => {
  init()
})()
