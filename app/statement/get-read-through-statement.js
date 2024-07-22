const { set } = require('../cache')

const getStatementFromCache = require('./get-statement-from-cache')
const getStatementFromBlobStorage = require('./get-statement-from-blob-storage')

const getReadThroughStatement = async (request, filename) => {
  const cacheFile = await getStatementFromCache(request, filename)

  if (cacheFile) {
    return cacheFile
  }

  const blobFile = await getStatementFromBlobStorage(request, filename)
  await set(request, filename, blobFile)

  return blobFile
}

module.exports = getReadThroughStatement
