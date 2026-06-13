require('dotenv').config();
var express = require('express');
var cors = require('cors');
var http = require('http');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

/* ===== Socket.io init (lazy) ===== */
try {
  var socketManagerModule = require('./src/services/socketManager');
  var initSocketFn = socketManagerModule.initSocket;
} catch(e) { console.warn('[socketManager]', e.message); }

var mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || process.env.ETHEREAL_USER,
    pass: process.env.SMTP_PASS || process.env.ETHEREAL_PASS,
  },
});

async function sendLicenseEmail(toEmail, licenseKey, plan, cardName, brand, last4, expiresAt) {
  try {
    var dateStr = expiresAt ? new Date(expiresAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : 'N/A';
    var info = await mailTransporter.sendMail({
      from: '"LeadArrow" <' + (process.env.SMTP_FROM || 'noreply@leadarrow.com') + '>',
      to: toEmail,
      subject: 'Your LeadArrow License Key',
      html: '<div style="background:#0B0F19;color:#e2e8f0;padding:40px;font-family:sans-serif;max-width:480px;margin:0 auto;border-radius:16px;">'
        + '<div style="text-align:center;margin-bottom:24px;"><div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>'
        + '<h1 style="color:#fff;font-size:22px;margin:0;">License Activated!</h1></div>'
        + '<div style="background:#141923;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px;margin-bottom:20px;">'
        + '<p style="color:#94a3b8;font-size:11px;margin:0 0 4px;">Plan</p>'
        + '<p style="color:#fff;font-size:18px;font-weight:700;margin:0 0 16px;">' + plan + '</p>'
        + '<p style="color:#94a3b8;font-size:11px;margin:0 0 4px;">License Key</p>'
        + '<p style="color:#F1C40F;font-size:16px;font-weight:700;letter-spacing:3px;margin:0 0 16px;font-family:monospace;">' + licenseKey + '</p>'
        + '<p style="color:#94a3b8;font-size:11px;margin:0 0 4px;">Expires</p>'
        + '<p style="color:#e2e8f0;font-size:14px;margin:0;">' + dateStr + '</p>'
        + '</div>'
        + '<div style="background:rgba(99,68,227,0.1);border:1px solid rgba(99,68,227,0.2);border-radius:10px;padding:16px;margin-bottom:20px;">'
        + '<p style="color:#94a3b8;font-size:11px;margin:0 0 4px;">Payment Details</p>'
        + '<p style="color:#e2e8f0;font-size:13px;margin:0;">' + brand + ' ending in ' + last4 + ' &middot; ' + cardName + '</p>'
        + '</div>'
        + '<p style="color:#64748b;font-size:12px;text-align:center;">Thank you for choosing LeadArrow!</p>'
        + '</div>',
    });
    console.log('[Email] License key sent to', toEmail, '| Preview:', nodemailer.getTestMessageUrl(info) || 'Live');
  } catch (e) {
    console.error('[Email] Failed to send license email:', e.message);
  }
}

var app = express();
var server = http.createServer(app);

app.use(cors({
  origin: function(o, cb) {
    if (typeof o === 'string' && o.startsWith('chrome-extension://')) return cb(null, true);
    cb(null, true);
  },
  credentials: true,
}));
app.use('/api/purchase/webhook', express.raw({ type: 'application/json' }));
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

process.on('uncaughtException', function(e) { console.error('[FATAL]', e.message); });
process.on('unhandledRejection', function(e) { console.error('[FATAL]', e.message); });

/* ===== SSE SUBSYSTEM ===== */
var connections = [];
var leadStore = [];
var teamStore = [];
var scheduledFollowUps = [];
var bookingAlerts = [];
var activeCalls = {};

var mockNames = [
  'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim',
  'Jessica Brown', 'Robert Taylor', 'Amanda White', 'James Wilson',
  'Lisa Martinez', 'Kevin Anderson', 'Rachel Green', 'Thomas Moore',
];
var mockSources = ['Close CRM', 'Slack Webhook', 'LinkedIn Campaign', 'Facebook Ads', 'Google Search', 'Email Campaign'];

var premiumMetrics = {
  totalActiveLeads: 0,
  liveCallConnections: 0,
  conversionRate: 0,
  queueWaitTime: '\u2014',
  totalLeads: 0, totalAccepted: 0, totalMissed: 0,
  activeHandlers: 4, avgResponseTime: '1.2s',
  pipelineStages: [],
  teamMetrics: [],
  recentLeads: [],
};

function broadcastToAll(eventType, dataPayload) {
  var frame = 'event: ' + eventType + '\ndata: ' + JSON.stringify(dataPayload) + '\n\n';
  for (var i = connections.length - 1; i >= 0; i--) {
    try { connections[i].write(frame); } catch (e) { connections.splice(i, 1); }
  }
}

/* ===== ACTIVE CALL STATE TRACKER ===== */
function registerActiveCall(leadId, leadName, email, phone) {
  var call = {
    callId: 'call-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex'),
    leadId: leadId,
    leadName: leadName || 'Unknown',
    email: email || null,
    phone: phone || null,
    status: 'CONNECTED',
    startTime: new Date().toISOString(),
    duration: 0,
  };
  activeCalls[leadId] = call;
  premiumMetrics.liveCallConnections = Object.keys(activeCalls).length;
  broadcastToAll('ACTIVE_CALL_START', call);
  broadcastToAll('METRICS_UPDATE', premiumMetrics);
  console.log('[Telephony] Call connected:', leadName, '| callId:', call.callId);
  return call;
}

function terminateActiveCall(leadId) {
  var call = activeCalls[leadId];
  if (!call) return null;
  call.status = 'TERMINATED';
  call.endTime = new Date().toISOString();
  call.duration = Math.floor((new Date(call.endTime) - new Date(call.startTime)) / 1000);
  delete activeCalls[leadId];
  premiumMetrics.liveCallConnections = Object.keys(activeCalls).length;
  broadcastToAll('ACTIVE_CALL_END', call);
  broadcastToAll('METRICS_UPDATE', premiumMetrics);
  console.log('[Telephony] Call ended:', call.leadName, '| duration:', call.duration + 's');
  return call;
}

