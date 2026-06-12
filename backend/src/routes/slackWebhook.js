const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();
const { getIO, getConnectedUsers } = require('../services/socketManager');
const io = getIO();
const connectedUsers = getConnectedUsers();
const { routeLead, routeBookingToCloser, checkCalendarAvailability } = require('../services/routingEngine');
const { checkUsageLimit } = require('../middleware/usageLimit');
const { broadcastEvent } = require('../../server');

function extractPayload(req) {
  if (req.body && typeof req.body === 'object') {
    if (req.body.text && typeof req.body.text === 'string') return req.body.text;
    if (req.body.payload && typeof req.body.payload === 'string') {
      try {
        const parsed = JSON.parse(req.body.payload);
        return parsed.text || parsed.body || JSON.stringify(parsed);
      } catch { return req.body.payload; }
    }
    if (req.body.body && typeof req.body.body === 'string') return req.body.body;
    if (req.body.message && typeof req.body.message === 'string') return req.body.message;
    if (req.body.event && req.body.event.text) return req.body.event.text;
    if (req.body.challenge) return null;
    const stringValues = [];
    for (const [k, v] of Object.entries(req.body)) {
      if (typeof v === 'string' && v.length > 5 && v.length < 2000) stringValues.push(v);
    }
    if (stringValues.length > 0) return stringValues.join('\n');
  }
  return null;
}

function isBookingPayload(raw) {
  const bookingKeywords = ['new booking', 'algo advisory call', 'host email', 'sales rep', 'date booked', 'booked call', 'scheduled call', 'meeting booked'];
  const lower = raw.toLowerCase();
  return bookingKeywords.some(kw => lower.includes(kw));
}

