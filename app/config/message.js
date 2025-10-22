const Joi = require('joi')

const mqSchema = Joi.object({
  alertTopic: {
    address: Joi.string()
  }
})

const mqConfig = {
  alertTopic: {
    address: process.env.ALERT_TOPIC_ADDRESS
  }
}

const mqResult = mqSchema.validate(mqConfig, {
  abortEarly: false
})

if (mqResult.error) {
  throw new Error(`The message queue config is invalid. ${mqResult.error.message}`)
}

const alertTopic = { ...mqResult.value.messageQueue, ...mqResult.value.alertTopic }

module.exports = {
  alertTopic
}