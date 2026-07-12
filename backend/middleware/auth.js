const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Verify JWT Token
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Authorization token missing.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

    // Find and attach user to request
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User associated with this token no longer exists.'
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account is currently deactivated.'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid authorization token.'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};
