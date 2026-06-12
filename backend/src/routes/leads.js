const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

/* GET /api/leads?companyId=&userId=&limit= */
router.get('/', async (req, res) => {
  try {
    const { companyId, userId, limit = 10 } = req.query;
    if (!companyId) return res.status(400).json({ error: 'companyId required' });

    const where = { companyId };
    if (userId) {
      where.attempts = { some: { userId } };
    }

    const leads = await prisma.leadLog.findMany({
      where,
      include: {
        attempts: {
          include: { user: { select: { id: true, fullName: true } } },
          orderBy: { attemptOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit) || 10, 100),
    });

    const mapped = leads.map((l) => ({
      id: l.id,
      prospectName: l.prospectName,
      leadSource: l.leadSource || 'CRM',
      status: l.status,
      createdAt: l.createdAt,
      crmRecordUrl: l.crmRecordUrl,
      attempts: l.attempts.map((a) => ({
        id: a.id,
        user: a.user ? { id: a.user.id, name: a.user.fullName } : null,
        status: a.status,
        createdAt: a.createdAt,
      })),
    }));

    res.json({ leads: mapped });
  } catch (err) {
    console.error('GET /leads error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
