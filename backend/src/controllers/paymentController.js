const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Request = require('../models/Request');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const { requestId } = req.body;

    // Find the request
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only requester can pay
    if (request.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Only the requester can pay for this request' 
      });
    }

    // Only pay for delivered requests
    if (request.status !== 'delivered' && request.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Can only pay for delivered or completed requests' 
      });
    }

    // Check if already paid
    const existingPayment = await Payment.findOne({ 
      request: requestId, 
      status: 'captured' 
    });
    if (existingPayment) {
      return res.status(400).json({ message: 'Already paid for this request' });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: request.tipAmount,
      currency: 'INR',
      receipt: `receipt_${requestId}`,
      notes: {
        requestId: requestId,
        payerId: req.user._id.toString(),
        payeeId: request.porter.toString()
      }
    });

    // Save payment record in MongoDB
    const payment = await Payment.create({
      request: requestId,
      payer: req.user._id,
      payee: request.porter,
      amount: request.tipAmount,
      razorpayOrderId: order.id,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Order created successfully',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// VERIFY PAYMENT
const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        razorpayPaymentId: razorpay_payment_id,
        status: 'captured'
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    res.json({
      message: 'Payment verified successfully',
      payment
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET PAYMENT BY REQUEST
const getPaymentByRequest = async (req, res) => {
  try {
    const payment = await Payment.findOne({ request: req.params.requestId })
      .populate('payer', 'name email')
      .populate('payee', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'No payment found for this request' });
    }

    res.json({ payment });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentByRequest };