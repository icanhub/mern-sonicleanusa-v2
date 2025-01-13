const Validator = require('validator');
const isEmpty = require('is-empty');

module.exports = function validatePaymentMethodInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.cardnumber = !isEmpty(data.cardnumber) ? data.cardnumber : '';
  data.cvvcode = !isEmpty(data.cvvcode) ? data.cvvcode : '';
  data.holdername = !isEmpty(data.holdername) ? data.holdername : '';
  // data.zipcode = !isEmpty(data.zipcode) ? data.zipcode : '';
  data.expiredatemonth = !isEmpty(data.expiredatemonth)
    ? data.expiredatemonth
    : '';
  data.expiredateyear = !isEmpty(data.expiredateyear)
    ? data.expiredateyear
    : '';

  if (Validator.isEmpty(data.cardnumber)) {
    errors.cardnumber = 'cardnumber field is required';
  }
  if (Validator.isEmpty(data.cvvcode)) {
    errors.cvvcode = 'cvvcode field is required';
  }
  if (Validator.isEmpty(data.holdername)) {
    errors.holdername = 'holdername field is required';
  }
  // if (Validator.isEmpty(data.zipcode)) {
  //   errors.zipcode = 'zipcode field is required';
  // }
  if (Validator.isEmpty(data.expiredatemonth)) {
    errors.expiredatemonth = 'expiredatemonth field is required';
  }
  if (Validator.isEmpty(data.expiredateyear)) {
    errors.expiredateyear = 'expiredateyear field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
