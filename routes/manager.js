const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// Log environment variables (for debugging)
console.log('Email configuration:', {
  user: 'callyticsai@gmail.com',
  pass: process.env.EMAIL_PASS ? 'Set' : 'Not set'
});

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'callyticsai@gmail.com',
    pass: process.env.EMAIL_PASS
  }
});

// Verify email configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email configuration error:', error);
    console.error('Environment variables:', {
      EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set'
    });
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Store OTPs temporarily
const otpStore = new Map();

// Generate a 4-digit OTP
const generateOTP = () => {
  return crypto.randomInt(1000, 9999).toString();
};

// Send OTP to manager's email
router.post('/send-otp', async (req, res) => {
  try {
    if (!process.env.EMAIL_PASS) {
      console.error('Email password not found in environment variables');
      throw new Error('Email configuration error');
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otp = generateOTP();

    // Store OTP with timestamp
    otpStore.set(email, {
      otp,
      timestamp: Date.now()
    });

    // Send email
    await transporter.sendMail({
      from: 'callyticsai@gmail.com',
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6a11cb;">CallTytics AI - Verification Code</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #6a11cb; font-size: 2.5em; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    });

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    console.error('Environment variables:', {
      EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set'
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP',
      error: error.message 
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }

    // Check if OTP is expired (5 minutes)
    if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Clear the OTP after successful verification
    otpStore.delete(email);

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});

module.exports = router; 