const express = require('express');
const User = require('../Models/User.Model');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../Middleware/Auth.Middleware');
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, maxAge: 86400000 }); // 24 hours
    res.status(201).json({ message: 'User registered successfully', token });

  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
});

// Render login form
router.get('/login', (req, res) => {
  res.render('login');
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
    res.json({ message: 'Login successful', token });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ message: 'Login failed', error: error.message });
  }
});

// Logout user - protected by auth middleware
router.get('/logout', authMiddleware, (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
});

// Add a protected route to get current user info
router.get('/me', authMiddleware, (req, res) => {
  res.json({ 
    user: { 
      id: req.user._id, 
      name: req.user.name,
      email: req.user.email
    } 
  });
});

module.exports = router;
