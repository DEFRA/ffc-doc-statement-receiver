jest.mock('../../../app/cache')
const { get } = require('../../../app/cache')

const getStatementFromCache = require('../../../app/statement/get-statement-from-cache')

let request
let filename
let fileContent

describe('Get statement file from cache', () => {
  beforeEach(async () => {
    request = require('../../mock-components/request')
    filename = require('../../mock-components/filename')
    fileContent = require('../../mock-components/file-content')

    get.mockResolvedValue(Buffer.from(fileContent))
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call get', async () => {
    await getStatementFromCache(request, filename)
    expect(get).toHaveBeenCalled()
  })

  test('should call get once', async () => {
    await getStatementFromCache(request, filename)
    expect(get).toHaveBeenCalledTimes(1)
  })

  test('should call get with request and filename', async () => {
    await getStatementFromCache(request, filename)
    expect(get).toHaveBeenCalledWith(request, filename)
  })

  test('should return Buffer.from(get)', async () => {
    const result = await getStatementFromCache(request, filename)
    expect(result).toStrictEqual(Buffer.from(await get()))
  })

  test('should return undefined when get returns null', async () => {
    get.mockResolvedValue(null)
    const result = await getStatementFromCache(request, filename)
    expect(result).toBeUndefined()
  })

  test('should return undefined when get returns undefined', async () => {
    get.mockResolvedValue(undefined)
    const result = await getStatementFromCache(request, filename)
    expect(result).toBeUndefined()
  })
})
