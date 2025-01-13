const { orderDirectionValues } = require('../utils/consts');
const { query } = require('express-validator');

const fieldsForSorting = ['firstName', 'email', 'companyName', 'mohawkBrand'];

module.exports.getDealersValidator = [
  query('page', 'Must be positive int number')
    .isInt()
    .toInt()
    .custom((value) => value >= 0)
    .optional(),
  query('perPage', 'Max per page 50, min per page 10')
    .isInt()
    .toInt()
    .custom((value) => value >= 10 && value <= 50)
    .optional(),
  query('isVerified').isBoolean().optional(),
  query('search').isString().optional(),
  query('orderField', `Available fields for sorting - "${fieldsForSorting.join(', ')}"`)
    .isString()
    .optional()
    .custom((value) => fieldsForSorting.includes(value)),
  query('orderDirection', `Available directions for sorting - "${orderDirectionValues.join(', ')}"`)
    .isString()
    .optional()
    .custom((value) => orderDirectionValues.includes(value)),
]
