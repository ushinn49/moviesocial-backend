const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Check session first
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    req.userRole = req.session.userRole;
    return next();
  }

  // Check JWT token as fallback
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No authentication token, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

// 新增：检查用户是否为critic或admin
const requireCritic = (req, res, next) => {
  if (req.userRole !== 'critic' && req.userRole !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. This feature requires critic privileges.' 
    });
  }
  next();
};

module.exports = { auth, requireRole, requireCritic };