const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PLAN_LIMITS = {
  starter: { maxLeadsPerMonth: 1000, maxCrmIntegrations: 1, maxReps: 5, advancedAnalytics: false },
  pro: { maxLeadsPerMonth: 5000, maxCrmIntegrations: 3, maxReps: 15, advancedAnalytics: true },
  growth: { maxLeadsPerMonth: 25000, maxCrmIntegrations: 10, maxReps: 50, advancedAnalytics: true },
  enterprise: { maxLeadsPerMonth: Infinity, maxCrmIntegrations: Infinity, maxReps: Infinity, advancedAnalytics: true },
};

async function getWorkspacePlan(workspaceId) {
  const sub = await prisma.subscriptionLicense.findFirst({
    where: { workspaceId, status: 'PREMIUM' },
    orderBy: { createdAt: 'desc' },
  });
  if (sub) return sub.plan;
  return 'starter';
}

async function getMonthlyLeadCount(workspaceId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return prisma.leadLog.count({
    where: { companyId: workspaceId, createdAt: { gte: startOfMonth } },
  });
}

async function getCrmIntegrationCount(workspaceId) {
  return prisma.cRMConnection.count({
    where: { workspaceId, isActive: true },
  });
}

async function getRepCount(workspaceId) {
  return prisma.user.count({
    where: { workspaceId, isActive: true, role: 'REP' },
  });
}

function checkLimit(req, res, next) {
  checkUsageLimit(req, res, next);
}

async function checkUsageLimit(req, res, next) {
  const workspaceId = req.body?.workspaceId || req.query?.companyId || req.params?.workspaceId;
  if (!workspaceId) return next();

  try {
    const plan = await getWorkspacePlan(workspaceId);
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;

    if (req.method === 'POST' && req.path.includes('/slack/')) {
      const monthlyCount = await getMonthlyLeadCount(workspaceId);
      if (monthlyCount >= limits.maxLeadsPerMonth) {
        return res.status(429).json({
          error: 'Monthly lead limit exceeded',
          limit: limits.maxLeadsPerMonth,
          current: monthlyCount,
          plan,
          upgradeUrl: '/checkout?plan=upgrade',
        });
      }
    }

    if (req.path.includes('/crm/connect') && req.method === 'POST') {
      const crmCount = await getCrmIntegrationCount(workspaceId);
      if (crmCount >= limits.maxCrmIntegrations) {
        return res.status(429).json({
          error: `CRM integration limit reached (${limits.maxCrmIntegrations} max for ${plan} plan)`,
          limit: limits.maxCrmIntegrations,
          current: crmCount,
          plan,
          upgradeUrl: '/checkout?plan=upgrade',
        });
      }
    }

    next();
  } catch (err) {
    console.error('Usage limit check error:', err);
    next();
  }
}

module.exports = { checkUsageLimit, checkLimit, getWorkspacePlan, PLAN_LIMITS };
