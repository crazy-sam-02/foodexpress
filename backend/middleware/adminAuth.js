import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to require admin authentication
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // Check for token
    const authHeader = req.header('Authorization') || req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied' 
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Token format is invalid' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to verify admin status
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Add user info to request
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      isAdmin: true
    };
    
    next();
  } catch (err) {
    console.error('Admin auth error:', err.message);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};