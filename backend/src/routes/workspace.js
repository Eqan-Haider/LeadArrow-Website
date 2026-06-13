const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// POST /api/workspace/leads/accept – rep accepts a lead (no auth for Chrome extension)
router.post('/leads/accept', async (req, res) => {
  try {
    const { leadId, userId } = req.body;
    if (!leadId || !userId) return res.status(400).json({ error: 'leadId and userId required' });

    await prisma.leadLog.update({
      where: { id: leadId },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });

    const attempt = await prisma.routingAttempt.findFirst({
      where: { leadLogId: leadId, userId },
      orderBy: { attemptOrder: 'desc' },
    });

    if (attempt) {
      await prisma.routingAttempt.update({
        where: { id: attempt.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('POST /workspace/leads/accept error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/workspace/leads/decline – rep declines a lead (no auth for Chrome extension)
router.post('/leads/decline', async (req, res) => {
  try {
    const { leadId, userId } = req.body;
    if (!leadId || !userId) return res.status(400).json({ error: 'leadId and userId required' });

    const attempt = await prisma.routingAttempt.findFirst({
      where: { leadLogId: leadId, userId },
      orderBy: { attemptOrder: 'desc' },
    });

    if (attempt) {
      await prisma.routingAttempt.update({
        where: { id: attempt.id },
        data: { status: 'DECLINED' },
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('POST /workspace/leads/decline error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.use(authenticate);

// POST /api/workspace/setup – initial workspace setup after signup
router.post('/setup', async (req, res) => {
  try {
    const { companyName, crmChoice, routingMethod, ringTimeout } = req.body;
    if (!companyName) return res.status(400).json({ error: 'companyName required' });

    const wsId = req.user.companyId || req.user.id;
    const existing = await prisma.workspace.findUnique({ where: { id: wsId } });
    if (existing) return res.status(400).json({ error: 'Workspace already exists' });

    await prisma.workspace.create({
      data: { id: wsId, name: companyName },
    });

    await prisma.company.create({
      data: {
        id: wsId,
        name: companyName,
        routingMethod: routingMethod || 'ROUND_ROBIN',
      },
    });

    await prisma.workspaceSettings.create({
      data: {
        workspaceId: wsId,
        bookingRoutingMode: 'TRIAGE',
        ringTimeout: ringTimeout || 20,
      },
    });

    if (crmChoice && crmChoice !== 'none' && crmChoice !== '') {
      await prisma.cRMConnection.create({
        data: {
          workspaceId: wsId,
          provider: crmChoice,
          accessToken: 'pending',
          isActive: false,
        },
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        workspaceId: wsId,
        companyId: wsId,
        companyName: companyName,
      },
    });

    res.json({ success: true, workspaceId: wsId });
  } catch (err) {
    console.error('POST /api/workspace/setup error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET /api/workspace/settings – return workspace settings from DB
router.get('/settings', async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId || req.user.companyId;
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID not found' });
    }

    const settings = await prisma.workspaceSettings.findUnique({
      where: { workspaceId },
    });

    const crmConnection = await prisma.cRMConnection.findUnique({
      where: { workspaceId },
    });

    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
    });

    res.json({
      leadTriggerSource: settings?.leadTriggerSource || (crmConnection ? 'crm' : 'slack'),
      slackWorkspace: null,
      slackChannel: null,
      calendarAwareProcessing: settings?.calendarAwareProcessing ?? false,
      bookingRoutingMode: settings?.bookingRoutingMode ?? 'TRIAGE',
      ringTimeout: settings?.ringTimeout ?? 20,
      crmProvider: crmConnection?.provider ?? null,
      routingMethod: company?.routingMethod ?? 'ROUND_ROBIN',
    });
  } catch (err) {
    console.error('GET /api/workspace/settings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/workspace/settings – update workspace settings
router.put('/settings', async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId || req.user.companyId;
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID not found' });
    }

    const {
      calendarAwareProcessing,
      bookingRoutingMode,
      ringTimeout,
      routingMethod,
      leadTriggerSource,
    } = req.body;

    const settings = await prisma.workspaceSettings.upsert({
      where: { workspaceId },
      update: {
        ...(calendarAwareProcessing !== undefined && { calendarAwareProcessing }),
        ...(bookingRoutingMode !== undefined && { bookingRoutingMode }),
        ...(ringTimeout !== undefined && { ringTimeout }),
        ...(leadTriggerSource !== undefined && { leadTriggerSource }),
      },
      create: {
        workspaceId,
        calendarAwareProcessing: calendarAwareProcessing ?? false,
        bookingRoutingMode: bookingRoutingMode ?? 'TRIAGE',
        ringTimeout: ringTimeout ?? 20,
        leadTriggerSource: leadTriggerSource ?? 'crm',
      },
    });

    if (routingMethod !== undefined && req.user.companyId) {
      await prisma.company.update({
        where: { id: req.user.companyId },
        data: { routingMethod },
      });
    }

    res.json(settings);
  } catch (err) {
    console.error('PUT /api/workspace/settings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/workspace/routing – update routing config (Company + RepPercentage)
router.put('/routing', async (req, res) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    const { routingMethod, roundRobinPointer, repPercentages } = req.body;

    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        ...(routingMethod !== undefined && { routingMethod }),
        ...(roundRobinPointer !== undefined && { roundRobinPointer }),
      },
    });

    if (Array.isArray(repPercentages)) {
      await prisma.repPercentage.deleteMany({ where: { companyId } });
      if (repPercentages.length > 0) {
        await prisma.repPercentage.createMany({
          data: repPercentages.map(rp => ({
            companyId,
            userId: rp.userId,
            percentage: rp.percentage,
          })),
        });
      }
    }

    res.json(company);
  } catch (err) {
    console.error('PUT /api/workspace/routing error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/workspace/analytics – aggregated analytics
router.get('/analytics', async (req, res) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    const leadLogs = await prisma.leadLog.findMany({
      where: { companyId },
      include: { attempts: true },
    });

    const totalLeads = leadLogs.length;
    const accepted = leadLogs.filter(l => l.acceptedAt).length;
    const missed = leadLogs.filter(l => l.status === 'MISSED').length;
    const declined = leadLogs.filter(l => l.status === 'DECLINED').length;
    const timedOut = leadLogs.filter(l => l.status === 'TIMEOUT').length;
    const connectionRate = totalLeads > 0 ? parseFloat(((accepted / totalLeads) * 100).toFixed(2)) : 0;

    const answeredLogs = leadLogs.filter(l => l.firstAlertedAt && l.firstAnsweredAt);
    let avgResponseTime = 0;
    if (answeredLogs.length > 0) {
      const totalMs = answeredLogs.reduce((sum, l) => {
        return sum + (new Date(l.firstAnsweredAt).getTime() - new Date(l.firstAlertedAt).getTime());
      }, 0);
      avgResponseTime = Math.round(totalMs / answeredLogs.length);
    }

    const repMap = {};
    for (const log of leadLogs) {
      for (const attempt of log.attempts) {
        if (!attempt.userId) continue;
        if (!repMap[attempt.userId]) {
          repMap[attempt.userId] = { offered: 0, accepted: 0, pickupCount: 0, totalResponseMs: 0, responseCount: 0 };
        }
        repMap[attempt.userId].offered++;
        if (attempt.acceptedAt) repMap[attempt.userId].accepted++;
        if (attempt.answerAt && attempt.acceptedAt) {
          repMap[attempt.userId].pickupCount++;
          repMap[attempt.userId].totalResponseMs += new Date(attempt.acceptedAt).getTime() - new Date(attempt.answerAt).getTime();
          repMap[attempt.userId].responseCount++;
        }
      }
    }

    const userIds = Object.keys(repMap);
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, fullName: true, email: true },
        })
      : [];
    const userLookup = {};
    for (const u of users) userLookup[u.id] = u;

    const perRepStats = Object.entries(repMap).map(([userId, stats]) => {
      const user = userLookup[userId];
      return {
        userId,
        name: user?.fullName ?? 'Unknown',
        email: user?.email ?? '',
        leadsOffered: stats.offered,
        leadsAccepted: stats.accepted,
        pickupRate: stats.offered > 0 ? parseFloat(((stats.pickupCount / stats.offered) * 100).toFixed(2)) : 0,
        acceptRate: stats.offered > 0 ? parseFloat(((stats.accepted / stats.offered) * 100).toFixed(2)) : 0,
        avgResponseTime: stats.responseCount > 0 ? Math.round(stats.totalResponseMs / stats.responseCount) : 0,
      };
    });

    res.json({
      totalLeads,
      accepted,
      missed,
      declined,
      timedOut,
      connectionRate,
      avgResponseTime,
      perRepStats,
    });
  } catch (err) {
    console.error('GET /api/workspace/analytics error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/workspace/history – lead history with routing attempts
router.get('/history', async (req, res) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found' });
    }

    const logs = await prisma.leadLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        attempts: {
          orderBy: { attemptOrder: 'asc' },
          include: {
            user: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });

    res.json(logs);
  } catch (err) {
    console.error('GET /api/workspace/history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/workspace/leaderboard – rep scorecard & ranking
router.get('/leaderboard', async (req, res) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

    const leadLogs = await prisma.leadLog.findMany({
      where: { companyId },
      include: { attempts: { include: { user: { select: { id: true, fullName: true, email: true, phoneNumber: true } } } } },
    });

    const repStats = {};
    for (const log of leadLogs) {
      for (const att of log.attempts) {
        if (!att.userId) continue;
        if (!repStats[att.userId]) {
          repStats[att.userId] = {
            userId: att.userId,
            name: att.user?.fullName || 'Unknown',
            email: att.user?.email || '',
            phone: att.user?.phoneNumber || '',
            offered: 0, accepted: 0, declined: 0, timedOut: 0, missed: 0,
            passedToNext: 0, totalResponseMs: 0, responseCount: 0,
            acceptedViaExtension: 0, acceptedViaPhone: 0,
          };
        }
        const s = repStats[att.userId];
        s.offered++;
        if (att.status === 'ACCEPTED') {
          s.accepted++;
          if (att.channel === 'extension') s.acceptedViaExtension++;
          else s.acceptedViaPhone++;
          if (att.acceptedAt && att.callStartAt) {
            s.totalResponseMs += new Date(att.acceptedAt) - new Date(att.callStartAt);
            s.responseCount++;
          }
        } else if (att.status === 'DECLINED') { s.declined++; s.passedToNext++; }
        else if (att.status === 'TIMEOUT') { s.timedOut++; s.passedToNext++; }
        else if (att.status === 'MISSED') { s.missed++; }
      }
    }

    const users = await prisma.user.findMany({
      where: { companyId },
      select: { id: true, fullName: true, email: true, phoneNumber: true, isActive: true, isAvailable: true },
    });
    const userMap = {};
    for (const u of users) userMap[u.id] = u;

    const allReps = users.map(u => {
      const s = repStats[u.id] || { offered: 0, accepted: 0, declined: 0, timedOut: 0, missed: 0, passedToNext: 0, totalResponseMs: 0, responseCount: 0, acceptedViaExtension: 0, acceptedViaPhone: 0 };
      const pickupRate = s.offered > 0 ? parseFloat(((s.accepted / s.offered) * 100).toFixed(1)) : 0;
      const declineRate = s.offered > 0 ? parseFloat(((s.declined / s.offered) * 100).toFixed(1)) : 0;
      const timeoutRate = s.offered > 0 ? parseFloat(((s.timedOut / s.offered) * 100).toFixed(1)) : 0;
      const avgResponseTime = s.responseCount > 0 ? Math.round(s.totalResponseMs / s.responseCount) : 0;
      const score = Math.round((pickupRate * 0.4) + (Math.max(0, 100 - avgResponseTime / 100) * 0.3) + ((s.offered > 0 ? Math.min(s.accepted, s.offered) / s.offered * 100 : 0) * 0.3));
      return {
        userId: u.id, name: u.fullName, email: u.email, phone: u.phoneNumber,
        isActive: u.isActive, isAvailable: u.isAvailable,
        leadsOffered: s.offered, leadsAccepted: s.accepted, leadsDeclined: s.declined,
        leadsTimedOut: s.timedOut, leadsMissed: s.missed, passedToNext: s.passedToNext,
        pickupRate, declineRate, timeoutRate, avgResponseTime,
        acceptedViaExtension: s.acceptedViaExtension,
        acceptedViaPhone: s.acceptedViaPhone,
        score,
      };
    });

    allReps.sort((a, b) => b.score - a.score);
    const ranked = allReps.map((r, i) => ({ ...r, rank: i + 1 }));

    res.json({ leaderboard: ranked, totalLeads: leadLogs.length, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('GET /api/workspace/leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/workspace/reports/send – trigger email report (manual or cron)
router.post('/reports/send', async (req, res) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' });
    const { type } = req.body; // 'daily' or 'weekly'

    const leadLogs = await prisma.leadLog.findMany({
      where: { companyId },
      include: { attempts: true },
    });
    const total = leadLogs.length;
    const accepted = leadLogs.filter(l => l.status === 'CONNECTED').length;
    const missed = leadLogs.filter(l => l.status === 'MISSED' || l.status === 'EXHAUSTED').length;
    const declined = leadLogs.filter(l => l.status === 'DECLINED').length;
    const timedOut = leadLogs.filter(l => l.status === 'TIMEOUT').length;
    const connectionRate = total > 0 ? parseFloat(((accepted / total) * 100).toFixed(1)) : 0;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const managerEmail = user?.email || '';

    if (managerEmail) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.ethereal.email',
          port: parseInt(process.env.SMTP_PORT) || 587,
          auth: {
            user: process.env.SMTP_USER || process.env.ETHEREAL_USER,
            pass: process.env.SMTP_PASS || process.env.ETHEREAL_PASS,
          },
        });
        await transporter.sendMail({
          from: '"LeadArrow" <noreply@leadarrow.com>',
          to: managerEmail,
          subject: `${type === 'daily' ? 'Daily' : 'Weekly'} Report – ${user.companyName || 'Your Workspace'}`,
          html: `<div style="background:#0B0F19;color:#e2e8f0;padding:32px;font-family:sans-serif;max-width:520px;margin:0 auto;border-radius:16px;">
            <h2 style="color:#fff;margin-bottom:16px;">${type === 'daily' ? 'Daily' : 'Weekly'} Performance Summary</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#94a3b8;">Total Leads</td><td style="text-align:right;font-weight:bold;">${total}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Accepted</td><td style="text-align:right;font-weight:bold;color:#10b981;">${accepted}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Missed</td><td style="text-align:right;font-weight:bold;color:#ef4444;">${missed}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Declined</td><td style="text-align:right;font-weight:bold;color:#f59e0b;">${declined}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Timed Out</td><td style="text-align:right;font-weight:bold;color:#f97316;">${timedOut}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;border-top:1px solid rgba(255,255,255,0.06);">Connection Rate</td><td style="text-align:right;font-weight:bold;color:#06b6d4;border-top:1px solid rgba(255,255,255,0.06);">${connectionRate}%</td></tr>
            </table>
            <p style="color:#64748b;font-size:11px;margin-top:20px;text-align:center;">Generated by LeadArrow Analytics</p>
          </div>`,
        });
      } catch (mailErr) {
        console.error('[Report] Email send failed:', mailErr.message);
      }
    }

    res.json({ success: true, total, accepted, missed, declined, timedOut, connectionRate });
  } catch (err) {
    console.error('POST /api/workspace/reports/send error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
