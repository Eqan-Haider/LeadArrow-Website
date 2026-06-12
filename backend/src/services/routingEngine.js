const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { makeCall } = require('./telnyxService');
const { getIO, getConnectedUsers } = require('./socketManager');
const io = getIO();
const connectedUsers = getConnectedUsers();

const DEFAULT_RING_TIMEOUT = 20000;

async function getRingTimeout(workspaceId) {
  try {
    const ws = await prisma.workspaceSettings.findUnique({ where: { workspaceId } });
    return ws?.ringTimeout || DEFAULT_RING_TIMEOUT;
  } catch {
    return DEFAULT_RING_TIMEOUT;
  }
}

async function checkCalendarAvailability(userId, bookingTimestamp) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, calendarConnected: true, calendarAccessToken: true } });
    if (!user?.calendarConnected || !user?.calendarAccessToken || !bookingTimestamp) return true;
    const googleRes = await fetch(`https://www.googleapis.com/calendar/v3/freeBusy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.calendarAccessToken}` },
      body: JSON.stringify({
        timeMin: new Date(bookingTimestamp).toISOString(),
        timeMax: new Date(new Date(bookingTimestamp).getTime() + 30 * 60000).toISOString(),
        items: [{ id: 'primary' }],
      }),
    });
    if (!googleRes.ok) return true;
    const data = await googleRes.json();
    const busy = data?.calendars?.primary?.busy?.length > 0;
    return !busy;
  } catch { return true; }
}

async function routeBookingToCloser({ leadLogId, workspaceId, hostEmail, salesRep, prospectName, email, phone }) {
  try {
    const closerEmail = hostEmail || '';
    let closerUser = null;

    if (closerEmail) {
      closerUser = await prisma.user.findFirst({
        where: { email: closerEmail, workspaceId, isActive: true },
      });
    }

    if (!closerUser && salesRep) {
      closerUser = await prisma.user.findFirst({
        where: { fullName: { contains: salesRep, mode: 'insensitive' }, workspaceId, isActive: true },
      });
    }

    if (!closerUser) {
      const reps = await prisma.user.findMany({
        where: { workspaceId, role: 'REP', isActive: true, isAvailable: true },
        orderBy: { createdAt: 'asc' },
      });
      if (reps.length > 0) closerUser = reps[0];
    }

    if (!closerUser) {
      console.log(`[Booking] No closer found for workspace ${workspaceId}`);
      return;
    }

    await routeWithFallback({
      leadLogId,
      workspaceId,
      prospectName: prospectName || 'Booked Prospect',
      leadSource: 'Slack Booking',
      email: email || '',
      phone: phone || '',
      initialUserId: closerUser.id,
    });
  } catch (err) {
    console.error('Booking routing error:', err);
  }
}

async function routeWithFallback({ leadLogId, workspaceId, prospectName, leadSource, email, phone, initialUserId, crmRecordUrl }) {
  const ringTimeout = await getRingTimeout(workspaceId);
  const availableReps = await prisma.user.findMany({
    where: { workspaceId, role: 'REP', isActive: true, isAvailable: true },
    orderBy: { createdAt: 'asc' },
  });

  if (availableReps.length === 0) {
    await prisma.leadLog.update({ where: { id: leadLogId }, data: { status: 'EXHAUSTED' } }).catch(() => {});
    console.log(`[Routing] No available reps for workspace ${workspaceId}`);
    return;
  }

  const targetReps = initialUserId
    ? [availableReps.find(r => r.id === initialUserId), ...availableReps.filter(r => r.id !== initialUserId)].filter(Boolean)
    : availableReps;

  for (let i = 0; i < targetReps.length; i++) {
    const rep = targetReps[i];
    const attempt = await prisma.routingAttempt.create({
      data: { leadLogId, userId: rep.id, attemptOrder: i + 1, status: 'RINGING' },
    });

    const socketId = connectedUsers.get(rep.id);
    if (socketId) {
      io.to(socketId).emit('LEAD_ALERT', {
        leadId: leadLogId,
        prospectName,
        leadSource,
        crmRecordUrl,
        attemptId: attempt.id,
        workspaceId,
        email,
        phone,
      });
    }

    const callResult = await attemptRepCall(rep, { prospectName, leadSource, crmRecordUrl }, leadLogId, attempt.id, ringTimeout);

    if (callResult === 'ACCEPTED') {
      return;
    }

    await prisma.routingAttempt.update({
      where: { id: attempt.id },
      data: { status: callResult === 'TIMEOUT' ? 'TIMEOUT' : 'DECLINED' },
    });

    console.log(`[Routing] Rep ${rep.fullName} ${callResult}, cascading to next (${i + 2}/${targetReps.length})`);
  }

  await prisma.leadLog.update({ where: { id: leadLogId }, data: { status: 'EXHAUSTED' } }).catch(() => {});
  console.log(`[Routing] Lead ${leadLogId} exhausted — all reps declined or timed out`);
}

async function attemptRepCall(rep, lead, leadLogId, attemptId, ringTimeout) {
  if (!rep.phoneNumber) return 'NO_ANSWER';

  try {
    const call = await makeCall(rep.phoneNumber, lead, leadLogId);
    await prisma.routingAttempt.update({ where: { id: attemptId }, data: { callControlId: call.call_control_id } });

    return await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        cleanup();
        resolve('TIMEOUT');
      }, ringTimeout);

      const handler = (data) => {
        if (data.attemptId === attemptId) {
          cleanup();
          if (data.status === 'ACCEPTED') resolve('ACCEPTED');
          else if (['NO_ANSWER', 'BUSY', 'FAILED', 'DECLINED'].includes(data.status)) resolve(data.status);
        }
      };

      io.on('CALL_STATUS', handler);

      const cleanup = () => {
        clearTimeout(timeout);
        io.off('CALL_STATUS', handler);
      };
    });
  } catch (callErr) {
    console.error(`[Routing] Call failed for ${rep.fullName}:`, callErr.message);
    return 'FAILED';
  }
}

