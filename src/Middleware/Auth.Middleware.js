const jwt = require('jsonwebtoken');
const User = require('../Models/User.Model');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(403).send({ message: 'No token provided' });

  // Extract token from Bearer format
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).send({ message: "Invalid Token" });

    try {
      // Find user and attach to req.user for compatibility with API routes
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }
      
      req.user = user;
      req.userid = decoded.userId;
      next();
    } catch (error) {
      return res.status(401).send({ message: "Invalid Token" });
    }
  });
}

module.exports = authMiddleware;