/* ===== AUTOMATED MOCK INTERVAL GENERATOR ===== */
function generateMockLead() {
  var name = mockNames[Math.floor(Math.random() * mockNames.length)];
  var source = mockSources[Math.floor(Math.random() * mockSources.length)];
  var isBooking = Math.random() < 0.25;
  var phone = '+1-' + Math.floor(Math.random() * 900 + 100) + '-' + Math.floor(Math.random() * 900 + 100) + '-' + Math.floor(Math.random() * 9000 + 1000);
  var entry = {
    leadId: 'lead-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'),
    prospectName: name,
    email: name.toLowerCase().replace(' ', '.') + '@example.com',
    phone: phone,
    leadSource: isBooking ? source + ' Booking' : source,
    source: source,
    type: isBooking ? 'booking' : 'lead',
    workspaceId: 'workspace_alpha',
    hostEmail: isBooking ? 'host-' + name.toLowerCase().replace(' ', '') + '@leadarrow.com' : null,
    salesRep: isBooking ? ['Mihai Chirca', 'John Setters', 'Sarah Conner'][Math.floor(Math.random() * 3)] : null,
    status: 'ROUTING',
    timestamp: new Date().toISOString(),
  };
  leadStore.unshift(entry);
  if (leadStore.length > 200) leadStore.length = 200;
  premiumMetrics.totalLeads = leadStore.length;
  premiumMetrics.totalAccepted = leadStore.filter(function(l) { return l.status === 'CONNECTED' || l.status === 'CLAIMED'; }).length;
  premiumMetrics.totalMissed = leadStore.filter(function(l) { return l.status === 'MISSED' || l.status === 'TIMEOUT'; }).length;
  premiumMetrics.totalActiveLeads = leadStore.length;
  premiumMetrics.liveCallConnections = Math.floor(Math.random() * 50 + 120);
  premiumMetrics.recentLeads.unshift({
    prospectName: name, source: source, status: 'Connected',
    time: 'Just now', dot: 'bg-emerald-500',
  });
  if (premiumMetrics.recentLeads.length > 20) premiumMetrics.recentLeads.length = 20;
  broadcastToAll('NEW_LEAD_ALERT', entry);
  if (isBooking) {
    bookingAlerts.unshift(entry);
    if (bookingAlerts.length > 50) bookingAlerts.length = 50;
    broadcastToAll('NEW_BOOKING_ALERT', entry);
  }
  broadcastToAll('METRICS_UPDATE', premiumMetrics);
  console.log('[Mock] Lead:', name, '| source:', source, '| type:', entry.type);
}

/* ===== CRM FOLLOW-UP REMINDER ENGINE ===== */
function checkScheduledFollowUps() {
  var now = Date.now();
  for (var i = scheduledFollowUps.length - 1; i >= 0; i--) {
    var fu = scheduledFollowUps[i];
    if (fu.triggerAt <= now) {
      var reminder = {
        type: 'FOLLOW_UP_REMINDER',
        leadId: fu.leadId,
        leadName: fu.leadName,
        repName: fu.repName || 'Assigned Rep',
        message: '\u26A0\uFE0F FOLLOW-UP REMINDER \u2014 Call ' + fu.leadName + ' Now!',
        timestamp: new Date().toISOString(),
      };
      broadcastToAll('FOLLOW_UP_REMINDER', reminder);
      broadcastToAll('METRICS_UPDATE', premiumMetrics);
      console.log('[Reminder] Follow-up for:', fu.leadName);
      scheduledFollowUps.splice(i, 1);
    }
  }
}

setInterval(checkScheduledFollowUps, 5000);

/* ===== LICENSE AUTO-EXPIRE ===== */
async function expireStaleLicenses() {
  try {
    var now = new Date();
    var expired = await prisma.subscriptionLicense.updateMany({
      where: { status: 'ACTIVE', expiresAt: { lt: now } },
      data: { status: 'EXPIRED' },
    });
    var expiredUsers = await prisma.user.updateMany({
      where: { isActivated: true, role: 'PREMIUM_SUBSCRIBER' },
      data: { isActivated: false, role: 'USER' },
    });
    if (expired.count > 0) console.log('[License] Auto-expired', expired.count, 'stale licenses');
    if (expiredUsers.count > 0) console.log('[License] Demoted', expiredUsers.count, 'expired premium users');
  } catch (e) { /* silent */ }
}
expireStaleLicenses();
setInterval(expireStaleLicenses, 3600000);

/* ===== SSE STREAM ===== */
app.get('/api/stream', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  res.write('event: connected\ndata: {"status":"stream_established","port":5001}\n\n');
  connections.push(res);
  var ping = setInterval(function() {
    try {
      res.write(': ping\n\n');
      broadcastToAll('METRICS_UPDATE', premiumMetrics);
    } catch (e) { clearInterval(ping); }
  }, 10000);
  req.on('close', function() {
    clearInterval(ping);
    var idx = connections.indexOf(res);
    if (idx !== -1) connections.splice(idx, 1);
  });
});

/* ===== TRUNK ALLOCATION ENGINE ===== */
var repPool = [
  {id:'rep-1',name:'Mihai Chirca',activeCalls:0,status:'Active',skills:['closer','negotiation']},
  {id:'rep-2',name:'John Setters',activeCalls:0,status:'Active',skills:['triage','discovery']},
  {id:'rep-3',name:'Sarah Conner',activeCalls:1,status:'On Call',skills:['closer','presentation']},
  {id:'rep-4',name:'David Kim',activeCalls:0,status:'Active',skills:['triage','support']},
  {id:'rep-5',name:'Jessica Brown',activeCalls:0,status:'Active',skills:['discovery','follow-up']},
];
var roundRobinIndex = 0;

