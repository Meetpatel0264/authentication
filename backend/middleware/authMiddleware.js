const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const bearer = req.headers.authorization;
    const headerToken = bearer?.startsWith("Bearer ") ? bearer.split(" ")[1] : null;
    const token = req.cookies.token || headerToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
