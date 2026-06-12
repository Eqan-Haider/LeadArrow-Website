const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { getWorkspacePlan, PLAN_LIMITS } = require('../middleware/usageLimit');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/limits', async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });

    const plan = await getWorkspacePlan(workspaceId);
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlyLeadCount, crmCount, repCount] = await Promise.all([
      prisma.leadLog.count({
        where: { companyId: workspaceId, createdAt: { gte: startOfMonth } },
      }),
      prisma.cRMConnection.count({ where: { workspaceId, isActive: true } }),
      prisma.user.count({ where: { companyId: workspaceId, isActive: true, role: 'REP' } }),
    ]);

    res.json({
      plan,
      limits,
      usage: {
        leads: { current: monthlyLeadCount, max: limits.maxLeadsPerMonth },
        crmIntegrations: { current: crmCount, max: limits.maxCrmIntegrations },
        reps: { current: repCount, max: limits.maxReps },
      },
      advancedAnalytics: limits.advancedAnalytics,
    });
  } catch (err) {
    console.error('GET /usage/limits error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
