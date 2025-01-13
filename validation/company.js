const Validator = require('validator');
const isEmpty = require('is-empty');

module.exports = function validateCompanyInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.companyName = !isEmpty(data.companyName) ? data.companyName : '';
  data.phoneNumber = !isEmpty(data.phoneNumber) ? data.phoneNumber : '';

  if (Validator.isEmpty(data.companyName)) {
    errors.companyName = 'Company Name field is required';
  }

  if (Validator.isEmpty(data.phoneNumber)) {
    errors.phoneNumber = 'Phone Number field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