function parseBookingPayload(raw) {
  const result = {
    leadName: '', email: '', phone: '',
    utmSource: '', utmCampaign: '', utmMedium: '',
    salesRep: '', hostEmail: '', dateBooked: '', type: 'booking',
  };
  const nameMatch = raw.match(/(?:Lead\s*Name|Name|Prospect|Customer|Contact)[:\s]+(.+)/i);
  if (nameMatch) result.leadName = nameMatch[1].trim();
  const emailMatch = raw.match(/(?:Email|E-mail|Mail)[:\s]+(\S+@\S+)/i);
  if (emailMatch) result.email = emailMatch[1].trim();
  const phoneMatch = raw.match(/(?:Phone|Mobile|Tel|Cell|Contact\s*#?)[:\s]+(.+)/i);
  if (phoneMatch) result.phone = phoneMatch[1].trim();
  const utmSource = raw.match(/UTM[_\s]Source[:\s]+(.+)/i);
  if (utmSource) result.utmSource = utmSource[1].trim();
  const utmCampaign = raw.match(/UTM[_\s]Campaign[:\s]+(.+)/i);
  if (utmCampaign) result.utmCampaign = utmCampaign[1].trim();
  const utmMedium = raw.match(/UTM[_\s]Medium[:\s]+(.+)/i);
  if (utmMedium) result.utmMedium = utmMedium[1].trim();
  const salesRepMatch = raw.match(/Sales\s*Rep[:\s]+(.+)/i);
  if (salesRepMatch) result.salesRep = salesRepMatch[1].trim();
  const hostEmailMatch = raw.match(/Host\s*Email[:\s]+(\S+@\S+)/i);
  if (hostEmailMatch) result.hostEmail = hostEmailMatch[1].trim();
  const dateMatch = raw.match(/Date\s*Booked[:\s]+(.+)/i);
  if (dateMatch) result.dateBooked = dateMatch[1].trim();
  if (!result.leadName) {
    const fallback = raw.match(/^(?:New\s+Booking[:\s]+)?(.+)/i);
    if (fallback) result.leadName = fallback[1].trim().split('\n')[0];
  }
  const assignedCloser = raw.match(/Assigned\s*Closer[:\s]+(\S+@\S+)/i);
  if (assignedCloser) result.hostEmail = assignedCloser[1].trim();
  const closerByName = raw.match(/Closer[:\s]+(\S+@\S+)/i);
  if (closerByName && !result.hostEmail) result.hostEmail = closerByName[1].trim();
  return result;
}

const FIELD_PATTERNS = {
  name: /Name:\s*(.+)/i,
  email: /Email:\s*(.+)/i,
  phone: /Phone:\s*(.+)/i,
};

const ALT_FIELD_PATTERNS = {
  name: /(?:prospect|customer|contact|lead|name)[:\s]+(.+)/i,
  email: /(?:email|e-mail|mail)[:\s]+(\S+@\S+)/i,
  phone: /(?:phone|mobile|tel|cell|contact\s*#?)[:\s]+(.+)/i,
};

function robustParse(raw) {
  if (!raw || typeof raw !== 'string') return { name: '', email: '', phone: '', source: 'Slack' };
  const result = { name: '', email: '', phone: '', source: 'Slack' };
  for (const [key, regex] of Object.entries(FIELD_PATTERNS)) {
    const match = raw.match(regex);
    if (match) result[key] = match[1].trim();
  }
  if (!result.name) {
    for (const [key, regex] of Object.entries(ALT_FIELD_PATTERNS)) {
      const match = raw.match(regex);
      if (match) { result[key] = match[1].trim(); if (result.name) break; }
    }
  }
  if (!result.name) {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/^[-*•]\s*/, '').trim();
      if (firstLine && firstLine.length < 100 && !firstLine.includes(':')) result.name = firstLine;
    }
  }
  if (!result.email && !result.phone) {
    const emailMatch = raw.match(/(\S+@\S+\.\S+)/);
    if (emailMatch) result.email = emailMatch[1];
    const phoneMatch = raw.match(/(\+?\d[\d\s\-().]{6,}\d)/);
    if (phoneMatch) result.phone = phoneMatch[1].trim();
  }
  return result;
}

async function emitToWorkspaceUsers(workspaceId, eventType, eventData, excludeUserIds = []) {
  const excludeSet = new Set(excludeUserIds);
  for (const [userId, socketId] of (connectedUsers?.entries?.() || [])) {
    if (!excludeSet.has(userId)) {
      io.to(socketId).emit(eventType, eventData);
    }
  }
}

async function processBookingWithCalendarAwareness(booking, workspaceId, leadId) {
  const workspaceSettings = await prisma.workspaceSettings.findUnique({ where: { workspaceId } });
  const routingMode = workspaceSettings?.bookingRoutingMode || 'TRIAGE';
  const calendarAware = workspaceSettings?.calendarAwareProcessing || false;

  if (routingMode === 'CLOSER' && booking.hostEmail) {
    const closerUser = await prisma.user.findFirst({
      where: { email: booking.hostEmail, workspaceId, isActive: true },
      select: { id: true, fullName: true, email: true },
    });

    if (calendarAware && closerUser && booking.dateBooked) {
      const available = await checkCalendarAvailability(closerUser.id, booking.dateBooked);
      if (!available) {
        const fallbackReps = await prisma.user.findMany({
          where: { workspaceId, isActive: true, role: 'REP' },
          orderBy: { createdAt: 'asc' },
          take: 5,
        });
        if (fallbackReps.length > 0) {
          const fallbackUser = fallbackReps[0];
          await routeBookingToCloser({
            leadLogId: leadId,
            workspaceId,
            hostEmail: fallbackUser.email,
            salesRep: booking.salesRep,
            prospectName: booking.leadName,
            email: booking.email,
            phone: booking.phone,
          });
          return;
        }
      }
    }

    await routeBookingToCloser({
      leadLogId: leadId,
      workspaceId,
      hostEmail: booking.hostEmail,
      salesRep: booking.salesRep,
      prospectName: booking.leadName,
      email: booking.email,
      phone: booking.phone,
    });
    return;
  }

  await prisma.leadLog.create({
    data: {
      companyId: workspaceId,
      prospectName: booking.leadName || 'Booked Prospect',
      leadSource: 'Slack Booking',
      status: 'ROUTING',
      source: 'Slack',
    },
  }).catch(() => {});
}

router.post('/slack/:workspaceId', checkUsageLimit, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const rawText = extractPayload(req);

    if (req.body && req.body.challenge) {
      return res.json({ challenge: req.body.challenge });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { users: { where: { isActive: true }, select: { id: true, role: true, email: true, fullName: true } } },
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!rawText) {
      return res.status(200).json({ message: 'No text payload, skipping' });
    }

    const isBooking = isBookingPayload(rawText);
    const leadId = 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    if (isBooking) {
      const booking = parseBookingPayload(rawText);

      const eventType = 'BOOKING_ALERT';
      const eventData = {
        leadId,
        prospectName: booking.leadName || 'Booked Prospect',
        email: booking.email || '—',
        phone: booking.phone || '—',
        leadSource: 'Slack Booking',
        type: 'booking',
        salesRep: booking.salesRep || '',
        hostEmail: booking.hostEmail || '',
        dateBooked: booking.dateBooked || '',
        utmSource: booking.utmSource || '',
        utmCampaign: booking.utmCampaign || '',
        utmMedium: booking.utmMedium || '',
        workspaceId,
      };

      await emitToWorkspaceUsers(workspaceId, eventType, eventData);

      /* Broadcast booking via SSE */
      try {
        broadcastEvent('NEW_BOOKING_ALERT', {
          ...eventData,
          name: booking.leadName || 'Booked Prospect',
          email: booking.email || null,
        });
      } catch (_) {}

      try {
        await processBookingWithCalendarAwareness(booking, workspaceId, leadId);
      } catch (_) {}

      console.log(`[Slack] Booking emitted: ${booking.leadName || 'Unknown'} via workspace ${workspaceId}`);
      return res.status(200).json({
        message: 'Booking alert processed successfully',
        leadId,
        type: 'booking',
        parsed: booking,
      });
    }

    const parsed = robustParse(rawText || '');
    const eventType = 'LEAD_ALERT';
    const eventData = {
      leadId,
      prospectName: parsed.name || 'Unknown Prospect',
      email: parsed.email || '—',
      phone: parsed.phone || '—',
      leadSource: 'Slack',
      type: 'lead',
      workspaceId,
    };

    await emitToWorkspaceUsers(workspaceId, eventType, eventData);

    /* Broadcast via SSE for live frontend + extension */
    try {
      broadcastEvent('NEW_LEAD_ALERT', {
        ...eventData,
        name: parsed.name || 'Unknown Prospect',
        email: parsed.email || null,
        phone: parsed.phone || null,
        source: 'Slack',
      });
    } catch (_) {}

    console.log(`[Slack] Lead emitted: ${parsed.name || 'Unknown'} via workspace ${workspaceId}`);

    if (rawText && workspaceId) {
      try {
        await prisma.leadLog.create({
          data: {
            companyId: workspaceId,
            prospectName: parsed.name || 'Unknown Prospect',
            leadSource: 'Slack',
            status: 'ROUTING',
            source: 'Slack',
          },
        }).catch(() => {});
      } catch (_) {}
    }

    res.status(200).json({
      message: 'Slack lead processed successfully',
      leadId,
      type: 'lead',
      parsed: { name: parsed.name || 'Unknown Prospect', email: parsed.email || null, phone: parsed.phone || null },
    });
  } catch (err) {
    console.error('Slack webhook error:', err);
    const leadId = 'lead-fallback-' + Date.now();
    for (const [userId, socketId] of (connectedUsers?.entries?.() || [])) {
      io.to(socketId).emit('LEAD_ALERT', {
        leadId,
        prospectName: 'Lead from Slack',
        leadSource: 'Slack',
        workspaceId: req.params.workspaceId,
      });
    }
    res.status(200).json({ message: 'Slack lead processed (fallback)', leadId, parsed: { name: 'Lead from Slack', email: null, phone: null } });
  }
});

module.exports = router;
