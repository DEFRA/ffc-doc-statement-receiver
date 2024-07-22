const createServer = require('../../../app/server')

const { get, set, drop } = require('../../../app/cache')

const key = 'Key'
const value = 'Value'

let request
let server

beforeEach(async () => {
  server = await createServer()
  await server.initialize()

  const options = {
    method: 'GET',
    url: '/set'
  }

  request = (await server.inject(options)).request

  await set(request, key, value)
})

afterEach(async () => {
  jest.resetAllMocks()
})

describe('drop cache', () => {
  test('should return undefined', async () => {
    const result = await drop(request, key)
    expect(result).toBeUndefined()
  })

  test('should remove key from cache', async () => {
    const cacheValueBefore = await get(request, key)

    await drop(request, key)

    const cacheValueAfter = await get(request, key)
    expect(cacheValueBefore).toBe(value)
    expect(cacheValueAfter).toBeNull()
  })
})
