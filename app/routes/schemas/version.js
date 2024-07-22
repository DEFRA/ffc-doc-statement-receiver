const Joi = require('joi')

const apiVersions = require('../../constants/api-versions')

module.exports = {
  version: Joi.string().valid(...apiVersions).required()
    .messages({
      'string.base': 'Version must be a string.',
      'any.required': 'Version must be provided.',
      '*': `Version must be one of: ${apiVersions}.`
    })
}
