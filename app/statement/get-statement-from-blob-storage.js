const { getFileStream } = require('../storage')
const streamToBuffer = require('../stream-to-buffer')

const getStatementFromBlobStorage = async (_request, filename) => {
  console.log(`Retrieving ${filename} from storage account ${process.env.AZURE_STORAGE_ACCOUNT_NAME}`)
  try {
    const fileStream = await getFileStream(filename)
    const fileBuffer = await streamToBuffer(fileStream.readableStreamBody)
    return fileBuffer
  } catch (err) {
    console.error('Failed to retrieve from blob storage:', err)
    throw err
  }
}

module.exports = getStatementFromBlobStorage
