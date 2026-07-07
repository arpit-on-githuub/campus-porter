const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  porter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  fromLocation: {
    type: String,
    required: true,
    trim: true
  },
  toLocation: {
    type: String,
    required: true,
    trim: true
  },
  itemDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  tipAmount: {
    type: Number,
    required: true,
    min: 0
  },
  rewardType: {
    type: String,
    enum: ['tip', 'party'],
    default: 'tip'
  },
  partyNote: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  status: {
    type: String,
    enum: ['open', 'accepted', 'picked_up', 'delivered', 'completed', 'cancelled'],
    default: 'open'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  requesterRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  porterRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

requestSchema.index({ status: 1, toLocation: 1, expiresAt: 1 });
requestSchema.index({ requester: 1 });
requestSchema.index({ porter: 1 });

module.exports = mongoose.model('Request', requestSchema);