const { get } = require('../cache')

const getStatementFromCache = async (request, filename) => {
  const cacheFile = await get(request, filename)
  if (cacheFile) {
    console.log(`Cache file found for: ${filename}`)
    return Buffer.from(cacheFile)
  }

  return undefined
}

module.exports = getStatementFromCache
