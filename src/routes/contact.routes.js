const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Configure nodemailer with App Password (simpler and more reliable)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer configuration error:', error);
  } else {
    console.log('Nodemailer is ready to send emails');
  }
});

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Create contact entry
    const contact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    // Send email notification
    await transporter.sendMail({
      from: {
        name: 'Hafiz Al Asad Portfolio',
        address: 'hkkhan074@gmail.com'
      },
      to: 'hkkhan074@gmail.com',
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    // Send auto-reply to user
    await transporter.sendMail({
      from: {
        name: 'Hafiz Al Asad',
        address: 'hkkhan074@gmail.com'
      },
      to: email,
      subject: 'Thank you for contacting me!',
      html: `
        <h3>Hello ${name},</h3>
        <p>Thank you for reaching out! I have received your message and will get back to you as soon as possible.</p>
        <p>Best regards,</p>
        <p>Hafiz Al Asad</p>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: contact
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 