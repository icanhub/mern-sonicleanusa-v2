const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DealerListSchema = new Schema({
  uploadfile: { type: String },
  created: { type: Date, default: Date.now },
});

module.exports = Manager = mongoose.model('dealerlist', DealerListSchema);
