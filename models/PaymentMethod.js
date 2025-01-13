const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var paymentMethodShema = new Schema({
  cardnumber: {
    type: String,
    require: true,
  },
  cvc: {
    type: String,
    required: true,
  },
  token: {
    type: Object,
    require: true,
  },
});

module.exports = PaymentMethod = mongoose.model(
  'paymentMethod',
  paymentMethodShema
);
