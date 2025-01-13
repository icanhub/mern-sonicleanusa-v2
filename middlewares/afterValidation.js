const { ResponseBuilder } = require('../utils/ResponseBuilder');
const { validationResult } = require('express-validator');

module.exports.afterValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsResponse = errors.array().reduce((acc, error) => {
      acc[error.param] = error.msg;
      return acc;
    }, {});
    
    return new ResponseBuilder(res)
      .withStatusCode(422)
      .withStatus('validationFailed')
      .withError(errorsResponse)
      .withMessage('Validation failed')
      .send();
  }
  next();
}
