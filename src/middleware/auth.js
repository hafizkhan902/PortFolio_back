const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
const generateToken = (adminId) => {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: '24h' });
};

// Middleware to protect admin routes
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('🔍 Auth header received:', authHeader);
    console.log('🔍 Request URL:', req.originalUrl);
    console.log('🔍 Request method:', req.method);
    
    let token = null;
    
    if (authHeader) {
      console.log('🔍 Auth header type:', typeof authHeader);
      console.log('🔍 Auth header length:', authHeader.length);
      
      // Handle different token formats
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim(); // Remove 'Bearer ' and trim whitespace
        console.log('🔍 Extracted token after Bearer removal:', token);
      } else if (authHeader.startsWith('bearer ')) {
        token = authHeader.slice(7).trim(); // Handle lowercase 'bearer'
        console.log('🔍 Extracted token after bearer removal:', token);
      } else {
        token = authHeader.trim(); // Direct token without Bearer prefix
        console.log('🔍 Direct token (no Bearer prefix):', token);
      }
    }
    
    // Also check for token in query params or body as fallback
    if (!token) {
      token = req.query.token || req.body.token;
      if (token) {
        console.log('🔍 Token found in query/body:', token.substring(0, 20) + '...');
      }
    }
    
    // Enhanced token validation
    if (!token) {
      console.log('❌ No token provided - authHeader was:', authHeader);
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        debug: process.env.NODE_ENV === 'development' ? {
          authHeader: authHeader,
          tokenFound: false,
          reason: 'No Authorization header or token in request'
        } : undefined
      });
    }
    
    if (token === 'null' || token === 'undefined' || token === '') {
      console.log('❌ Invalid token value:', token);
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
        debug: process.env.NODE_ENV === 'development' ? {
          authHeader: authHeader,
          extractedToken: token,
          reason: 'Token is null, undefined, or empty string'
        } : undefined
      });
    }

    console.log('🔑 Token to verify:', token.substring(0, 20) + '...');
    console.log('🔑 Token length:', token.length);
    console.log('🔑 Token type:', typeof token);
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded successfully for admin:', decoded.adminId);
    
    const admin = await Admin.findById(decoded.adminId);

    if (!admin || !admin.isActive) {
      console.log('❌ Admin not found or inactive:', decoded.adminId);
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token or inactive admin.',
        debug: process.env.NODE_ENV === 'development' ? {
          adminId: decoded.adminId,
          adminFound: !!admin,
          adminActive: admin?.isActive
        } : undefined
      });
    }

    console.log('✅ Admin authenticated successfully:', admin.username);
    req.admin = admin;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    console.log('❌ Token verification error details:', error.name);
    console.log('❌ Full error:', error);
    
    res.status(401).json({
      success: false,
      message: 'Access denied. Invalid token.',
      debug: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        errorType: error.name,
        authHeader: req.header('Authorization'),
        tokenReceived: req.header('Authorization')?.slice(7)
      } : undefined
    });
  }
};

// Middleware to check if admin is super admin
const requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }
  next();
};

module.exports = {
  generateToken,
  authenticateAdmin,
  requireSuperAdmin
}; 