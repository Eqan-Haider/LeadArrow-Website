const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");
const prisma = new PrismaClient();
const router = express.Router();

router.get("/:companyId", authenticate, async (req, res) => {
  try {
    const thresholds = await prisma.alertThreshold.findMany({
      where: { companyId: req.params.companyId },
      orderBy: { createdAt: "asc" },
    });
    res.json(thresholds);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:companyId", authenticate, async (req, res) => {
  try {
    const { metric, operator, value, enabled } = req.body;
    if (!metric || !operator || value === undefined) {
      return res.status(400).json({ error: "metric, operator, and value are required" });
    }
    const threshold = await prisma.alertThreshold.create({
      data: { companyId: req.params.companyId, metric, operator, value: parseFloat(value), enabled: enabled !== false },
    });
    res.status(201).json(threshold);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const { metric, operator, value, enabled } = req.body;
    const updateData = {};
    if (metric) updateData.metric = metric;
    if (operator) updateData.operator = operator;
    if (value !== undefined) updateData.value = parseFloat(value);
    if (typeof enabled === "boolean") updateData.enabled = enabled;
    const threshold = await prisma.alertThreshold.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(threshold);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    await prisma.alertThreshold.delete({ where: { id: req.params.id } });
    res.json({ message: "Threshold deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
