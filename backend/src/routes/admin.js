const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");
const prisma = new PrismaClient();
const router = express.Router();

router.get("/", authenticate, (req, res) => {
  res.status(200).json({ success: true, message: "Admin Area - Secure Premium Route Operational" });
});

router.get("/users", authenticate, authorize("ADMIN", "MANAGER", "SUPER_ADMIN"), async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: "companyId required" });

    const users = await prisma.user.findMany({
      where: { companyId },
      select: {
        id: true, fullName: true, email: true, role: true, isActive: true,
        isAvailable: true, isActivated: true, phoneNumber: true,
        subscriptionTier: true, createdAt: true, updatedAt: true,
        _count: { select: { routingAttempts: true, claimedLeads: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/users/:id/toggle-active", authenticate, authorize("ADMIN", "MANAGER", "SUPER_ADMIN"), async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: req.body.isActive },
    });
    res.json({ id: user.id, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/users/:id/role", authenticate, authorize("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["REP", "MANAGER", "ADMIN", "USER"];
    if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role" });
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    res.json({ id: user.id, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/trials", authenticate, authorize("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActivated: false },
      select: {
        id: true, fullName: true, email: true, companyName: true,
        phoneNumber: true, createdAt: true, subscriptionTier: true,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/users/:id/trial-extend", authenticate, authorize("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { subscriptionTier: "PRO", isActivated: true },
    });
    res.json({ id: user.id, subscriptionTier: user.subscriptionTier, message: "Trial extended / activated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/users/:id", authenticate, authorize("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/workspace-settings/:workspaceId", async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const settings = await prisma.workspaceSettings.findUnique({ where: { workspaceId } });
    if (!settings) {
      const created = await prisma.workspaceSettings.create({
        data: { workspaceId, bookingRoutingMode: "TRIAGE", calendarAwareProcessing: false },
      });
      return res.json({ settings: created });
    }
    res.json({ settings });
  } catch (err) {
    console.error("Error fetching workspace settings:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.patch("/workspace-settings/:workspaceId", authenticate, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { bookingRoutingMode, calendarAwareProcessing, ringTimeout, routingRule } = req.body;
    const updateData = {};
    if (bookingRoutingMode) updateData.bookingRoutingMode = bookingRoutingMode;
    if (typeof calendarAwareProcessing === "boolean") updateData.calendarAwareProcessing = calendarAwareProcessing;
    if (typeof ringTimeout === "number") updateData.ringTimeout = ringTimeout;
    if (routingRule) updateData.routingRule = routingRule;
    const settings = await prisma.workspaceSettings.upsert({
      where: { workspaceId },
      update: updateData,
      create: { workspaceId, bookingRoutingMode: "TRIAGE", calendarAwareProcessing: false, ringTimeout: 20, ...updateData },
    });
    res.json({ settings, message: "Workspace settings updated" });
  } catch (err) {
    console.error("Error updating workspace settings:", err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

router.get("/overview", authenticate, async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: "companyId required" });

    const [totalUsers, totalLeads, totalAccepted, activeReps] = await Promise.all([
      prisma.user.count({ where: { companyId } }),
      prisma.leadLog.count({ where: { companyId } }),
      prisma.leadLog.count({ where: { companyId, status: "CONNECTED" } }),
      prisma.user.count({ where: { companyId, role: "REP", isActive: true } }),
    ]);

    res.json({ totalUsers, totalLeads, totalAccepted, activeReps });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/licenses", authenticate, authorize("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    var { email, companyId, status } = req.query;
    var where = {};
    if (email) where.issuedToEmail = email;
    if (companyId) where.workspaceId = companyId;
    if (status) where.status = status;
    var licenses = await prisma.subscriptionLicense.findMany({
      where: where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(licenses);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/licenses/expiring", authenticate, authorize("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    var now = new Date();
    var in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    var expiring = await prisma.subscriptionLicense.findMany({
      where: { status: "ACTIVE", expiresAt: { gte: now, lte: in7Days } },
      orderBy: { expiresAt: "asc" },
    });
    res.json(expiring);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/licenses/:id/revoke", authenticate, authorize("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    var license = await prisma.subscriptionLicense.update({
      where: { id: req.params.id },
      data: { status: "REVOKED" },
    });
    res.json({ id: license.id, status: license.status, message: "License revoked" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/licenses/:id/extend", authenticate, authorize("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  try {
    var { days } = req.body;
    var addDays = parseInt(days) || 30;
    var license = await prisma.subscriptionLicense.findUnique({ where: { id: req.params.id } });
    if (!license) return res.status(404).json({ error: "License not found" });
    var newExpiry = license.expiresAt
      ? new Date(new Date(license.expiresAt).getTime() + addDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + addDays * 24 * 60 * 60 * 1000);
    var updated = await prisma.subscriptionLicense.update({
      where: { id: req.params.id },
      data: { expiresAt: newExpiry, status: "ACTIVE" },
    });
    res.json({ id: updated.id, expiresAt: updated.expiresAt, message: "License extended by " + addDays + " days" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/routing-percentages/:companyId", authenticate, async (req, res) => {
  try {
    const percentages = await prisma.repPercentage.findMany({
      where: { companyId: req.params.companyId },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    });
    res.json(percentages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/routing-percentages/:companyId", authenticate, async (req, res) => {
  try {
    const { percentages } = req.body;
    if (!Array.isArray(percentages)) return res.status(400).json({ error: "percentages array required" });

    const total = percentages.reduce((s, p) => s + (p.percentage || 0), 0);
    if (total > 100) return res.status(400).json({ error: "Total percentage cannot exceed 100" });

    await prisma.repPercentage.deleteMany({ where: { companyId: req.params.companyId } });

    const created = [];
    for (const p of percentages) {
      if (p.userId && p.percentage > 0) {
        const rp = await prisma.repPercentage.create({
          data: { companyId: req.params.companyId, userId: p.userId, percentage: p.percentage },
        });
        created.push(rp);
      }
    }
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
