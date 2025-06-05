const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // 1. Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
    
    // 3. Attach user to request
    req.user = {
      _id: decoded._id,        // Assuming your JWT has these fields
      role: decoded.role       // Add other fields as needed
    };
    
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    
    // Different error messages for different cases
    let errorMessage = 'Not authorized';
    if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token expired';
    }
    
    res.status(401).json({ error: errorMessage });
  }
};