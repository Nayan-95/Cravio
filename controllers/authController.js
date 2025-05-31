const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.ACCESS_SECRET_KEY, { expiresIn: '7d' });
};

// ------------------------ AUTHENTICATION ------------------------

exports.register = async (req, res) => {
  try {
    const { email, password, role, name, phone, businessName, businessRegistration } = req.body;
    
    // Validate required fields based on role
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password and role are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user based on role
    const userData = {
      email,
      password: hash,
      role,
      profile: { name, phone }
    };

    if (role === 'merchant') {
      if (!businessName) {
        return res.status(400).json({ error: 'Business name is required for merchants' });
      }
      userData.merchantDetails = { businessName, businessRegistration };
    }

    const user = await User.create(userData);
    
    // Generate token
    const token = generateToken(user._id, user.role);
    
    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ 
      token,
      user: userResponse
    });
    
  } catch (err) {
    res.status(400).json({ 
      error: 'Registration failed',
      details: err.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);
    
    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      token,
      user: userResponse
    });

  } catch (err) {
    res.status(500).json({ 
      error: 'Login failed',
      details: err.message 
    });
  }
};

// ------------------------ PROFILE ------------------------

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: err.message 
    });
  }
};