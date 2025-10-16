/**
 * Admin session-based auth middleware using express-session
 * Relies on req.session.admin being truthy
 */
export const requireAdminSession = (req, res, next) => {
  try {
    if (req?.session?.admin === true) {
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin session not found'
    });
  } catch (err) {
    console.error('Admin session auth error:', err);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
};

export default requireAdminSession;
