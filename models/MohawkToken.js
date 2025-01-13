const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mohawkTokenSchema = new Schema({
  _orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Orders',
  },
  mohawkToken: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

module.exports = MohawkToken = mongoose.model('mohawkToken', mohawkTokenSchema);
