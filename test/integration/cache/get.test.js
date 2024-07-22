const createServer = require('../../../app/server')

const { get, set } = require('../../../app/cache')

const value = 'Value'

let key
let request
let server

beforeEach(async () => {
  server = await createServer()
  await server.initialize()

  const options = {
    method: 'GET',
    url: '/get'
  }

  key = 'Key'
  request = (await server.inject(options)).request

  await set(request, key, value)
})

afterEach(async () => {
  jest.resetAllMocks()
})

describe('get cache', () => {
  test('should return defined', async () => {
    const result = await get(request, key)
    expect(result).toBeDefined()
  })

  test('should return value', async () => {
    const result = await get(request, key)
    expect(result).toBe(value)
  })

  test('should return undefined when null cache key is given', async () => {
    key = null
    const result = await get(request, key)
    expect(result).toBeUndefined()
  })

  test('should return undefined when undefined cache key is given', async () => {
    key = undefined
    const result = await get(request, key)
    expect(result).toBeUndefined()
  })

  test('should return undefined when empty array cache key is given', async () => {
    key = []
    const result = await get(request, key)
    expect(result).toBeUndefined()
  })

  test('should return undefined when empty object cache key is given', async () => {
    key = {}
    const result = await get(request, key)
    expect(result).toBeUndefined()
  })

  test('should return undefined when false cache key is given', async () => {
    key = false
    const result = await get(request, key)
    expect(result).toBeUndefined()
  })

  test('should return undefined when true cache key is given', async () => {
    key = true
    const result = await get(request, key)
    expect(result).toBeUndefined()
  })

  test('should return undefined when incorrect request is given', async () => {
    request = {}
    const result = await get(request, key)
    expect(result).toBeUndefined()
  })
})
