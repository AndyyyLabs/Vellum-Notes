const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, length: { min: 1, max: 100 }, trim: true },
  content: { type: String, required: true, length: { min: 1, max: 100000 }, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
}, { timestamps: true });

module.exports = mongoose.model('Notes', noteSchema);