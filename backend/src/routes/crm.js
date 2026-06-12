const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

const CLOSE_CLIENT_ID = process.env.CLOSE_CLIENT_ID;
const CLOSE_CLIENT_SECRET = process.env.CLOSE_CLIENT_SECRET;
const CLOSE_CONFIGURED = CLOSE_CLIENT_ID && CLOSE_CLIENT_SECRET
  && CLOSE_CLIENT_ID !== 'your_close_client_id'
  && CLOSE_CLIENT_ID.startsWith('oa2client_');

const REDIRECT_URI = `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/crm/close/callback`;

router.get('/close/auth', (req, res) => {
  if (!CLOSE_CONFIGURED) {
    return res.json({
      mock: true,
      message: 'Close CRM connection simulated (sandbox mode)',
      crmConnected: true,
    });
  }
  const url = `https://app.close.com/oauth2/authorize?client_id=${CLOSE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=read_lead write_lead&state=${req.query.state || ''}`;
  res.redirect(url);
});

router.get('/close/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    const tokenRes = await axios.post('https://api.close.com/oauth2/token', {
      grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI,
      client_id: CLOSE_CLIENT_ID, client_secret: CLOSE_CLIENT_SECRET,
    });
    const { access_token, refresh_token } = tokenRes.data;

    if (state) {
      await prisma.cRMConnection.upsert({
        where: { workspaceId: state },
        update: { accessToken: access_token, refreshToken: refresh_token || null, isActive: true, lastSyncedAt: new Date() },
        create: { workspaceId: state, provider: 'close', accessToken: access_token, refreshToken: refresh_token || null },
      });
    }
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?crm=connected`);
  } catch (err) {
    console.error('Close OAuth error:', err.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?crm=error`);
  }
});

/* ── POST /api/crm/connect — validate API key against Close, store in DB ── */
router.post('/connect', async (req, res) => {
  try {
    const { apiKey, workspaceId } = req.body;
    if (!apiKey) return res.status(400).json({ error: 'API key is required' });
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId is required' });

    const meRes = await axios.get('https://api.close.com/v1/me/', {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000,
    });

    const { id: crmUserId, email: crmEmail } = meRes.data;

    await prisma.cRMConnection.upsert({
      where: { workspaceId },
      update: { accessToken: apiKey, crmUserId, crmEmail, isActive: true, lastSyncedAt: new Date() },
      create: { workspaceId, provider: 'close', accessToken: apiKey, crmUserId, crmEmail },
    });

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { stripeSubscriptionId: 'crm_connected' },
    });

    res.json({ success: true, crmUserId, crmEmail, message: 'Close CRM API key validated and saved' });
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      return res.status(401).json({ error: 'Invalid API key — Close CRM rejected the credentials' });
    }
    console.error('CRM connect error:', err.message);
    res.status(500).json({ error: 'Failed to connect CRM: ' + err.message });
  }
});

/* ── POST /api/crm/push-lead — push a lead to Close CRM ── */
router.post('/push-lead', async (req, res) => {
  try {
    const { workspaceId, name, email, phone, description } = req.body;
    if (!workspaceId || !name) return res.status(400).json({ error: 'workspaceId and name required' });

    const conn = await prisma.cRMConnection.findUnique({ where: { workspaceId } });
    if (!conn || !conn.isActive) return res.status(400).json({ error: 'No active CRM connection for this workspace' });

    const leadPayload = { name };
    if (email) leadPayload.contacts = [{ emails: [{ email }] }];
    if (phone) {
      if (!leadPayload.contacts) leadPayload.contacts = [];
      leadPayload.contacts[0].phones = leadPayload.contacts[0].phones || [];
      leadPayload.contacts[0].phones.push({ phone });
    }
    if (description) leadPayload.description = description;

    const createRes = await axios.post('https://api.close.com/v1/lead/', leadPayload, {
      headers: { Authorization: `Bearer ${conn.accessToken}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    res.json({ success: true, crmLeadId: createRes.data.id, crmRecordUrl: createRes.data.url });
  } catch (err) {
    console.error('Push lead error:', err.message);
    res.status(500).json({ error: 'Failed to push lead to CRM' });
  }
});

module.exports = router;
