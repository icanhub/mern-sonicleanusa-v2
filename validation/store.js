const Validator = require('validator');
const isEmpty = require('is-empty');

module.exports = function validateStoreLocationInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.name = !isEmpty(data.name) ? data.name : '';
  data.phoneNumber = !isEmpty(data.phoneNumber) ? data.phoneNumber : '';
  data.address1 = !isEmpty(data.address1) ? data.address1 : '';
  data.address2 = !isEmpty(data.address2) ? data.address2 : '';
  data.city = !isEmpty(data.city) ? data.city : '';
  // data.us_state = !isEmpty(data.us_state) ? data.us_state : '';
  data.zipcode = !isEmpty(data.zipcode) ? data.zipcode : '';

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Name field is required';
  }
  if (Validator.isEmpty(data.phoneNumber)) {
    errors.phoneNumber = 'Phone Number field is required';
  }

  if (Validator.isEmpty(data.address1)) {
    errors.address1 = 'Address1 field is required';
  }
  if (Validator.isEmpty(data.city)) {
    errors.city = 'City field is required';
  }
  // if (Validator.isEmpty(data.us_state)) {
  //   errors.us_state = 'State field is required';
  // }
  if (Validator.isEmpty(data.zipcode)) {
    errors.zipcode = 'Zip Code field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
