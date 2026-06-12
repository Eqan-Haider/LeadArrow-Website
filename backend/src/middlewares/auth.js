// src/middlewares/auth.js
const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Not authorized" });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_ACCESS_SECRET || "access_secret_123");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token invalid or expired" });
  }
};

module.exports = { protect };