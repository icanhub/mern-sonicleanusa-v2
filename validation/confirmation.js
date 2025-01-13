const Validator = require('validator');
const isEmpty = require('is-empty');

module.exports = function validateConfirmationInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.password = !isEmpty(data.password) ? data.password : '';
  data.token = !isEmpty(data.token) ? data.token : '';

  // Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  }

  if (Validator.isEmpty(data.token)) {
    errors.token = 'token field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
