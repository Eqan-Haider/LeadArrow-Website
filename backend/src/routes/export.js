const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

router.get('/leads', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: 'companyId query parameter is required' });

    const leads = await prisma.leadLog.findMany({
      where: { companyId },
      include: {
        attempts: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
          orderBy: { attemptOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'Lead_ID,Timestamp,Customer_Name,Customer_Email,Customer_Phone,Allocated_Rep_ID,Lead_Source,Pipeline_Status,System_Notes';
    const rows = leads.map((l) => {
      const rep = l.attempts.find(a => a.status === 'ACCEPTED' || a.status === 'RINGING') || l.attempts[0];
      const repId = rep?.user?.fullName
        ? `${rep.user.fullName}${rep.user.email ? ` (${rep.user.email})` : ''}`
        : 'Unassigned';
      const notes = [
        l.crmLeadId ? `crmId:${l.crmLeadId}` : '',
        l.crmRecordUrl ? `crmUrl:${l.crmRecordUrl}` : '',
        l.source ? `src:${l.source}` : '',
        l.firstAlertedAt ? `alerted:${l.firstAlertedAt.toISOString()}` : '',
        l.firstAnsweredAt ? `answered:${l.firstAnsweredAt.toISOString()}` : '',
        l.acceptedVia ? `via:${l.acceptedVia}` : '',
        l.attempts.length ? `attempts:${l.attempts.length}` : '',
      ].filter(Boolean).join('; ');
      return [
        escapeCSV(l.id),
        escapeCSV(l.createdAt.toISOString()),
        escapeCSV(l.prospectName),
        '',
        '',
        escapeCSV(repId),
        escapeCSV(l.leadSource),
        escapeCSV(l.status),
        escapeCSV(notes),
      ].join(',');
    });

    const csv = header + '\n' + rows.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Disposition', `attachment; filename=leadarrow_enterprise_export_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Failed to export leads' });
  }
});

module.exports = router;
