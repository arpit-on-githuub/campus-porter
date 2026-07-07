const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiresAt: {
    type: Date,
    default: null
  },
  rating: {
    type: Number,
    default: 0
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  phone: {
  type: String,
  default: null
},
emailNotifications: {
  type: Boolean,
  default: true
},
isPhoneShared: {
  type: Boolean,
  default: false
}
}, {
  timestamps: true
});

userSchema.path('email').validate(function(email) {
  return email.endsWith('@iitj.ac.in');
}, 'Only @iitj.ac.in email addresses are allowed');

// Speeds up the "notify verified opted-in users" broadcast as the base grows.
userSchema.index({ isVerified: 1, emailNotifications: 1 });

module.exports = mongoose.model('User', userSchema);