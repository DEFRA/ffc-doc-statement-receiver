describe('Server test', () => {
  test('createServer returns server', () => {
    const createServer = require('../../../../app/server')
    const server = createServer()
    expect(server).toBeDefined()
  })
})
