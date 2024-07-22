const { getFileStream } = require('../storage')
const streamToBuffer = require('../stream-to-buffer')

const getStatementFromBlobStorage = async (request, filename) => {
  console.log('No cached file found, retrieving from storage')

  const fileStream = await getFileStream(filename)
  const fileBuffer = await streamToBuffer(fileStream.readableStreamBody)

  return fileBuffer
}

module.exports = getStatementFromBlobStorage
