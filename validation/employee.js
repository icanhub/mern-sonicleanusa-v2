const Validator = require('validator');
const isEmpty = require('is-empty');

module.exports = function validateEmployeeInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.firstName = !isEmpty(data.firstName) ? data.firstName : '';
  data.lastName = !isEmpty(data.lastName) ? data.lastName : '';
  data.email = !isEmpty(data.email) ? data.email : '';

  if (Validator.isEmpty(data.firstName)) {
    errors.firstName = 'First Name field is required';
  }
  if (Validator.isEmpty(data.lastName)) {
    errors.lastName = 'Last Name field is required';
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = 'Email field is required';
  } else if (!Validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
