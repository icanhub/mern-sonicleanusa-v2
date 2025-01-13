const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema

var Store = require('./Store');
var Notes = require('./Notes');
var PaymentMethod = require('./PaymentMethod');

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  newPriceAccepted: {
    type: Number,
    default: 0,
  },
  companyName: {
    type: String,
    required: false,
  },
  websiteURL: {
    type: String,
    required: false,
  },
  mohawkAccount: {
    type: Number,
    required: false,
  },
  mohawkBrand: {
    type: String,
    enum: ['Mohawk', 'Karastan', 'Mohawk & Karastan', ''],
    default: 'Mohawk',
    require: false,
  },
  stripe_customer_id: {
    type: String,
    required: false,
  },
  workPhoneNumber: {
    type: String,
  },
  userPhoto: {
    type: String,
  },
  extension: {
    type: String,
  },
  companyBio: {
    type: String,
  },
  companyLogo: {
    type: String,
  },
  roles: {
    type: String,
    enum: ['dealer', 'vacuum-dealer', 'employee', 'official', 'manager'],
    default: '',
    require: false,
  },
  _adminId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  passwordResetToken: {
    type: String,
    default: '',
  },
  passwordResetExpires: Date,
  created: { type: Date, default: Date.now },
  stores: [Store.schema],
  notes: [Notes.schema],
  payments: [PaymentMethod.schema],
  vacuumAccount: {
    type: String,
    required: false,
  },
});
UserSchema.index({ '$**': 'text' });
module.exports = User = mongoose.model('users', UserSchema);
