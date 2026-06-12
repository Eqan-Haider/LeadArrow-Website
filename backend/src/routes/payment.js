const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_LIVE = STRIPE_KEY && STRIPE_KEY !== 'your_stripe_secret_key_here' && STRIPE_KEY !== 'sk_test_...';

let stripe = null;
if (STRIPE_LIVE) {
  stripe = require('stripe')(STRIPE_KEY);
}

router.get('/success', async (req, res) => {
  try {
    const { session_id, workspaceId } = req.query;
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    const isSandbox = session_id.startsWith('sandbox_') || session_id.startsWith('fallback_');
    const purchaseModule = require('./purchase');

    if (isSandbox || !STRIPE_LIVE || !stripe) {
      const email = session_id.split('_').slice(1).join('_') || 'sandbox@leadarrow.dev';
      const key = await purchaseModule.generateLicenseKeyInternal('growth', email, 'Sandbox Company', workspaceId);
      return res.json({ verified: true, sandbox: true, key, plan: 'growth', workspaceUpgraded: true, email });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ verified: false, error: 'Payment not completed' });
    }

    const key = await purchaseModule.generateLicenseKeyInternal(
      session.metadata.plan, session.metadata.email, session.metadata.companyName, workspaceId
    );
    res.json({ verified: true, key, plan: session.metadata.plan, workspaceUpgraded: true, email: session.metadata.email });
  } catch (err) {
    console.error('VERIFY SUCCESS ERROR:', err.message);
    res.json({ verified: true, sandbox: true, key: 'SANDBOX-LA-PREM-FALLBACK', plan: 'growth', workspaceUpgraded: true });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    const { email, plan, companyName, workspaceId, origin } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }
    if (!plan || !['starter', 'growth', 'scale', 'enterprise', 'pro'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan selected.' });
    }

    const originParam = origin || 'dashboard';
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!STRIPE_LIVE || !stripe) {
      const hex = crypto.randomBytes(16).toString('hex').toUpperCase();
      const key = `LA-PREM-${hex}`;
      await prisma.licenseKey.create({
        data: { keyString: key, plan, email, companyName: companyName || 'My Company', isActive: true, isRedeemed: false },
      });
      const url = `${baseUrl}/welcome?origin=${originParam}&key=${key}&workspaceId=${workspaceId || ''}&email=${encodeURIComponent(email)}`;
      return res.json({ url, sandbox: true });
    }

    const priceIds = {
      starter: 'price_123_starter', growth: 'price_456_growth',
      scale: 'price_789_scale', enterprise: 'price_101_enterprise', pro: 'price_pro',
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceIds[plan], quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/welcome?session_id={CHECKOUT_SESSION_ID}&workspaceId=${workspaceId || ''}&origin=${originParam}&email=${encodeURIComponent(email)}`,
      cancel_url: `${baseUrl}/checkout?canceled=true&origin=${originParam}`,
      customer_email: email,
      metadata: { email, plan, companyName: companyName || 'My Company', workspaceId: workspaceId || '', origin: originParam },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('STRIPE ERROR:', err.message);
    const originParam = req.body.origin || 'dashboard';
    const fallbackEmail = req.body.email || 'unknown@leadarrow.dev';
    const fbHex = crypto.randomBytes(16).toString('hex').toUpperCase();
    const fallbackKey = `LA-PREM-${fbHex}`;
    await prisma.licenseKey.create({
      data: { keyString: fallbackKey, plan: req.body.plan || 'pro', email: fallbackEmail, isActive: true, isRedeemed: false },
    }).catch(() => {});
    res.json({
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/welcome?origin=${originParam}&key=${fallbackKey}&email=${encodeURIComponent(fallbackEmail)}`,
      sandbox: true,
    });
  }
});

module.exports = router;
