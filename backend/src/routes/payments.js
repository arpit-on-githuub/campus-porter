const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  getPaymentByRequest
} = require('../controllers/paymentController');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:requestId', protect, getPaymentByRequest);

module.exports = router;