const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var storeShema = new Schema({
  name: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  address1: {
    type: String,
  },
  address2: {
    type: String,
  },
  city: {
    type: String,
  },
  us_state: {
    type: String,
  },
  zipcode: {
    type: String,
  },
});

module.exports = Store = mongoose.model('store', storeShema);
