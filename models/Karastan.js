const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KarastanSchema = new Schema({
  code: { type: Number },
  dealerName: { type: String },
  addressOne: { type: String },
  addressTwo: { type: String },
  addressThree: { type: String },
  city: { type: String },
  st: { type: String },
  zipcode: { type: String },
  phone: { type: Number },
  region: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = Manager = mongoose.model('karastan', KarastanSchema);
