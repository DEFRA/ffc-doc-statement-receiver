require('./insights').setup()

const Hapi = require('@hapi/hapi')
const config = require('./config')

const createServer = async () => {
  try {
    const server = Hapi.server({
      port: config.port,
      cache: [{
        name: config.cache.cacheName,
        provider: {
          constructor: config.cache.catbox,
          options: config.cache.catboxOptions
        }
      }]
    })

    const cache = server.cache({ cache: config.cache.cacheName, segment: config.cache.segment, expiresIn: config.cache.ttl })
    server.app.cache = cache

    await server.register(require('./plugins/enabled'))
    await server.register(require('./plugins/errors'))
    await server.register(require('./plugins/router'))
    await server.register(require('./plugins/logging'))

    if (config.isDev) {
      await server.register(require('blipp'))
    }

    console.log('Server created successfully')
    return server
  } catch (error) {
    console.error('Error creating server:', error)
    throw error
  }
}

module.exports = createServer
