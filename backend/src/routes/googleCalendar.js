const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = (process.env.API_URL || 'http://localhost:5001') + '/api/workspace/calendar/callback';

async function refreshAccessToken(userId, currentRefreshToken) {
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: currentRefreshToken,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) return null;
    await prisma.user.update({
      where: { id: userId },
      data: {
        calendarAccessToken: tokens.access_token,
        ...(tokens.refresh_token ? { calendarRefreshToken: tokens.refresh_token } : {}),
      },
    });
    return tokens.access_token;
  } catch (e) {
    console.error('[Calendar] Token refresh failed:', e.message);
    return null;
  }
}

function getAuthUrl(userId) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state: userId,
  });
  return 'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString();
}

// GET /api/workspace/calendar/auth?userId=xxx – redirect to Google consent
router.get('/calendar/auth', (req, res) => {
  const userId = req.query.userId || req.user?.id;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  res.redirect(getAuthUrl(userId));
});

// GET /api/workspace/calendar/callback – handle OAuth callback
router.get('/calendar/callback', async (req, res) => {
  try {
    const { code, state: userId } = req.query;
    if (!code || !userId) return res.status(400).send('Missing code or userId');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) return res.status(400).send('Failed to get access token');

    await prisma.user.update({
      where: { id: userId },
      data: {
        calendarConnected: true,
        calendarAccessToken: tokens.access_token,
        calendarRefreshToken: tokens.refresh_token || '',
      },
    });

    res.redirect((process.env.FRONTEND_URL || 'http://localhost:3000') + '/dashboard?calendar=connected');
  } catch (err) {
    console.error('Google Calendar OAuth callback error:', err);
    res.status(500).send('OAuth failed');
  }
});

module.exports = router;
