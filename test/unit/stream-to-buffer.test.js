const { Readable } = require('stream')

const streamToBuffer = require('../../app/stream-to-buffer')

let streamData
let readableStream

describe('readable stream contents is converted to an int Buffer', () => {
  beforeEach(async () => {
    streamData = ['pure', 'gubbins', 'to', 'be', 'refined']
    readableStream = Readable.from(streamData, { encoding: 'utf8' })
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should return an instance of a Buffer when valid streamData provided', async () => {
    const result = await streamToBuffer(readableStream)
    expect(result).toBeInstanceOf(Buffer)
  })

  test('should return a Buffer of streamData contents', async () => {
    const result = await streamToBuffer(readableStream)
    expect(result).toStrictEqual(Buffer.from(streamData.join('')))
  })

  test('should return an instance of a Buffer when readableFlowing is set to null', async () => {
    readableStream.readableFlowing = null
    const result = await streamToBuffer(readableStream)
    expect(result).toBeInstanceOf(Buffer)
  })

  test('should return an instance of a Buffer when readableStream is created from empty array', async () => {
    readableStream = Readable.from([], { encoding: 'utf8' })
    const result = await streamToBuffer(readableStream)
    expect(result).toBeInstanceOf(Buffer)
  })

  test('should return a Buffer of empty array when readableStream is created from empty array', async () => {
    readableStream = Readable.from([], { encoding: 'utf8' })
    const result = await streamToBuffer(readableStream)
    expect(result).toStrictEqual(Buffer.from([]))
  })

  test('should reject when streamToBuffer is called with an array', async () => {
    readableStream = []

    const wrapper = async () => {
      await streamToBuffer(readableStream)
    }

    expect(wrapper).rejects.toThrow()
  })

  test('should reject to a Error when streamToBuffer is called with an array', async () => {
    readableStream = []

    const wrapper = async () => {
      await streamToBuffer(readableStream)
    }

    expect(wrapper).rejects.toThrow(Error)
  })

  test('should reject with error "readableStream.on is not a function" when streamToBuffer is called with an array', async () => {
    readableStream = []

    const wrapper = async () => {
      await streamToBuffer(readableStream)
    }

    expect(wrapper).rejects.toThrow(/^readableStream.on is not a function$/)
  })

  test('should reject when streamToBuffer is called with a string', async () => {
    readableStream = 'string'

    const wrapper = async () => {
      await streamToBuffer(readableStream)
    }

    expect(wrapper).rejects.toThrow()
  })

  test('should reject to a Error when streamToBuffer is called with a string', async () => {
    readableStream = 'string'

    const wrapper = async () => {
      await streamToBuffer(readableStream)
    }

    expect(wrapper).rejects.toThrow(Error)
  })

  test('should reject with error "readableStream.on is not a function" when streamToBuffer is called with a string', async () => {
    readableStream = 'string'

    const wrapper = async () => {
      await streamToBuffer(readableStream)
    }

    expect(wrapper).rejects.toThrow(/^readableStream.on is not a function$/)
  })

  test('should reject when streamToBuffer is called with an object', async () => {
    readableStream = { key: 'value' }

    const wrapper = async () => {
      await streamToBuffer(readableStream)
    }

    expect(wrapper).rejects.toThrow()
  })

  test('should reject to a Error when streamToBuffer is called with an object', async () => {
    readableStream = { key: 'value' }

    const wrapper = async () => {
      await streamToBuffer(readableStream)
    }

    expect(wrapper).rejects.toThrow(Error)
  })

  test('should reject with error "readableStream.on is not a function" when streamToBuffer is called with an object', async () => {
    readableStream = { key: 'value' }

    const wrapper = async () => {
      await streamToBuffer(readableStream)
    }

    expect(wrapper).rejects.toThrow(/^readableStream.on is not a function$/)
  })
})
