const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const router = express.Router();
require('dotenv').config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Google Client ID
const client = new OAuth2Client(CLIENT_ID);

// Route to handle Google sign-in
router.post('/google', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  try {
    // Verify the token received from Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    // Check if user already exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if not found
      user = new User({
        email,
        name: payload.name,
        googleId: payload.sub,
        picture: payload.picture,
      });
      await user.save();
    }

    // Send back a success response with user info
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(400).json({ success: false, message: 'Invalid token!' });
  }
});

module.exports = router;
