// src/routes/authRoutes.js
const express = require("express");
const { signup, login, forgotPassword, resetPassword, refresh, logout, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/auth");

const router = express.Router();

// Public Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Protected Route
router.get("/me", protect, getMe);

module.exports = router;