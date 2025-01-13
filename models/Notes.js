const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var notesShema = new Schema({
  note: {
    type: String,
  },
  created: { type: Date, default: Date.now },
});

module.exports = Notes = mongoose.model('notes', notesShema);
