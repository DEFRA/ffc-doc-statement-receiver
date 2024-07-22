const Joi = require('joi')

const version = require('./version')
const filename = require('./filename')

module.exports = Joi.object({
  ...version,
  ...filename
}).required()
