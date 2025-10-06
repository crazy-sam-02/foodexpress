import jwt from 'jsonwebtoken';

/**
 * Middleware to require authentication token
 * Supports both Authorization header formats:
 * 1. req.header('Authorization'): 'Bearer <token>'
 * 2. req.headers['authorization']: 'Bearer <token>'
 */
export const requireAuth = (req, res, next) => {
  try {
    // Check both header formats
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
    
    // Support both token structures
    req.user = decoded.user || decoded;
    
    console.log(' User authenticated:', req.user.id || req.user._id);
    next();
  } catch (err) {
    console.error(' Auth error:', err.message);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

// Alias for backwards compatibility
export const authenticateToken = requireAuth;
