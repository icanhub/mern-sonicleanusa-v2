const Validator = require('validator');
const isEmpty = require('is-empty');

module.exports = function validateRegisterInput(data, isVacuumDealer = false) {
  let errors = {};
  // console.log('isVacuumDealer', isVacuumDealer);
  // Convert empty fields to an empty string so we can use validator functions
  data.firstName = !isEmpty(data.firstName) ? data.firstName : '';
  data.lastName = !isEmpty(data.lastName) ? data.lastName : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.phoneNumber = !isEmpty(data.phoneNumber) ? data.phoneNumber : '';
  data.companyName = !isEmpty(data.companyName) ? data.companyName : '';
  data.websiteURL = !isEmpty(data.websiteURL) ? data.websiteURL : '';
  data.mohawkAccount = !isEmpty(data.mohawkAccount) ? data.mohawkAccount : '';
  data.mohawkBrand = !isEmpty(data.mohawkBrand) ? data.mohawkBrand : '';
  data.address1 = !isEmpty(data.address1) ? data.address1 : '';
  data.address2 = !isEmpty(data.address2) ? data.address2 : '';
  data.city = !isEmpty(data.city) ? data.city : '';
  data.zipcode = !isEmpty(data.zipcode) ? data.zipcode : '';

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

  if (Validator.isEmpty(data.companyName)) {
    errors.companyName = 'Company Name field is required';
  }
  if (!isVacuumDealer && Validator.isEmpty(data.mohawkAccount.toString())) {
    errors.mohawkAccount = 'Mohawk Account field is required';
  }
  if (!isVacuumDealer && Validator.isEmpty(data.mohawkBrand)) {
    errors.mohawkBrand = 'Mohawk Brand field is required';
  }
  if (Validator.isEmpty(data.address1)) {
    errors.address1 = 'Address1 field is required';
  }
  if (Validator.isEmpty(data.city)) {
    errors.city = 'City field is required';
  }
  if (Validator.isEmpty(data.zipcode)) {
    errors.zipcode = 'Zip Code field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
