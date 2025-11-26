const { Readable } = require('stream')
const streamToBuffer = require('../../app/stream-to-buffer')

let streamData
let readableStream

describe('readable stream contents is converted to a Buffer', () => {
  beforeEach(() => {
    streamData = ['pure', 'gubbins', 'to', 'be', 'refined']
    readableStream = Readable.from(streamData, { encoding: 'utf8' })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test.each([
    ['returns Buffer instance for valid stream', () => {
      return streamToBuffer(readableStream).then(result => {
        expect(result).toBeInstanceOf(Buffer)
      })
    }],
    ['returns Buffer with correct contents', () => {
      return streamToBuffer(readableStream).then(result => {
        expect(result).toStrictEqual(Buffer.from(streamData.join('')))
      })
    }],
    ['returns Buffer when readableFlowing is null', () => {
      readableStream.readableFlowing = null
      return streamToBuffer(readableStream).then(result => {
        expect(result).toBeInstanceOf(Buffer)
      })
    }],
    ['returns Buffer instance when stream created from empty array', () => {
      readableStream = Readable.from([], { encoding: 'utf8' })
      return streamToBuffer(readableStream).then(result => {
        expect(result).toBeInstanceOf(Buffer)
      })
    }],
    ['returns empty Buffer for empty array', () => {
      readableStream = Readable.from([], { encoding: 'utf8' })
      return streamToBuffer(readableStream).then(result => {
        expect(result).toStrictEqual(Buffer.from([]))
      })
    }]
  ])('%s', async (_, fn) => fn())

  describe('throws on invalid input', () => {
    test.each([
      ['array', [], /^readableStream.on is not a function$/],
      ['string', 'string', /^readableStream.on is not a function$/],
      ['object', { key: 'value' }, /^readableStream.on is not a function$/]
    ])('throws when streamToBuffer is called with %s', async (_, input, expectedMessage) => {
      await expect(streamToBuffer(input)).rejects.toThrow(expectedMessage)
    })
  })
})
