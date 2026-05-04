import asyncHandler from 'express-async-handler';

// In-memory store for demo — swap for a Contact model in production
const contacts = [];

// ─── @desc    Submit contact form (public)
// ─── @route   POST /api/contact
// ─── @access  Public
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email, and message are required');
  }

  const contact = { id: Date.now(), name, email, phone, subject, message, createdAt: new Date(), isRead: false };
  contacts.push(contact);

  res.status(201).json({
    success: true,
    message: 'Your message has been received. We will get back to you soon!',
    contact: { id: contact.id, name, email },
  });
});

// ─── @desc    Get all contact submissions
// ─── @route   GET /api/contact
// ─── @access  Admin
const getContacts = asyncHandler(async (req, res) => {
  res.json({ success: true, contacts });
});

export { submitContact, getContacts };
