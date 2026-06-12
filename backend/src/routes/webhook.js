const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();
const { routeLead } = require('../services/routingEngine');

// POST /api/webhook/lead – receive lead from CRM
router.post('/lead', async (req, res) => {
  try {
    const { lead, companyId } = req.body;   // companyId CRM se aayega (tumhara integration decide karega)
    // Simple validation
    if (!lead || !lead.name || !lead.source) {
      return res.status(400).json({ error: 'Missing lead data (name, source)' });
    }

    // Save lead log
    const leadLog = await prisma.leadLog.create({
      data: {
        companyId,
        prospectName: lead.name,
        leadSource: lead.source,
        crmLeadId: lead.crmLeadId || null,
        crmRecordUrl: lead.crmRecordUrl || null,
        status: 'ROUTING',
      },
    });

    // Trigger routing (asynchronous – will not block response)
    routeLead(leadLog.id, companyId).catch(err => console.error('Routing error:', err));

    res.status(200).json({ message: 'Lead received and routing started', leadId: leadLog.id });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;