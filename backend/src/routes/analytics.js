const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

/* ── GET /api/analytics/overview?companyId=&userId= ── */
router.get('/overview', async (req, res) => {
  try {
    const { companyId, userId } = req.query;
    if (!companyId) return res.status(400).json({ error: 'companyId required' });

    const where = { companyId };
    if (userId) where.attempts = { some: { userId } };

    const [totalLeads, connected, declined, timedOut, missed] = await Promise.all([
      prisma.leadLog.count({ where }),
      prisma.leadLog.count({ where: { ...where, status: { in: ['CONNECTED', 'ACCEPTED'] } } }),
      prisma.leadLog.count({ where: { ...where, status: 'DECLINED' } }),
      prisma.leadLog.count({ where: { ...where, status: 'TIMEOUT' } }),
      prisma.leadLog.count({ where: { ...where, status: { in: ['MISSED', 'EXHAUSTED'] } } }),
    ]);
    const skipped = totalLeads - connected - declined - timedOut - missed;

    const acceptedAttempts = await prisma.routingAttempt.findMany({
      where: {
        ...(userId ? { userId } : {}),
        leadLog: { companyId },
        status: 'ACCEPTED',
        answerAt: { not: null },
      },
      select: { answerAt: true, createdAt: true },
      take: 50,
    });

    let avgResponseTime = '—';
    if (acceptedAttempts.length > 0) {
      const totalMs = acceptedAttempts.reduce((sum, a) => {
        if (a.answerAt && a.createdAt) return sum + (new Date(a.answerAt).getTime() - new Date(a.createdAt).getTime());
        return sum;
      }, 0);
      const avgMs = totalMs / acceptedAttempts.length;
      avgResponseTime = avgMs < 1000 ? `${Math.round(avgMs)}ms` : `${(avgMs / 1000).toFixed(1)}s`;
    }

    res.json({ totalLeads, accepted: connected, missed, declined, timedOut, skipped, avgResponseTime });
  } catch (err) {
    console.error('GET /analytics/overview error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ── GET /api/analytics/reps?companyId= ── */
router.get('/reps', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: 'companyId required' });

    const reps = await prisma.user.findMany({
      where: { companyId, role: 'REP', isActive: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        isAvailable: true,
        routingAttempts: {
          select: { status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    const stats = reps.map((rep) => {
      const accepted = rep.routingAttempts.filter((a) => a.status === 'ACCEPTED').length;
      const declined = rep.routingAttempts.filter((a) => a.status === 'DECLINED').length;
      const total = rep.routingAttempts.length;
      return {
        id: rep.id,
        name: rep.fullName,
        email: rep.email,
        isAvailable: rep.isAvailable,
        accepted,
        declined,
        total,
        connectionRate: total ? Math.round((accepted / total) * 100) : 0,
      };
    });

    res.json(stats);
  } catch (err) {
    console.error('GET /analytics/reps error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ── GET /api/analytics/speed?companyId= ── */
router.get('/speed', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.json({ firstAlertDelay: '—', timeToFirstAnswer: '—', timeToAcceptance: '—', under1Min: 0, oneTo5Min: 0, over5Min: 0 });

    const acceptedAttempts = await prisma.routingAttempt.findMany({
      where: { leadLog: { companyId }, status: 'ACCEPTED' },
      select: { createdAt: true, acceptedAt: true, leadLog: { select: { createdAt: true, firstAlertedAt: true } } },
      take: 100,
    });

    let totalDelay = 0, delayCount = 0, under1 = 0, oneTo5 = 0, over5 = 0;
    for (const a of acceptedAttempts) {
      if (a.leadLog.firstAlertedAt && a.acceptedAt) {
        const ms = new Date(a.acceptedAt) - new Date(a.leadLog.firstAlertedAt);
        totalDelay += ms; delayCount++;
        if (ms < 60000) under1++;
        else if (ms < 300000) oneTo5++;
        else over5++;
      }
    }
    const avgDelay = delayCount > 0 ? Math.round(totalDelay / delayCount) : 0;
    const t = delayCount || 1;

    res.json({
      firstAlertDelay: avgDelay > 0 ? `${avgDelay < 1000 ? avgDelay + 'ms' : (avgDelay / 1000).toFixed(1) + 's'}` : '—',
      timeToFirstAnswer: avgDelay > 0 ? `${avgDelay < 1000 ? avgDelay + 'ms' : (avgDelay / 1000).toFixed(1) + 's'}` : '—',
      timeToAcceptance: avgDelay > 0 ? `${avgDelay < 1000 ? avgDelay + 'ms' : (avgDelay / 1000).toFixed(1) + 's'}` : '—',
      avgResponseTime: avgDelay > 0 ? `${avgDelay < 1000 ? avgDelay + 'ms' : (avgDelay / 1000).toFixed(1) + 's'}` : '—',
      under1Min: parseFloat(((under1 / t) * 100).toFixed(1)),
      oneTo5Min: parseFloat(((oneTo5 / t) * 100).toFixed(1)),
      over5Min: parseFloat(((over5 / t) * 100).toFixed(1)),
    });
  } catch { res.json({ firstAlertDelay: '—', timeToFirstAnswer: '—', timeToAcceptance: '—', avgResponseTime: '—', under1Min: 0, oneTo5Min: 0, over5Min: 0 }); }
});

/* ── GET /api/analytics/volume?companyId= ── */
router.get('/volume', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.json({});

    const [total, accepted, missed, declined, timedOut] = await Promise.all([
      prisma.leadLog.count({ where: { companyId } }),
      prisma.leadLog.count({ where: { companyId, status: { in: ['CONNECTED', 'ACCEPTED'] } } }),
      prisma.leadLog.count({ where: { companyId, status: { in: ['MISSED', 'EXHAUSTED'] } } }),
      prisma.leadLog.count({ where: { companyId, status: 'DECLINED' } }),
      prisma.leadLog.count({ where: { companyId, status: 'TIMEOUT' } }),
    ]);

    const bySource = await prisma.leadLog.groupBy({
      by: ['leadSource'],
      where: { companyId },
      _count: true,
    });
    const sourceMap = {};
    bySource.forEach(s => { sourceMap[s.leadSource] = s._count; });

    res.json({ total, accepted, missed, declined, timedOut, connectionRate: total > 0 ? Math.round((accepted / total) * 100) : 0, bySource: sourceMap });
  } catch { res.json({}); }
});

/* ── GET /api/analytics/routing?companyId= ── */
router.get('/routing', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.json({});

    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { routingMethod: true } });
    const leadLogs = await prisma.leadLog.findMany({
      where: { companyId },
      include: { attempts: { select: { id: true, status: true } } },
    });

    let totalAttempts = 0, deadEnds = 0;
    for (const log of leadLogs) {
      totalAttempts += log.attempts.length;
      const lastStatus = log.attempts[log.attempts.length - 1]?.status;
      if (lastStatus === 'TIMEOUT' || lastStatus === 'MISSED' || lastStatus === 'EXHAUSTED') deadEnds++;
    }

    res.json({
      deadEndRate: leadLogs.length > 0 ? parseFloat(((deadEnds / leadLogs.length) * 100).toFixed(1)) : 0,
      avgRepsContacted: leadLogs.length > 0 ? parseFloat((totalAttempts / leadLogs.length).toFixed(2)) : 0,
      routingMethod: company?.routingMethod || 'ROUND_ROBIN',
    });
  } catch { res.json({}); }
});

/* ── GET /api/analytics/coverage?companyId= ── */
router.get('/coverage', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.json({});

    const reps = await prisma.user.findMany({
      where: { companyId, role: 'REP', isActive: true },
      select: { id: true, fullName: true, isAvailable: true, availabilitySlots: true },
    });

    const coverage = reps.map(r => ({
      name: r.fullName,
      isAvailable: r.isAvailable,
      slots: r.availabilitySlots.map(s => `${s.dayOfWeek}:${s.startTime}-${s.endTime}`),
    }));

    res.json({ reps: coverage, totalReps: reps.length, availableNow: reps.filter(r => r.isAvailable).length });
  } catch { res.json({}); }
});
router.get('/reliability', (req, res) => res.json({}));

module.exports = router;
