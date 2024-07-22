const Joi = require('joi')

const cacheConfig = require('./cache')
const storageConfig = require('./storage')

const schema = Joi.object({
  env: Joi.string().valid('development', 'test', 'production').default('development'),
  port: Joi.number().default(3022),
  endpointEnabled: Joi.boolean().default(true)
})

const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  endpointEnabled: process.env.ENDPOINT_ENABLED
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

const value = result.value

value.isDev = (value.env === 'development' || value.env === 'test')
value.isTest = value.env === 'test'
value.isProd = value.env === 'production'

value.storageConfig = storageConfig

value.useRedis = !(value.isTest || cacheConfig.host === undefined)

if (!value.useRedis) {
  console.info('Redis disabled, using in memory cache')
}

value.cache = cacheConfig
value.cache.catboxOptions = value.useRedis
  ? {
      ...cacheConfig.catboxOptions,
      tls: value.isDev ? undefined : {}
    }
  : {}
value.cache.catbox = value.useRedis ? require('@hapi/catbox-redis') : require('@hapi/catbox-memory')

module.exports = value
