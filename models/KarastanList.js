const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KarastanListSchema = new Schema({
  uploadfile: { type: String },
  created: { type: Date, default: Date.now },
});

module.exports = Manager = mongoose.model('karastanlist', KarastanListSchema);
