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

    const [totalLeads, connected] = await Promise.all([
      prisma.leadLog.count({ where }),
      prisma.leadLog.count({ where: { ...where, status: 'CONNECTED' } }),
    ]);

    const missed = totalLeads - connected;

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
        if (a.answerAt && a.createdAt) {
          return sum + (new Date(a.answerAt).getTime() - new Date(a.createdAt).getTime());
        }
        return sum;
      }, 0);
      const avgMs = totalMs / acceptedAttempts.length;
      avgResponseTime = avgMs < 1000 ? `${Math.round(avgMs)}ms` : `${(avgMs / 1000).toFixed(1)}s`;
    }

    res.json({ totalLeads, accepted: connected, missed, avgResponseTime });
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

/* ── Legacy stubs ── */
router.get('/speed', (req, res) => res.json({}));
router.get('/volume', (req, res) => res.json({}));
router.get('/routing', (req, res) => res.json({}));
router.get('/coverage', (req, res) => res.json({}));
router.get('/reliability', (req, res) => res.json({}));

module.exports = router;
