const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// GET /api/admin/keys
router.get('/keys', async (req, res) => {
  try {
    const keys = await prisma.licenseKey.findMany({
      orderBy: { createdAt: 'desc' },
      include: { company: { select: { name: true } } },
    });
    res.json(keys);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Isko apne baaki routes ke sath src/routes/superAdmin.js mein paste karein
router.post('/generate-license', async (req, res) => {
    try {
        // 1. Ek random unique license key generate karein (Format: XXXX-XXXX-XXXX-XXXX)
        const crypto = require('crypto');
        const generatedKey = crypto.randomBytes(8).toString('hex').toUpperCase().match(/.{1,4}/g).join('-');

        // 2. Database mein save karein (Model name is licenseKey)
        const newLicense = await prisma.licenseKey.create({
            data: {
                keyString: 'LA-' + generatedKey,
                isActive: true,
                createdAt: new Date()
            }
        });

        // 3. Frontend ko response bhej dein
        res.json({ success: true, licenseKey: 'LA-' + generatedKey });
    } catch (error) {
        console.error("License generation error:", error);
        res.status(500).json({ success: false, error: "Key generate nahi ho payi" });
    }
});

// POST /api/admin/keys
router.post('/keys', async (req, res) => {
  try {
    const keyString = 'LA-' + Math.random().toString(36).substring(2, 8).toUpperCase() +
                     '-' + Math.random().toString(36).substring(2, 8).toUpperCase() +
                     '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const key = await prisma.licenseKey.create({
      data: { keyString },
    });
    res.status(201).json(key);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/keys/:id/revoke
router.put('/keys/:id/revoke', async (req, res) => {
  try {
    const key = await prisma.licenseKey.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json(key);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;