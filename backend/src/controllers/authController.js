const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email ends with @iitj.ac.in
    if (!email.endsWith('@iitj.ac.in')) {
      return res.status(400).json({ 
        message: 'Only @iitj.ac.in email addresses are allowed' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiresAt
    });

    // Send OTP email
    await sendEmail(
      email,
      'Verify your Campus Porter account',
      `<h2>Welcome to Campus Porter!</h2>
       <p>Your OTP is: <b style="font-size:24px">${otp}</b></p>
       <p>This OTP expires in 10 minutes.</p>
       <p>Do not share this OTP with anyone.</p>`
    );

    res.status(201).json({ 
      message: 'Registration successful. Please check your email for OTP.',
      userId: user._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// VERIFY OTP
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP expired
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rating: user.rating,
        totalDeliveries: user.totalDeliveries
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, verifyOTP, login };