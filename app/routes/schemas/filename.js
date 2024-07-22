const Joi = require('joi')

module.exports = {
  filename: Joi.string().required()
    .messages({
      'string.base': 'Filename must be a string.',
      'any.required': 'A filename must be provided.'
    })
}
