const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ManagerSchema = new Schema({
  uploadfile: { type: String },
  created: { type: Date, default: Date.now },
});

module.exports = Manager = mongoose.model('manager', ManagerSchema);
