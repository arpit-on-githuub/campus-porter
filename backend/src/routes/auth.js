const express = require('express');
const router = express.Router();
const { 
  register, 
  verifyOTP, 
  login,
  updatePhone,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const protect = require('../middleware/auth');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/update-phone', protect, updatePhone);

module.exports = router;