async function getPercentageRep(companyId, reps) {
  try {
    const percentages = await prisma.repPercentage.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });
    if (percentages.length === 0) return null;

    const totalPct = percentages.reduce((s, p) => s + p.percentage, 0);
    if (totalPct === 0) return null;

    const roll = Math.random() * totalPct;
    let cumulative = 0;
    for (const p of percentages) {
      cumulative += p.percentage;
      if (roll <= cumulative) {
        return reps.find(r => r.id === p.userId) || null;
      }
    }
    return null;
  } catch { return null; }
}

async function routeLead(leadLogId, companyId) {
  try {
    const lead = await prisma.leadLog.findUnique({ where: { id: leadLogId } });
    if (!lead) return;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { routingMethod: true, roundRobinPointer: true },
    });
    if (!company) throw new Error('Company not found');

    const reps = await prisma.user.findMany({
      where: { companyId, role: 'REP', isActive: true, isAvailable: true },
      orderBy: { createdAt: 'asc' },
    });

    if (reps.length === 0) {
      await prisma.leadLog.update({ where: { id: leadLogId }, data: { status: 'EXHAUSTED' } });
      return;
    }

    let selectedRep = null;
    if (company.routingMethod === 'ROUND_ROBIN') {
      const pointer = company.roundRobinPointer % reps.length;
      selectedRep = reps[pointer];
      await prisma.company.update({ where: { id: companyId }, data: { roundRobinPointer: pointer + 1 } });
    } else if (company.routingMethod === 'PERCENTAGE') {
      selectedRep = await getPercentageRep(companyId, reps);
      if (!selectedRep) selectedRep = reps[0];
    } else {
      selectedRep = reps[0];
    }

    const wsSettings = await prisma.workspaceSettings.findUnique({ where: { workspaceId: companyId } }).catch(() => null);
    const calendarEnabled = wsSettings?.calendarAwareProcessing || false;

    if (calendarEnabled && lead.createdAt) {
      const available = await checkCalendarAvailability(selectedRep.id, lead.createdAt);
      if (!available) {
        const fallbackReps = reps.filter(r => r.id !== selectedRep.id);
        if (fallbackReps.length > 0) selectedRep = fallbackReps[0];
      }
    }

    const attempt = await prisma.routingAttempt.create({
      data: { leadLogId, userId: selectedRep.id, attemptOrder: 1, status: 'RINGING' },
    });

    const socketId = connectedUsers.get(selectedRep.id);
    if (socketId) {
      io.to(socketId).emit('LEAD_ALERT', {
        leadId: leadLogId,
        prospectName: lead.prospectName,
        leadSource: lead.leadSource,
        crmRecordUrl: lead.crmRecordUrl,
        attemptId: attempt.id,
        workspaceId: companyId,
      });
    }

    const ringTimeout = await getRingTimeout(companyId);
    const callResult = await attemptRepCall(selectedRep, { prospectName: lead.prospectName, leadSource: lead.leadSource, crmRecordUrl: lead.crmRecordUrl }, leadLogId, attempt.id, ringTimeout);

    if (callResult === 'ACCEPTED') {
      return;
    }

    await prisma.routingAttempt.update({
      where: { id: attempt.id },
      data: { status: callResult === 'TIMEOUT' ? 'TIMEOUT' : 'DECLINED' },
    });

    const remainingReps = reps.filter(r => r.id !== selectedRep.id);
    for (let i = 0; i < remainingReps.length; i++) {
      const fallbackRep = remainingReps[i];
      const fallbackAttempt = await prisma.routingAttempt.create({
        data: { leadLogId, userId: fallbackRep.id, attemptOrder: i + 2, status: 'RINGING' },
      });

      const fbSocketId = connectedUsers.get(fallbackRep.id);
      if (fbSocketId) {
        io.to(fbSocketId).emit('LEAD_ALERT', {
          leadId: leadLogId,
          prospectName: lead.prospectName,
          leadSource: lead.leadSource,
          crmRecordUrl: lead.crmRecordUrl,
          attemptId: fallbackAttempt.id,
          workspaceId: companyId,
        });
      }

      const fbResult = await attemptRepCall(fallbackRep, { prospectName: lead.prospectName, leadSource: lead.leadSource, crmRecordUrl: lead.crmRecordUrl }, leadLogId, fallbackAttempt.id, ringTimeout);

      if (fbResult === 'ACCEPTED') return;

      await prisma.routingAttempt.update({
        where: { id: fallbackAttempt.id },
        data: { status: fbResult === 'TIMEOUT' ? 'TIMEOUT' : 'DECLINED' },
      });
    }

    await prisma.leadLog.update({ where: { id: leadLogId }, data: { status: 'EXHAUSTED' } });
    console.log(`[Routing] Lead ${leadLogId} exhausted — no reps available`);
  } catch (err) {
    console.error('Routing error:', err);
  }
}

module.exports = { routeLead, routeBookingToCloser, checkCalendarAvailability, routeWithFallback };
