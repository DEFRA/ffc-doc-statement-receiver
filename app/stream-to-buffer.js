// https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/blockblobclient?view=azure-node-latest#@azure-storage-blob-blockblobclient-download

const streamToBuffer = async (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = []
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data))
    })
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    readableStream.on('error', reject)
  })
}

module.exports = streamToBuffer
