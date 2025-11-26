const Boom = require('@hapi/boom')

const schema = require('./schemas/statement')

const getReadThroughStatement = require('../statement')

const { sendAlert } = require('../alert')

module.exports = {
  method: 'GET',
  path: '/{version}/statements/statement/{filename}',
  options: {
    validate: {
      params: schema,
      failAction: async (request, h, error) => {
        return Boom.badRequest(error)
      }
    }
  },
  handler: async (request, h) => {
    try {
      const filename = request.params.filename
      const statement = await getReadThroughStatement(request, filename)

      return h.response(statement)
        .type('application/pdf')
        .header('Connection', 'keep-alive')
        .header('Cache-Control', 'no-cache')
        .header('Content-Disposition', `attachment;filename=${filename}`)
        .code(200)
    } catch (error) {
      sendAlert('statements', request.params.filename, `Error fetching statement: ${error.message}`)
      return Boom.notFound(error)
    }
  }
}
