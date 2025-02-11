const jwt = require('jsonwebtoken');  // Import JWT library

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach user info to request object
    next();  // Move to the next middleware or route
  } catch (err) {
    res.status(403).json({ msg: 'Token is not valid' });
  }
}

// Middleware to check if user is an admin
function isAdmin(req, res, next) {
    console.log('Decoded Token:', req.user); 
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }
  next();
}

// Export both middleware functions
module.exports = { authenticateToken, isAdmin };