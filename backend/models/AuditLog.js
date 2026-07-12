const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  targetType: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
