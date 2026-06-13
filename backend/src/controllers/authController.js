const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER || process.env.ETHEREAL_USER,
    pass: process.env.SMTP_PASS || process.env.ETHEREAL_PASS,
  },
});

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      companyName: user.companyName,
      companyId: user.companyId || user.id,
      subscriptionTier: user.subscriptionTier || null,
      isActivated: user.isActivated || false,
    },
    process.env.ACCESS_TOKEN_SECRET || process.env.JWT_ACCESS_SECRET || "access_secret_123",
    { expiresIn: "7d" }
  );
};

const signup = async (req, res) => {
  try {
    const { email, password, fullName, companyName, role, phoneNumber, tcpaConsent, tcpaConsentedAt, smsConsent, smsConsentedAt } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (phoneNumber && phoneNumber.replace(/\D/g, '').length < 4) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    if (!tcpaConsent) {
      return res.status(400).json({ error: "TCPA/GDPR consent is required to create an account" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        companyName: companyName || "",
        phoneNumber: phoneNumber || "",
        role: role || "USER",
        tcpaConsent: true,
        tcpaConsentedAt: tcpaConsentedAt ? new Date(tcpaConsentedAt) : new Date(),
        smsConsent: smsConsent || false,
        smsConsentedAt: smsConsentedAt ? new Date(smsConsentedAt) : smsConsent ? new Date() : null,
        isActivated: false,
      },
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { companyId: user.id },
    });

    const accessToken = generateAccessToken(updatedUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      accessToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        companyName: updatedUser.companyName,
        companyId: updatedUser.companyId,
        role: updatedUser.role,
        subscriptionTier: updatedUser.subscriptionTier || 'BASIC',
        isActivated: updatedUser.isActivated || false,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error during signup" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.companyId) {
      await prisma.user.update({ where: { id: user.id }, data: { companyId: user.id } });
      user.companyId = user.id;
    }

    const accessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        companyId: user.companyId,
        role: user.role,
        subscriptionTier: user.subscriptionTier || 'BASIC',
        isActivated: user.isActivated || false,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: "If that email exists, a reset link has been sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        code: resetCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    try {
      var info = await transporter.sendMail({
        from: `"LeadArrow" <${process.env.SMTP_FROM || "noreply@leadarrow.com"}>`,
        to: email,
        subject: "Password Reset - LeadArrow",
        html: `<div style="background:#0B0F19;color:#e2e8f0;padding:40px;font-family:sans-serif;max-width:480px;margin:0 auto;border-radius:16px;">
          <h1 style="color:#fff;font-size:24px;margin-bottom:8px;">Password Reset</h1>
          <p style="color:#94a3b8;margin-bottom:24px;">Use the code below or click the link to reset your password. This link expires in 15 minutes.</p>
          <div style="background:#141923;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
            <p style="color:#94a3b8;font-size:12px;margin-bottom:4px;">Reset Code</p>
            <p style="color:#6366f1;font-size:32px;font-weight:700;letter-spacing:8px;">${resetCode}</p>
          </div>
          <a href="${resetUrl}" style="display:block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px;border-radius:10px;font-weight:600;text-align:center;margin-bottom:16px;">Reset Password</a>
          <p style="color:#64748b;font-size:12px;">If you did not request this, please ignore this email.</p>
        </div>`,
      });
      if (info && info.messageId) {
        console.log("[Email] Password reset sent to", email, "| Preview:", nodemailer.getTestMessageUrl(info) || "N/A");
      }
    } catch (mailErr) {
      console.error("Failed to send reset email:", mailErr.message);
    }

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, token, code, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    if (!token && !code) {
      return res.status(400).json({ error: "Token or code is required" });
    }

    const recentTokens = await prisma.passwordResetToken.findMany({
      where: { email, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    let validToken = null;
    for (const t of recentTokens) {
      if (code && t.code === code) { validToken = t; break; }
      if (token) {
        const hashedInput = crypto.createHash("sha256").update(token).digest("hex");
        if (t.token === hashedInput) { validToken = t; break; }
      }
    }

    if (!validToken) {
      return res.status(400).json({ error: "Invalid or expired reset token/code" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

    await prisma.passwordResetToken.update({
      where: { id: validToken.id },
      data: { used: true },
    });

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const refresh = async (req, res) => { res.send({ message: "Refreshed" }); };
const logout = async (req, res) => { res.send({ message: "Logged out" }); };
const getMe = async (req, res) => { res.json({ user: req.user }); };

module.exports = { signup, login, forgotPassword, resetPassword, refresh, logout, getMe };
