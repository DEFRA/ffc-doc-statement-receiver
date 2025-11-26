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

describe('getCache', () => {
  test('should return defined', async () => {
    const result = await get(request, key)
    expect(result).toBeDefined()
  })

  test('should return value', async () => {
    const result = await get(request, key)
    expect(result).toBe(value)
  })

  test.each([
    ['null cache key', null],
    ['undefined cache key', undefined],
    ['empty array cache key', []],
    ['empty object cache key', {}],
    ['false cache key', false],
    ['true cache key', true],
    ['incorrect request', { invalid: true }]
  ])('should return undefined when %s is given', async (_, invalidKey) => {
    const testRequest = _ === 'incorrect request' ? {} : request
    const testKey = _ === 'incorrect request' ? key : invalidKey
    const result = await get(testRequest, testKey)
    expect(result).toBeUndefined()
  })
})
