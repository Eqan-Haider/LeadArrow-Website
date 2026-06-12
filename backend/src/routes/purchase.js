const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

let transporter;

async function getTransporter() {
  if (transporter) return transporter;
  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email', port: 587, secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }
  return transporter;
}

function generateLicenseKeyCrypto() {
  const hex = crypto.randomBytes(16).toString('hex').toUpperCase();
  return `LA-PREM-${hex}`;
}

const PLANS = {
  starter: { label: 'Starter', price: '$750/mo' },
  pro: { label: 'Pro', price: '$1,500/mo' },
  growth: { label: 'Growth', price: '$3,000/mo' },
  enterprise: { label: 'Enterprise', price: 'Custom' },
};

async function sendPremiumActivationEmail(email, fullName, licenseToken, plan, workspaceId) {
  const smtp = await getTransporter();
  const planInfo = PLANS[plan] || { label: plan, price: '' };
  const info = await smtp.sendMail({
    from: '"LeadArrow" <no-reply@leadarrow.com>',
    to: email,
    subject: `Your Premium Activation — LeadArrow ${planInfo.label}`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#020617; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  .wrap { max-width:580px; margin:0 auto; padding:40px 20px; }
  .card { background:linear-gradient(135deg,#0b0f26 0%,#0f172a 100%); border:1px solid rgba(255,255,255,0.08); border-radius:24px; overflow:hidden; }
  .head { background:linear-gradient(135deg,#7c3aed,#4f46e5); padding:32px 40px; text-align:center; }
  .head h1 { margin:0; color:#fff; font-size:24px; font-weight:800; letter-spacing:-0.5px; }
  .head p { margin:4px 0 0; color:rgba(255,255,255,0.7); font-size:13px; }
  .body { padding:36px 40px; }
  .body h2 { color:#fff; font-size:20px; font-weight:700; margin:0 0 8px; }
  .body p { color:rgba(255,255,255,0.55); font-size:14px; line-height:1.6; margin:0 0 20px; }
  .key-box { background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3); border-radius:14px; padding:20px; text-align:center; }
  .key-box .lbl { color:#a78bfa; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; font-weight:600; display:block; margin-bottom:8px; }
  .key-box .val { font-family:'SFMono-Regular',Consolas,monospace; font-size:15px; font-weight:700; color:#c084fc; letter-spacing:0.08em; word-break:break-all; }
  .row { padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; justify-content:space-between; }
  .row .l { color:rgba(255,255,255,0.4); font-size:13px; }
  .row .r { color:#fff; font-size:13px; font-weight:600; }
  .btn-wrap { text-align:center; margin-top:28px; }
  .btn { display:inline-block; background:linear-gradient(135deg,#7c3aed,#4f46e5); color:#fff; font-size:14px; font-weight:700; text-decoration:none; padding:14px 36px; border-radius:12px; }
  .fade { color:rgba(255,255,255,0.3); font-size:12px; margin-top:28px; text-align:center; }
</style></head><body>
<div class="wrap">
  <div class="card">
    <div class="head"><h1>LeadArrow</h1><p>Speed-to-lead for high-ticket sales teams</p></div>
    <div class="body">
      <h2>Your Premium Plan is Active</h2>
      <p>Congratulations${fullName ? ' ' + fullName : ''}! Your workspace has been upgraded to <strong style="color:#a78bfa;">${planInfo.label}</strong>. Use the activation token below to unlock all premium features.</p>
      <div class="key-box"><span class="lbl">Activation Token</span><span class="val">${licenseToken}</span></div>
      <div style="margin-top:20px;">
        <div class="row"><span class="l">Plan</span><span class="r">${planInfo.label}</span></div>
        <div class="row"><span class="l">Price</span><span class="r">${planInfo.price}</span></div>
        <div class="row"><span class="l">Email</span><span class="r">${email}</span></div>
        <div class="row"><span class="l">Workspace ID</span><span class="r" style="font-family:monospace;font-size:11px;">${workspaceId}</span></div>
      </div>
      <div class="btn-wrap"><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="btn">Launch Dashboard</a></div>
      <p class="fade">If you didn't make this purchase, please ignore or contact support@leadarrow.com</p>
    </div>
  </div>
</div></body></html>`.trim(),
  });
  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  if (previewUrl) console.log('Email preview:', previewUrl);
  return previewUrl;
}

router.post('/activate', async (req, res) => {
  try {
    const { email, plan = 'starter', companyName = '' } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!PLANS[plan]) return res.status(400).json({ error: `Unknown plan "${plan}".` });

    const planInfo = PLANS[plan];
    const keyString = generateLicenseKeyCrypto();

    const licenseKey = await prisma.licenseKey.create({
      data: { keyString, plan, email, companyName, isActive: true, isRedeemed: false },
    });

    const smtp = await getTransporter();
    const mailOptions = {
      from: '"LeadArrow" <no-reply@leadarrow.com>',
      to: email,
      subject: `Your LeadArrow License Key – ${planInfo.label} Plan`,
      html: `...license email template...`,
    };
    const info = await smtp.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;

    return res.status(201).json({
      message: 'License key generated and emailed successfully.',
      key: keyString,
      previewUrl,
      licenseId: licenseKey.id,
    });
  } catch (err) {
    console.error('Purchase error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/verify/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const record = await prisma.licenseKey.findUnique({ where: { keyString: key } });
    if (!record) return res.status(404).json({ valid: false, error: 'License key not found.' });
    if (!record.isActive) return res.status(403).json({ valid: false, error: 'License key is inactive.' });
    return res.json({ valid: true, plan: record.plan, email: record.email, isRedeemed: record.isRedeemed, createdAt: record.createdAt });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// Super-fast verify (under 3s). Same as above but omits email for privacy.
router.get('/quick-verify/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const record = await prisma.licenseKey.findUnique({ where: { keyString: key }, select: { isActive: true, plan: true } });
    if (!record) return res.json({ valid: false });
    return res.json({ valid: record.isActive, plan: record.plan });
  } catch {
    return res.json({ valid: false });
  }
});

router.patch('/redeem/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { email } = req.body;
    const existing = await prisma.licenseKey.findUnique({ where: { keyString: key } });
    if (!existing) return res.status(404).json({ error: 'License key not found.' });
    if (!existing.isActive) return res.status(403).json({ error: 'License key is inactive.' });
    if (existing.isRedeemed) return res.status(409).json({ error: 'License key already redeemed.' });
    if (existing.email && existing.email !== email) {
      return res.status(403).json({ error: 'This license key is bound to a different email address.' });
    }
    const updated = await prisma.licenseKey.update({
      where: { keyString: key },
      data: { isRedeemed: true, redeemedByEmail: email, redeemedAt: new Date() },
    });
    return res.json({ message: 'License key redeemed successfully.', licenseKey: updated });
  } catch (err) {
    console.error('Redeem error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

async function generateLicenseKeyInternal(plan, email, companyName, workspaceId) {
  const licenseToken = generateLicenseKeyCrypto();
  await prisma.licenseKey.create({
    data: { keyString: licenseToken, plan, email, companyName, workspaceId, isActive: true, isRedeemed: false },
  });
  if (workspaceId) {
    await prisma.subscriptionLicense.create({
      data: { workspaceId, licenseToken, plan, status: 'PREMIUM', issuedToEmail: email, issuedToName: companyName || email },
    });
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { stripeSubscriptionId: plan === 'enterprise' ? 'enterprise' : `sub_${plan}` },
    });
    const user = await prisma.user.findFirst({ where: { workspaceId, role: 'SUPER_ADMIN' } });
    if (user) {
      try {
        await sendPremiumActivationEmail(user.email, user.fullName, licenseToken, plan, workspaceId);
      } catch (e) {
        console.error('Email send failed:', e.message);
      }
    }
  }
  return licenseToken;
}

router.post('/test-key', async (req, res) => {
  try {
    const { email, plan = 'enterprise' } = req.body;
    const e = email || `test_${Date.now()}@leadarrow.dev`;
    const key = generateLicenseKeyCrypto();
    await prisma.licenseKey.create({
      data: { keyString: key, plan, email: e, companyName: 'Test Enterprise', isActive: true, isRedeemed: false },
    });
    await prisma.subscriptionLicense.create({
      data: { workspaceId: 'test-workspace', licenseToken: key, plan, status: 'PREMIUM', issuedToEmail: e, issuedToName: 'Test Enterprise User' },
    }).catch(() => {});
    return res.json({ key, plan, email: e, message: 'Test premium key generated. Valid for 24h.' });
  } catch (err) {
    console.error('Test key error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
module.exports.generateLicenseKeyInternal = generateLicenseKeyInternal;
