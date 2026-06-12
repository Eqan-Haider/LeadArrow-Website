const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;