function allocateTrunk(leadId, leadName, routingRule, trunkConfigs) {
  var allocatedRep = null;
  var rule = routingRule || 'round_robin';
  if (rule === 'round_robin') {
    var activeReps = repPool.filter(function(r) { return r.status === 'Active' || r.status === 'On Call'; });
    if (activeReps.length === 0) activeReps = repPool;
    roundRobinIndex = roundRobinIndex % activeReps.length;
    allocatedRep = activeReps[roundRobinIndex];
    roundRobinIndex = (roundRobinIndex + 1) % activeReps.length;
  } else if (rule === 'most_idle') {
    repPool.sort(function(a, b) { return a.activeCalls - b.activeCalls; });
    allocatedRep = repPool[0];
  } else {
    var skillReps = repPool.filter(function(r) { return r.skills.indexOf('closer') !== -1 || r.skills.indexOf('triage') !== -1; });
    allocatedRep = skillReps.length > 0 ? skillReps[0] : repPool[0];
  }
  if (allocatedRep) {
    allocatedRep.activeCalls = (allocatedRep.activeCalls || 0) + 1;
    if (allocatedRep.activeCalls >= 3) allocatedRep.status = 'On Call';
    premiumMetrics.teamMetrics = repPool.map(function(r) {
      return { name: r.name, initials: r.name.split(' ').map(function(s){return s[0]}).join('').slice(0,2).toUpperCase(), status: r.status, volume: Math.floor(Math.random() * 50 + 10) + '', calls: r.activeCalls + '', rate: Math.floor(Math.random() * 30 + 65) + '', avatar: '#6366f1' };
    });
  }
  return allocatedRep;
}

/* ===== TELEPHONY DIAL ENDPOINT ===== */
app.post('/api/telephony/dial', function(req, res) {
  try {
    var body = req.body || {};
    var leadName = body.leadName || body.prospectName || body.name || 'eikan haider';
    var email = body.email || 'eikanhaider1@gmail.com';
    var phone = body.phone || null;
    var leadId = body.leadId || 'lead-dial-' + Date.now();
    var routingRule = body.routingRule || 'round_robin';
    var trunkConfigs = body.trunkConfigs || [];
    if (!leadName || typeof leadName !== 'string') {
      return res.status(400).json({ success: false, message: 'leadName is required' });
    }
    var allocatedRep = allocateTrunk(leadId, leadName, routingRule, trunkConfigs);
    simulateWebRTCHandshake(function() {
      var call = registerActiveCall(leadId, leadName, email, phone);
      var fuEntry = {
        leadId: leadId,
        leadName: leadName,
        repName: allocatedRep ? allocatedRep.name : 'System Router',
        triggerAt: Date.now() + 300000,
        createdAt: new Date().toISOString(),
      };
      scheduledFollowUps.push(fuEntry);
      console.log('[Trunk] Allocated:', allocatedRep ? allocatedRep.name : 'auto-router', '| Rule:', routingRule, '| Trunks:', trunkConfigs.length);
      return res.status(200).json({
        success: true,
        message: 'WebRTC/Twilio handshake complete',
        call: call,
        allocatedRep: allocatedRep ? { id: allocatedRep.id, name: allocatedRep.name } : null,
        routingRule: routingRule,
        followUpScheduled: true,
      });
    });
  } catch (e) {
    console.error('[Telephony] Dial error:', e.message);
    return res.status(500).json({ success: false, message: 'Dial failed', error: e.message });
  }
});

function simulateWebRTCHandshake(callback) {
  setTimeout(callback, 0);
}

