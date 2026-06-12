const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { sendSMS } = require('../services/telnyxService');
const { routeLead } = require('../services/routingEngine');
const prisma = new PrismaClient();
const router = express.Router();

// POST /api/telnyx/callback
router.post('/callback', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !data.event_type) return res.sendStatus(200);

    // Handle call answered – tell the rep to press 1 or 2
    if (data.event_type === 'call.answered') {
      const callControlId = data.payload.call_control_id;

      // Respond with a TeXML gather command
      const texml = `
        <Response>
          <Gather input="dtmf" numDigits="1" timeout="15" action="${process.env.BACKEND_URL}/api/telnyx/gather">
            <Say voice="female">
              New lead: ${data.payload.to_name || 'prospect'}.
              Press 1 to accept, press 2 to pass.
            </Say>
          </Gather>
          <Say>You did not press a key. Passing to next rep.</Say>
        </Response>`;
      res.type('text/xml').send(texml);
    }
    // Handle DTMF gather result
    else if (data.event_type === 'call.gather.ended') {
      const callControlId = data.payload.call_control_id;
      const digit = data.payload.digits;

      // Find the RoutingAttempt that has this callControlId
      const attempt = await prisma.routingAttempt.findFirst({
        where: { callControlId },
        include: { leadLog: true, user: true },
      });

      if (!attempt) return res.sendStatus(404);

      if (digit === '1') {
        // ACCEPT
        await prisma.routingAttempt.update({
          where: { id: attempt.id },
          data: { status: 'ACCEPTED' },
        });
        await prisma.leadLog.update({
          where: { id: attempt.leadLogId },
          data: { status: 'CONNECTED' },
        });

        // Hangup the call and send SMS
        const telnyx = require('telnyx')(process.env.TELNYX_API_KEY);
        await telnyx.calls.update(callControlId, { status: 'completed' });
        if (attempt.leadLog.crmRecordUrl) {
          await sendSMS(attempt.user.phoneNumber, attempt.leadLog.crmRecordUrl);
        }
      } else if (digit === '2') {
        // DECLINE
        await prisma.routingAttempt.update({
          where: { id: attempt.id },
          data: { status: 'DECLINED' },
        });
        const telnyx = require('telnyx')(process.env.TELNYX_API_KEY);
        await telnyx.calls.update(callControlId, { status: 'completed' });
        // Route to next rep
        routeLead(attempt.leadLogId, attempt.leadLog.companyId);
      }
    } else {
      res.sendStatus(200);
    }
  } catch (err) {
    console.error('Telnyx webhook error:', err);
    res.sendStatus(500);
  }
});

module.exports = router;