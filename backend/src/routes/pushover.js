const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// GET /api/reps/:repId/pushover-settings
router.get('/:repId/pushover-settings', async (req, res) => {
  try {
    const { repId } = req.params;
    const settings = await prisma.pushoverSettings.findUnique({
      where: { userId: repId },
    });
    res.json(settings || { isEnabled: false, userKey: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reps/:repId/pushover-settings
router.post('/:repId/pushover-settings', async (req, res) => {
  try {
    const { repId } = req.params;
    const { userKey, isEnabled } = req.body;

    // Upsert the settings
    const settings = await prisma.pushoverSettings.upsert({
      where: { userId: repId },
      create: {
        userId: repId,
        userKey: userKey || '',
        isEnabled: isEnabled || false,
      },
      update: {
        userKey: userKey !== undefined ? userKey : undefined,
        isEnabled: isEnabled !== undefined ? isEnabled : undefined,
      },
    });

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;