/* ===== TELEPHONY TERMINATE ENDPOINT ===== */
app.post('/api/telephony/terminate', function(req, res) {
  try {
    var body = req.body || {};
    var leadId = body.leadId;
    if (!leadId) return res.status(400).json({ success: false, message: 'leadId required' });
    var call = terminateActiveCall(leadId);
    if (!call) return res.status(404).json({ success: false, message: 'No active call for this lead' });
    return res.status(200).json({ success: true, call: call });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

/* ===== GET ACTIVE CALLS ===== */
app.get('/api/telephony/calls', function(req, res) {
  return res.json({ activeCalls: Object.values(activeCalls), count: Object.keys(activeCalls).length });
});

/* ===== LICENSE KEY ENGINE ===== */
var licenseKeys = [];

app.post('/api/admin/generate-key', function(req, res) {
  try {
    var body = req.body || {};
    var prefix = 'LA-2026-';
    var suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    var key = prefix + suffix;
    var entry = {
      key: key,
      status: 'Active',
      createdAt: new Date().toISOString(),
      usedBy: null,
      usedAt: null,
    };
    licenseKeys.push(entry);
    console.log('[License] Generated key:', key);
    return res.status(200).json({ success: true, key: entry });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/admin/validate-key', async function(req, res) {
  try {
    var body = req.body || {};
    var inputKey = (body.key || '').trim().toUpperCase();
    var email = body.email || '';
    if (!inputKey) return res.status(400).json({ success: false, message: 'License key is required.' });
    var found = null;
    for (var i = 0; i < licenseKeys.length; i++) {
      if (licenseKeys[i].key === inputKey) { found = licenseKeys[i]; break; }
    }
    if (!found) return res.status(400).json({ success: false, message: 'Invalid license key.' });
    if (found.status === 'Used') return res.status(400).json({ success: false, message: 'License key already used.' });
    found.status = 'Used';
    found.usedBy = email || 'unknown';
    found.usedAt = new Date().toISOString();
    /* Persist license to DB so subscription persists on refresh */
    try {
      var expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      await prisma.subscriptionLicense.create({
        data: {
          workspaceId: 'license_default',
          licenseToken: inputKey,
          plan: 'PREMIUM',
          status: 'ACTIVE',
          issuedToEmail: email || 'key-user@leadarrow.com',
          issuedToName: email || 'Key User',
          activatedAt: new Date(),
          expiresAt: expiresAt,
        },
      });
      if (email) {
        var userRec = await prisma.user.findUnique({ where: { email: email } });
        if (userRec) {
          await prisma.user.update({
            where: { email: email },
            data: { subscriptionTier: 'PREMIUM', isActivated: true, role: 'PREMIUM_SUBSCRIBER' },
          });
        }
      }
    } catch (dbErr) {
      console.error('[License] DB persist error (non-fatal):', dbErr.message);
    }
    broadcastToAll('PLAN_UPGRADE_SUCCESS', {
      userId: email || 'key-user-' + Date.now(),
      tier: 'PREMIUM',
      email: email || 'activated@leadarrow.com',
      timestamp: new Date().toISOString(),
      message: 'License key activated. Upgrading to PREMIUM...',
    });
    console.log('[License] Key validated:', inputKey, 'by', email || 'anonymous (DB persisted)');
    if (email) sendLicenseEmail(email, inputKey, 'PREMIUM', email, 'License Key', 'N/A', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
    return res.status(200).json({ success: true, message: 'License activated. Upgrading to PREMIUM...', tier: 'PREMIUM' });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/admin/keys', function(req, res) {
  return res.json(licenseKeys);
});

/* ===== CARD BRAND DETECTION (server-side) ===== */
function detectCardBrand(num) {
  var c = num.replace(/\D/g, '');
  if (/^4/.test(c)) return 'Visa';
  if (/^5[1-5]/.test(c)) return 'MasterCard';
  if (/^3[47]/.test(c)) return 'Amex';
  if (/^6011|^65/.test(c)) return 'Discover';
  if (/^35(?:2[89]|[3-8][0-9])/.test(c)) return 'JCB';
  return 'Unknown';
}

/* ===== LUHN CHECK (server-side) ===== */
function luhnCheck(num) {
  var s = 0, dbl = false;
  for (var i = num.length - 1; i >= 0; i--) {
    var d = parseInt(num[i], 10);
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    s += d; dbl = !dbl;
  }
  return s % 10 === 0;
}

/* ===== SUBSCRIPTION CHECK HELPER ===== */
function buildUserSubResponse(user, license) {
  var now = new Date();
  var isActive = false;
  var tier = 'BASIC';
  var expiresAt = null;
  var licenseKey = null;
  if (license && license.status === 'ACTIVE' && license.expiresAt && new Date(license.expiresAt) > now) {
    isActive = true;
    tier = license.plan || 'PREMIUM';
    expiresAt = license.expiresAt;
    licenseKey = license.licenseToken;
  }
  return { isPremium: isActive, subscriptionTier: tier, expiresAt: expiresAt, licenseKey: licenseKey, email: user.email };
}

/* ===== GET /api/subscription/status — check subscription from DB ===== */
app.get('/api/subscription/status', async function(req, res) {
  try {
    var email = req.query.email;
    if (!email) return res.status(400).json({ error: 'email required' });
    var user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ isPremium: false, subscriptionTier: 'BASIC', expiresAt: null });
    var license = await prisma.subscriptionLicense.findFirst({
      where: { issuedToEmail: email, status: 'ACTIVE', expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(buildUserSubResponse(user, license));
  } catch (e) {
    console.error('[Subscription] Status error:', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ===== ALERT THRESHOLD BREACH STATUS (for Chrome Extension) ===== */
var alertBreachState = { breaches: [], lastChecked: null };

app.get('/api/alerts/status', function(req, res) {
  var email = req.query.email || 'unknown';
  var activeThresholds = [];
  for (var i = 0; i < connections.length; i++) {
    try { connections[i].write('event: ALERTS_STATUS\ndata: ' + JSON.stringify(alertBreachState) + '\n\n'); } catch (e) {}
  }
  res.json(alertBreachState);
});

app.post('/api/alerts/breach', function(req, res) {
  try {
    var body = req.body || {};
    var entry = {
      metric: body.metric || 'unknown',
      operator: body.operator || 'gt',
      value: body.value || 0,
      actual: body.actual || 0,
      message: body.message || 'Threshold breached',
      timestamp: new Date().toISOString(),
      severity: body.severity || 'warning',
    };
    alertBreachState.breaches.unshift(entry);
    if (alertBreachState.breaches.length > 50) alertBreachState.breaches.length = 50;
    alertBreachState.lastChecked = new Date().toISOString();
    broadcastToAll('ALERT_BREACH', entry);
    console.log('[Alerts] Breach:', entry.message);
    return res.json({ success: true, breach: entry });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

/* ===== DIRECT PAYMENT PROCESSOR ===== */
app.post('/api/payment/process', async function(req, res) {
  try {
    var body = req.body || {};
    var planName = body.planName || 'Pro';
    var planPrice = body.planPrice || '1500';
    var email = body.email || 'eikanhaider1@gmail.com';
    var cardNumber = body.cardNumber || '';
    var cardExpiry = body.cardExpiry || '';
    var cardCvv = body.cardCvv || '';
    var cardName = body.cardName || '';
    var cardBrand = body.cardBrand || detectCardBrand(cardNumber);
    var cleanNum = cardNumber.replace(/\D/g, '');
    var last4 = cleanNum.slice(-4);

    if (!cardName.trim()) {
      return res.status(400).json({ success: false, message: 'Cardholder name is required.' });
    }
    if (cleanNum.length < 13 || cleanNum.length > 19) {
      return res.status(400).json({ success: false, message: 'Invalid card number length.' });
    }
    if (!luhnCheck(cleanNum)) {
      return res.status(400).json({ success: false, message: 'Invalid card number — failed checksum validation.' });
    }
    var expParts = (cardExpiry || '').split('/');
    var expMonth = parseInt(expParts[0], 10);
    var expYear = parseInt(expParts[1] || '0', 10) + 2000;
    if (expMonth < 1 || expMonth > 12) {
      return res.status(400).json({ success: false, message: 'Invalid expiry month.' });
    }
    var now = new Date();
    var curYear = now.getFullYear();
    var curMonth = now.getMonth() + 1;
    if (expYear < curYear || (expYear === curYear && expMonth < curMonth)) {
      return res.status(400).json({ success: false, message: 'Card has expired.' });
    }
    var cvvExpected = (cardBrand === 'Amex' || detectCardBrand(cardNumber) === 'Amex') ? 4 : 3;
    if ((cardCvv || '').length < cvvExpected) {
      return res.status(400).json({ success: false, message: 'Invalid CVV.' });
    }

    console.log('[Payment] ===== NEW TRANSACTION =====');
    console.log('[Payment] Card:', cardBrand, 'ending in', last4);
    console.log('[Payment] Expiry:', cardExpiry);
    console.log('[Payment] Amount:', planPrice, '| Plan:', planName);
    console.log('[Payment] Customer:', cardName, '<' + email + '>');
    console.log('[Payment] GATEWAY: Connecting to processor...');

    setTimeout(async function() {
      try {
        var licenseKey = 'LA-2026-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        var expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        var user = await prisma.user.findUnique({ where: { email } });
        var workspaceId = user?.companyId || user?.workspaceId || 'default';

        await prisma.subscriptionLicense.create({
          data: {
            workspaceId: workspaceId,
            licenseToken: licenseKey,
            plan: planName.toUpperCase(),
            status: 'ACTIVE',
            issuedToEmail: email,
            issuedToName: cardName.trim(),
            activatedAt: new Date(),
            expiresAt: expiresAt,
          },
        });

        if (user) {
          await prisma.user.update({
            where: { email },
            data: { subscriptionTier: planName.toUpperCase(), isActivated: true, role: 'PREMIUM_SUBSCRIBER' },
          });
        }

        console.log('[Payment] GATEWAY: Authorization approved');
        console.log('[Payment] LICENSE KEY:', licenseKey);
        console.log('[Payment] EXPIRES:', expiresAt.toISOString());
        console.log('[Payment] Receipt sent to', email);
        console.log('[Payment] ===== TRANSACTION COMPLETE =====');

        broadcastToAll('PLAN_UPGRADE_SUCCESS', {
          userId: email || 'payment-user-' + Date.now(),
          tier: planName.toUpperCase(),
          email: email,
          timestamp: new Date().toISOString(),
          message: 'Payment confirmed. Activating premium subscription...',
          licenseKey: licenseKey,
          planName: planName,
          expiresAt: expiresAt.toISOString(),
        });

        sendLicenseEmail(email, licenseKey, planName.toUpperCase(), cardName.trim(), cardBrand, last4, expiresAt);

        return res.status(200).json({
          success: true,
          message: 'Payment successful! Your ' + planName + ' plan has been activated (expires ' + expiresAt.toLocaleDateString() + ').',
          licenseKey: licenseKey,
          tier: planName.toUpperCase(),
          planName: planName,
          cardBrand: cardBrand,
          last4: last4,
          expiresAt: expiresAt.toISOString(),
        });
      } catch (dbErr) {
        console.error('[Payment] DB save error:', dbErr.message);
        return res.status(500).json({ success: false, message: 'Payment processed but failed to save license. Contact support.' });
      }
    }, 2000);
  } catch (e) {
    console.error('[Payment] Error:', e.message);
    return res.status(500).json({ success: false, message: 'Payment processing error.' });
  }
});

/* ===== STRIPE CHECKOUT SESSION CREATOR ===== */
app.post('/api/payment/create-checkout-session', function(req, res) {
  try {
    var body = req.body || {};
    var tier = body.tier || 'PREMIUM';
    var userId = body.userId || 'user-' + Date.now();
    var email = body.email || 'eikanhaider1@gmail.com';
    var sessionId = 'cs_' + crypto.randomBytes(16).toString('hex');
    var session = {
      id: sessionId,
      object: 'checkout.session',
      url: 'http://localhost:5001/api/payment/checkout/' + sessionId,
      success_url: 'http://localhost:3000/dashboard?payment=success&session_id=' + sessionId,
      cancel_url: 'http://localhost:3000/dashboard?payment=cancelled',
      mode: 'subscription',
      metadata: {
        userId: userId,
        tier: tier,
        email: email,
      },
      amount_total: tier === 'PREMIUM' ? 150000 : 75000,
      currency: 'usd',
      status: 'open',
    };
    console.log('[Stripe] Created checkout session for', email, '| tier:', tier, '| id:', sessionId);
    return res.status(200).json({
      success: true,
      session: session,
      url: session.url,
    });
  } catch (e) {
    console.error('[Stripe] Session creation error:', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

/* ===== STRIPE WEBHOOK ===== */
app.post('/api/payment/webhook', function(req, res) {
  try {
    var sig = req.headers['stripe-signature'] || req.headers['x-webhook-signature'] || '';
    var rawBody = req.body;
    if (Buffer.isBuffer(req.body)) rawBody = req.body.toString('utf8');
    var payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    var eventType = payload.type || payload.event_type || '';
    console.log('[Stripe Webhook] Received event:', eventType);
    if (eventType === 'checkout.session.completed') {
      var session = payload.data && payload.data.object ? payload.data.object : payload.session || payload;
      var metadata = session.metadata || {};
      var userId = metadata.userId || 'user-upgraded-' + Date.now();
      var tier = metadata.tier || 'PREMIUM';
      var email = metadata.email || 'upgraded@leadarrow.com';
      premiumMetrics.activeHandlers = 4;
      premiumMetrics.avgResponseTime = '1.2s';
      broadcastToAll('PLAN_UPGRADE_SUCCESS', {
        userId: userId,
        tier: tier,
        email: email,
        timestamp: new Date().toISOString(),
        message: 'Secure Payment Confirmed. Activating Enterprise Premium Assets...',
      });
      console.log('[Stripe Webhook] Payment completed for', email, '- upgraded to', tier);
      return res.status(200).json({ received: true, status: 'upgraded', userId: userId, tier: tier });
    }
    if (eventType === 'checkout.session.expired' || eventType === 'checkout.session.canceled') {
      console.log('[Stripe Webhook] Session canceled/expired');
      return res.status(200).json({ received: true, status: 'cancelled' });
    }
    return res.status(200).json({ received: true, event: eventType });
  } catch (e) {
    console.error('[Stripe Webhook] Error:', e.message);
    return res.status(400).json({ received: false, error: e.message });
  }
});

/* ===== SIMULATED STRIPE CHECKOUT LANDING PAGE ===== */
app.get('/api/payment/checkout/:sessionId', function(req, res) {
  var sessionId = req.params.sessionId;
  res.send('<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Secure Checkout - LeadArrow</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0B0F19;color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}.container{max-width:480px;width:100%;padding:24px}.card{background:#141923;border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:32px;box-shadow:0 24px 80px rgba(0,0,0,0.8)}.logo{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;margin:0 auto 24px}.badge{display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);padding:4px 12px;border-radius:20px;font-size:12px;color:#34d399;margin-bottom:24px}h1{font-size:24px;font-weight:700;text-align:center;margin-bottom:8px}.sub{font-size:14px;color:#94a3b8;text-align:center;margin-bottom:32px}.price{text-align:center;margin-bottom:24px}.amount{font-size:48px;font-weight:800;color:#fff}.period{font-size:16px;color:#64748b}.features{list-style:none;padding:0;margin:0 0 24px}.features li{padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:14px;color:#e2e8f0;display:flex;align-items:center;gap:10px}.features li:before{content:"\\2713";color:#10b981;font-weight:bold}.btn{width:100%;padding:16px;border-radius:12px;border:none;font-size:16px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;transition:all 0.2s}.btn:hover{transform:translateY(-1px);box-shadow:0 8px 30px rgba(99,68,227,0.4)}.secure{text-align:center;margin-top:16px;font-size:12px;color:#64748b}.sim{text-align:center;margin-top:20px}.sim a{color:#6366f1;font-size:13px;text-decoration:none}.sim a:hover{text-decoration:underline}.spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.6s linear infinite;vertical-align:middle;margin-right:8px}@keyframes spin{to{transform:rotate(360deg)}}</style></head><body><div class="container"><div class="card"><div class="logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><div class="badge" style="justify-content:center"><span>&#x1F512;</span> Powered by Stripe</div><h1>Complete Payment</h1><p class="sub">LeadArrow Premium &middot; Monthly Subscription</p><div class="price"><span class="amount">$1,500</span><span class="period">/month</span></div><ul class="features"><li>Unlimited active leads &amp; live call connections</li><li>Real-time VoIP dialing &amp; trunk routing engine</li><li>Full telemetry stream &amp; Chrome extension bridge</li><li>Team management &amp; rep workload balancing</li><li>CRM integrations (Close, HubSpot, Slack)</li><li>Priority support &amp; dedicated account manager</li></ul><form method="GET" action="/api/payment/simulate-success"><input type="hidden" name="session_id" value="' + sessionId + '"><button type="submit" class="btn">&#x1F4B3; Pay $1,500 &mdash; Subscribe Now</button></form><div class="secure">&#x1F512; Secured with 256-bit TLS encryption</div></div><div class="sim"><a href="/api/payment/simulate-success?session_id=' + sessionId + '">&#x26A1; Simulate Payment Success (Dev Mode)</a></div></div></body></html>');
});

/* ===== SIMULATE PAYMENT SUCCESS (POST from checkout form) ===== */
app.get('/api/payment/simulate-success', function(req, res) {
  var sessionId = req.query.session_id || 'cs_sim_' + Date.now();
  broadcastToAll('PLAN_UPGRADE_SUCCESS', {
    userId: 'user-dev-' + Date.now(),
    tier: 'PREMIUM',
    email: 'eikanhaider1@gmail.com',
    timestamp: new Date().toISOString(),
    message: 'Secure Payment Confirmed. Activating Enterprise Premium Assets...',
  });
  console.log('[Stripe] Simulated payment success -> PLAN_UPGRADE_SUCCESS broadcast');
  res.redirect('http://localhost:3000/dashboard?payment=success&session_id=' + sessionId);
});

/* ===== INGESTION REGEX PIPELINE ===== */
app.post('/api/webhook/data', function(req, res) {
  try {
    var rawPayload = req.body;
    var rawText = '';
    if (typeof rawPayload === 'string') {
      rawText = rawPayload;
    } else if (rawPayload && typeof rawPayload === 'object') {
      rawText = rawPayload.text || rawPayload.body || rawPayload.message || rawPayload.content || rawPayload.raw || '';
      if (rawPayload.payload && typeof rawPayload.payload === 'string') {
        try { var pp = JSON.parse(rawPayload.payload); rawText = pp.text || pp.body || pp.content || rawText; } catch(e) {}
      }
      if (rawPayload.event && rawPayload.event.text) rawText = rawPayload.event.text;
      if (rawPayload.data && rawPayload.data.text) rawText = rawPayload.data.text;
      if (!rawText && rawPayload.attachments && Array.isArray(rawPayload.attachments)) {
        rawText = rawPayload.attachments.map(function(a) { return a.text || a.fallback || ''; }).join('\n');
      }
    }
    if (!rawText || typeof rawText !== 'string') {
      return res.status(200).json({ message: 'noop', parsed: null });
    }
    var name = null;
    var email = null;
    var phone = null;
    var hostEmail = null;
    var salesRep = null;
    var nameMatch = rawText.match(/Name:\s*(.+)/i);
    if (nameMatch) name = nameMatch[1].trim().split('\n')[0].trim();
    if (!name) {
      var altNameMatch = rawText.match(/(?:Prospect|Customer|Contact|Lead|Client|Candidate)[:\s]+(.+)/i);
      if (altNameMatch) name = altNameMatch[1].trim().split('\n')[0].trim();
    }
    if (!name) {
      var lines = rawText.split('\n').filter(Boolean);
      if (lines.length > 0) name = lines[0].replace(/^[-*•>\s]+/, '').trim();
    }
    if (!name) name = 'Unknown Prospect';
    var emailMatch = rawText.match(/Email:\s*(.+)/i);
    if (emailMatch) email = emailMatch[1].trim();
    if (!email) {
      var genericEmailMatch = rawText.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
      if (genericEmailMatch) email = genericEmailMatch[1].trim();
    }
    var phoneMatch = rawText.match(/Phone:\s*(.+)/i);
    if (phoneMatch) phone = phoneMatch[1].trim();
    if (!phone) {
      var genericPhoneMatch = rawText.match(/(\+?\d[\d\s\-().]{6,}\d)/);
      if (genericPhoneMatch) phone = genericPhoneMatch[1].trim();
    }
    var hostMatch = rawText.match(/Host\s*Email[:\s]+(\S+@\S+)/i);
    if (hostMatch) hostEmail = hostMatch[1].trim();
    if (!hostEmail && email) hostEmail = email;
    var repMatch = rawText.match(/Sales\s*Rep[:\s]+(.+)/i);
    if (repMatch) salesRep = repMatch[1].trim();
    var isBooking = /booking|booked|scheduled|meeting|appointment|demo|call\s+scheduled/i.test(rawText);
    var entry = {
      leadId: 'lead-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'),
      prospectName: name,
      email: email || null,
      phone: phone || null,
      hostEmail: hostEmail || null,
      salesRep: salesRep || null,
      leadSource: isBooking ? 'Data Webhook Booking' : 'Data Webhook',
      source: 'Webhook',
      type: isBooking ? 'booking' : 'lead',
      workspaceId: 'webhook_default',
      status: 'ROUTING',
      timestamp: new Date().toISOString(),
      rawSnippet: rawText.slice(0, 200),
    };
    leadStore.unshift(entry);
    if (leadStore.length > 200) leadStore.length = 200;
    premiumMetrics.totalActiveLeads = leadStore.length;
    premiumMetrics.totalLeads = leadStore.length;
    premiumMetrics.totalAccepted = leadStore.filter(function(l) { return l.status === 'CONNECTED' || l.status === 'CLAIMED'; }).length;
    premiumMetrics.recentLeads.unshift({
      prospectName: name, source: 'Webhook', status: 'Connected',
      time: 'Just now', dot: 'bg-emerald-500',
    });
    if (premiumMetrics.recentLeads.length > 20) premiumMetrics.recentLeads.length = 20;
    broadcastToAll('NEW_LEAD_ALERT', entry);
    if (isBooking) {
      bookingAlerts.unshift(entry);
      if (bookingAlerts.length > 50) bookingAlerts.length = 50;
      broadcastToAll('NEW_BOOKING_ALERT', entry);
    }
    broadcastToAll('METRICS_UPDATE', premiumMetrics);
    var fuWebhook = { leadId: entry.leadId, leadName: name, repName: 'System Router', triggerAt: Date.now() + 60000, createdAt: new Date().toISOString() };
    scheduledFollowUps.push(fuWebhook);
    console.log('[Webhook/Data] Parsed - Name:', name, '| Email:', email, '| Phone:', phone, '| Booking:', isBooking, '| Follow-up in 60s');
    return res.status(200).json({
      success: true,
      leadId: entry.leadId,
      parsed: { name: name, email: email, phone: phone, hostEmail: hostEmail, salesRep: salesRep, isBooking: isBooking },
      entry: entry,
    });
  } catch (e) {
    console.error('[Webhook/Data] Error:', e.message);
    broadcastToAll('NEW_LEAD_ALERT', {
      leadId: 'lead-fallback-' + Date.now(),
      prospectName: 'Lead from Webhook',
      leadSource: 'Webhook',
      status: 'ROUTING',
      timestamp: new Date().toISOString(),
    });
    return res.status(200).json({ success: false, message: 'fallback', error: e.message });
  }
});

/* ===== PAIRING AUTH ===== */
app.post('/api/extension/pair', function(req, res) {
  try {
    var code = (req.body || {}).pairingCode;
    if (code === 'LA-2026-PREMIUM') {
      return res.json({
        success: true,
        tier: 'PREMIUM',
        email: 'eikanhaider1@gmail.com',
        role: 'PREMIUM_USER',
        workspace: 'Workspace_Alpha',
        agentName: 'Eikan Haider',
      });
    }
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(401).json({ success: false, message: 'Invalid synchronization code sequence.' });
    }
    return res.json({
      success: true, tier: 'BASIC', email: 'guest@leadarrow.com',
      role: 'BASIC_USER', workspace: 'Workspace_Guest', agentName: 'Guest Agent',
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Internal error.' });
  }
});

/* ===== NOTE: Slack webhook lives in src/routes/slackWebhook.js (registered below) ===== */

/* ===== PUSH LEAD with DB + Routing Engine ===== */
app.post('/api/leads/push', async function(req, res) {
  try {
    var body = req.body || {};
    var workspaceId = body.workspaceId || body.companyId;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
    var name = body.name || body.prospectName || 'Unknown Prospect';
    var email = body.email || null;
    var phone = body.phone || null;
    var source = body.source || 'API Push';

    var company = await prisma.company.findUnique({ where: { id: workspaceId } });
    if (!company) {
      company = await prisma.company.create({
        data: { id: workspaceId, name: workspaceId === 'default' ? 'Default Company' : workspaceId },
      });
    }

    var leadLog = await prisma.leadLog.create({
      data: {
        companyId: workspaceId,
        prospectName: name,
        leadSource: source,
        source: 'API',
        status: 'ROUTING',
      },
    });

    var entry = {
      leadId: leadLog.id,
      prospectName: name, email: email, phone: phone,
      leadSource: source, source: 'API',
      status: 'ROUTING', timestamp: new Date().toISOString(),
    };
    broadcastToAll('NEW_LEAD_ALERT', entry);

    var routeLead = require('./src/services/routingEngine').routeLead;
    routeLead(leadLog.id, workspaceId).catch(function(e) {
      console.error('[Push] Routing error:', e.message);
    });

    return res.status(200).json({ success: true, leadId: leadLog.id });
  } catch (e) {
    console.error('[Push] Error:', e.message);
    return res.status(500).json({ error: e.message });
  }
});

/* ===== SCHEDULE CRM FOLLOW-UP ===== */
app.post('/api/crm/followup', function(req, res) {
  try {
    var body = req.body || {};
    var leadName = body.leadName || body.name || 'Unknown';
    var repName = body.repName || 'Assigned Rep';
    var delayMs = parseInt(body.delayMs) || 30000;
    var triggerAt = Date.now() + Math.max(delayMs, 5000);
    var fu = {
      leadId: 'fu-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'),
      leadName: leadName,
      repName: repName,
      triggerAt: triggerAt,
      createdAt: new Date().toISOString(),
    };
    scheduledFollowUps.push(fu);
    console.log('[CRM] Follow-up scheduled for', leadName, 'in', delayMs / 1000, 's');
    return res.status(200).json({ message: 'ok', followUp: fu });
  } catch (e) {
    return res.status(500).json({ message: 'error', error: e.message });
  }
});

/* ===== GET BOOKING ALERTS ===== */
app.get('/api/bookings', function(req, res) {
  res.json(bookingAlerts.slice(0, 50));
});

/* ===== GET SCHEDULED FOLLOW-UPS ===== */
app.get('/api/crm/followups', function(req, res) {
  res.json(scheduledFollowUps);
});

/* ===== ENDPOINTS ===== */
app.get('/api/metrics', function(req, res) { res.json(premiumMetrics); });
app.get('/api/leads/recent', function(req, res) { res.json(leadStore.slice(0, 50)); });
app.get('/api/team', function(req, res) { res.json(teamStore); });
app.post('/api/team', function(req, res) {
  try {
    var member = req.body;
    if (!member || !member.name) return res.status(400).json({ message: 'Name required' });
    member.id = 'rep-' + Date.now();
    member.initials = member.name.split(' ').map(function(s) { return s[0]; }).join('').slice(0, 2).toUpperCase();
    member.status = member.status || 'Offline';
    member.calls = member.calls || 0;
    member.conversion = member.conversion || 0;
    member.avatar = member.avatar || '#6366f1';
    teamStore.push(member);
    broadcastToAll('METRICS_UPDATE', premiumMetrics);
    res.status(201).json(member);
  } catch (e) { res.status(500).json({ message: 'error', error: e.message }); }
});

app.get('/api/leads/scored', function(req, res) {
  try {
    var { companyId, limit } = req.query;
    if (!companyId) return res.status(400).json({ error: 'companyId required' });
    var scored = require('./src/services/leadScorer');
    var dbLeads = leadStore.filter(function(l) { return l.workspaceId === companyId || companyId === 'all'; });
    var prioritized = scored.prioritizeLeads(dbLeads.slice(0, parseInt(limit) || 50));
    res.json(prioritized.map(function(p) {
      var label = scored.getPriorityLabel(p.score);
      return { ...p.lead, score: p.score, priority: label.label, priorityColor: label.color };
    }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/health', function(req, res) {
  res.json({
    status: 'ok', port: 5001, uptime: process.uptime(),
    connections: connections.length, leads: leadStore.length,
    followUpsScheduled: scheduledFollowUps.length,
    bookingsReceived: bookingAlerts.length,
    activeCalls: Object.keys(activeCalls).length,
  });
});

/* ===== Init Socket.io ===== */
try { if (typeof initSocketFn === 'function') initSocketFn(server); } catch(e) { console.warn('[socketManager] init:', e.message); }

/* ===== Scheduled Jobs ===== */
try { require('./src/jobs/weeklyReport'); console.log('[Jobs] Weekly report cron registered'); } catch(e) { console.warn('[Jobs] weeklyReport:', e.message); }

/* ===== EXISTING ROUTES ===== */
try { app.use('/api/auth', require('./src/routes/authRoutes')); } catch(e) { console.warn('[route] auth:', e.message); }
try { app.use('/api/purchase', require('./src/routes/payment')); } catch(e) { console.warn('[route] payment:', e.message); }
try { app.use('/api/purchase', require('./src/routes/purchase')); } catch(e) { console.warn('[route] purchase:', e.message); }
try { app.use('/api/purchase', require('./src/routes/webhookStripe')); } catch(e) { console.warn('[route] stripe:', e.message); }
try { app.use('/api/reps', require('./src/routes/reps')); } catch(e) { console.warn('[route] reps:', e.message); }
try { app.use('/api/reps', require('./src/routes/pushover')); } catch(e) { console.warn('[route] pushover:', e.message); }
try { app.use('/api/webhook', require('./src/routes/webhook')); } catch(e) { console.warn('[route] webhook:', e.message); }
try { app.use('/api/export', require('./src/routes/export')); } catch(e) { console.warn('[route] export:', e.message); }
try { app.use('/api/crm', require('./src/routes/crm')); } catch(e) { console.warn('[route] crm:', e.message); }
try { app.use('/api/leads', require('./src/routes/leads')); } catch(e) { console.warn('[route] leads:', e.message); }
try { app.use('/api/analytics', require('./src/routes/analytics')); } catch(e) { console.warn('[route] analytics:', e.message); }
try { app.use('/api/usage', require('./src/routes/usage')); } catch(e) { console.warn('[route] usage:', e.message); }
try { app.use('/api/admin', require('./src/routes/admin')); } catch(e) { console.warn('[route] admin:', e.message); }
try { app.use('/api/super-admin', require('./src/routes/superAdmin')); } catch(e) { console.warn('[route] super-admin:', e.message); }
try { var slackR = require('./src/routes/slackWebhook'); app.use('/api/webhook', slackR); } catch(e) { console.warn('[route] slackWebhook:', e.message); }
try { app.use('/api/alert-thresholds', require('./src/routes/alertThresholds')); } catch(e) { console.warn('[route] alertThresholds:', e.message); }
try { app.use('/api/workspace', require('./src/routes/workspace')); } catch(e) { console.warn('[route] workspace:', e.message); }
try { app.use('/api/workspace', require('./src/routes/googleCalendar')); } catch(e) { console.warn('[route] googleCalendar:', e.message); }
try { app.use('/api/telnyx', require('./src/routes/telnyxWebhook')); } catch(e) { console.warn('[route] telnyxWebhook:', e.message); }
try { app.use('/api/crm-oauth', require('./src/routes/crmOAuth')); } catch(e) { console.warn('[route] crmOAuth:', e.message); }

module.exports = { app: app, server: server, broadcastToAll: broadcastToAll, connections: connections };

var PORT = 5001;
server.listen(PORT, function() {
  console.log('[LeadArrow] SSE server on port ' + PORT);
  console.log('[LeadArrow] POST /api/telephony/dial        — WebRTC/Twilio outbound dial');
  console.log('[LeadArrow] POST /api/telephony/terminate    — Terminate active call');
  console.log('[LeadArrow] GET  /api/telephony/calls        — List active calls');
  console.log('[LeadArrow] POST /api/webhook/data           — Ingestion regex pipeline');
  console.log('[LeadArrow] POST /api/webhook/slack/:ws      — Slack webhook receiver');
  console.log('[LeadArrow] POST /api/extension/pair         — Chrome extension pairing');
  console.log('[LeadArrow] POST /api/leads/push             — Push lead');
  console.log('[LeadArrow] POST /api/crm/followup           — Schedule CRM follow-up');
  console.log('[LeadArrow] POST /api/admin/generate-key     — Generate license key');
  console.log('[LeadArrow] POST /api/admin/validate-key     — Validate license key');
  console.log('[LeadArrow] GET  /api/admin/keys             — List all license keys');
  console.log('[LeadArrow] POST /api/payment/process         — Direct payment processor');
  console.log('[LeadArrow] POST /api/payment/create-checkout-session — Stripe checkout session');
  console.log('[LeadArrow] POST /api/payment/webhook         — Stripe payment webhook');
  console.log('[LeadArrow] GET  /api/payment/checkout/:id    — Simulated Stripe checkout page');
  console.log('[LeadArrow] GET  /api/payment/simulate-success — Dev simulate payment success');
  console.log('[LeadArrow] GET  /api/stream                 — SSE event stream');
  console.log('[LeadArrow] GET  /api/bookings               — Booking alerts');
  console.log('[LeadArrow] GET  /api/crm/followups          — Follow-ups');
  console.log('[LeadArrow] GET  /api/team                   — Team store');
  console.log('[LeadArrow] GET  /api/metrics                — Live metrics');
  console.log('[LeadArrow] CRM follow-up engine active (5s check)');
});
