const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

const CREDENTIALS = {
  gohighlevel: {
    clientId: process.env.GHL_CLIENT_ID || '',
    clientSecret: process.env.GHL_CLIENT_SECRET || '',
    authUrl: 'https://marketplace.gohighlevel.com/oauth/authorize',
    tokenUrl: 'https://services.leadconnectorhq.com/oauth/token',
    scope: 'contacts/crud%20opportunities/crud',
  },
  salesforce: {
    clientId: process.env.SF_CLIENT_ID || '',
    clientSecret: process.env.SF_CLIENT_SECRET || '',
    authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
    scope: 'api%20id',
  },
  hubspot: {
    clientId: process.env.HUBSPOT_CLIENT_ID || '',
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET || '',
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    scope: 'crm.objects.contacts.read%20crm.objects.contacts.write',
  },
};

function isConfigured(provider) {
  const creds = CREDENTIALS[provider];
  return creds && creds.clientId && creds.clientId.length > 10;
}

router.get('/:provider/auth', (req, res) => {
  const { provider } = req.params;
  const { workspaceId } = req.query;
  const creds = CREDENTIALS[provider];
  if (!creds) return res.status(400).json({ error: 'Unknown provider' });

  if (!isConfigured(provider)) {
    return res.json({
      mock: true,
      provider,
      message: `${provider} connection simulated (sandbox mode — set ${provider.toUpperCase()}_CLIENT_ID in .env)`,
      crmConnected: true,
    });
  }

  const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/crm-oauth/${provider}/callback`;
  const url = `${creds.authUrl}?client_id=${creds.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${creds.scope}&state=${workspaceId || ''}`;
  res.redirect(url);
});

router.get('/:provider/callback', async (req, res) => {
  const { provider } = req.params;
  const { code, state: workspaceId } = req.query;
  const creds = CREDENTIALS[provider];
  if (!creds || !code) return res.status(400).send('Missing parameters');

  try {
    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/crm-oauth/${provider}/callback`;
    const tokenRes = await fetch(creds.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) return res.status(400).send('Failed to get access token');

    if (workspaceId) {
      const existing = await prisma.cRMConnection.findUnique({ where: { workspaceId } });
      if (existing) {
        await prisma.cRMConnection.update({
          where: { workspaceId },
          data: { provider, accessToken: tokens.access_token, refreshToken: tokens.refresh_token || null, isActive: true, lastSyncedAt: new Date() },
        });
      } else {
        await prisma.cRMConnection.create({
          data: { workspaceId, provider, accessToken: tokens.access_token, refreshToken: tokens.refresh_token || null },
        });
      }
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?crm=${provider}=connected`);
  } catch (err) {
    console.error(`${provider} OAuth error:`, err.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?crm=error`);
  }
});

module.exports = router;
