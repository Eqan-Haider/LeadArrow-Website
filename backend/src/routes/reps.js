const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// Public: pairing/verify (no auth required — Chrome extension first contact)
router.post('/pairing/verify', async (req, res) => {
  try {
    const { pairingCode } = req.body;
    if (!pairingCode) {
      return res.status(400).json({ error: 'Pairing code required' });
    }

    const rep = await prisma.user.findFirst({
      where: { pairingCode, isActive: true },
    });

    if (!rep) {
      return res.status(404).json({ error: 'Invalid pairing code or no matching rep' });
    }

    await prisma.user.update({
      where: { id: rep.id },
      data: { pairingCode: null },
    });

    res.json({ userId: rep.id });
  } catch (err) {
    console.error('Pairing verify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.use(authenticate);


// ----- GET /api/reps – list all reps for a company -----
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ error: 'companyId query parameter is required' });
    }


    const reps = await prisma.user.findMany({
      where: { companyId, role: 'REP' },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        isAvailable: true,
        phoneNumber: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map fullName -> name for frontend compatibility
    const mapped = reps.map(r => ({ ...r, name: r.fullName }));

    res.json(mapped);
  } catch (err) {
    console.error('GET /api/reps error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----- POST /api/reps/add – add a new rep -----
router.post('/add', authorize('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { fullName, email, role, phoneNumber } = req.body;
    let companyId = req.body.companyId;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required.' });
    }

    // Check for duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'A user with that email already exists.' });
    }

    const rep = await prisma.user.create({
      data: {
        fullName,
        email,
        role: 'REP',
        companyId: companyId || null,
        phoneNumber: phoneNumber || null,
        password: 'invite_pending',
        isActive: true,
        isAvailable: true,
      },
    });

    res.status(201).json(rep);
  } catch (err) {
    console.error('POST /api/reps/add error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----- PUT /api/reps/:id – update rep info -----
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, name, email, isActive, isAvailable, phoneNumber } = req.body;
    const nameToUse = fullName || name;

    const rep = await prisma.user.update({
      where: { id },
      data: {
        ...(nameToUse && { fullName: nameToUse }),
        ...(email && { email }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(typeof isAvailable === 'boolean' && { isAvailable }),
        ...(phoneNumber !== undefined && { phoneNumber: phoneNumber || '' }),
      },
    });

    res.json(rep);
  } catch (err) {
    console.error('PUT /api/reps/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----- DELETE /api/reps/:id – delete a rep -----
router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Rep removed successfully' });
  } catch (err) {
    console.error('DELETE /api/reps/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----- POST /api/reps/:id/pairing-code – generate Chrome extension pairing code (auth required) -----
router.post('/:id/pairing-code', async (req, res) => {
  try {
    const pairingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await prisma.user.update({
      where: { id: req.params.id },
      data: { pairingCode },
    });
    res.json({ pairingCode });
  } catch (err) {
    console.error('Pairing code error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/reps/:id/role – update a rep's role (manager only)
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // only allow valid roles
    const validRoles = ['REP', 'MANAGER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const rep = await prisma.user.update({
      where: { id },
      data: { role },
    });

    res.json(rep);
  } catch (err) {
    console.error('PUT /:id/role error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;