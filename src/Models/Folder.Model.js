const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#5a7c5e' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure user can't have duplicate folder names
folderSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Folder', folderSchema);
