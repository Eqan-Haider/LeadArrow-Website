const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer'); // assuming you already have it configured

// For raw body parsing needed for Stripe signature verification
// In server.js, you need to add this before this route:
// app.use('/api/purchase/webhook', express.raw({ type: 'application/json' }));

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { email, plan, companyName } = session.metadata;

    // Generate a license key (use a function to generate unique key)
    const keyString = generateLicenseKey();

    // Use a transaction to ensure consistency
    try {
      await prisma.$transaction(async (tx) => {
        // Check if this session already processed (using session ID as idempotency key)
        const existing = await tx.licenseKey.findFirst({
          where: { stripeSessionId: session.id },
        });
        if (existing) return;

        // Create the license key record
        await tx.licenseKey.create({
          data: {
            keyString,
            plan,
            email,
            companyName,
            isActive: true,
            isRedeemed: false,
            stripeSessionId: session.id,
          },
        });

        // Send email with the key (using your existing nodemailer setup)
        await sendLicenseKeyEmail(email, keyString, plan, companyName);
      });

      console.log(`License key generated for ${email}`);
    } catch (err) {
      console.error('Database/webhook error:', err);
      // Still return 200 to Stripe to avoid retries
    }
  }

  res.json({ received: true });
});

function generateLicenseKey() {
  const part = () => Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LA-${part()}-${part()}-${part()}`;
}

async function sendLicenseKeyEmail(to, key, plan, companyName) {
  // Use your existing nodemailer transporter (Ethereal for test, SendGrid for prod)
  // This is a placeholder – replace with your actual email sending logic
  const transporter = nodemailer.createTransport({
    host: process.env.ETHEREAL_HOST || 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
  });

  const mailOptions = {
    from: '"LeadArrow" <no-reply@leadarrow.com>',
    to,
    subject: `Your LeadArrow License Key – ${plan} Plan`,
    html: `
      <div style="background:#0f172a; color:#e2e8f0; padding:20px; font-family:sans-serif;">
        <h2>Thank you for purchasing LeadArrow!</h2>
        <p>Your plan: <strong>${plan}</strong></p>
        <p>Your license key:</p>
        <div style="background:#1e293b; padding:10px; border-radius:4px; font-size:1.2rem; letter-spacing:2px; color:#38bdf8;">
          ${key}
        </div>
        <p>Use this key to activate your account when you sign up or in your dashboard.</p>
        <hr />
        <small>If you didn't make this purchase, please ignore this email.</small>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('License key email sent:', info.messageId);
  } catch (err) {
    console.error('Email sending failed:', err);
  }
}

module.exports = router;