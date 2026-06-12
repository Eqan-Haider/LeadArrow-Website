const telnyx = require('telnyx')(process.env.TELNYX_API_KEY);

/**
 * Make an outbound call to a rep.
 * @param {string} repPhone - E.164 format (+1234567890)
 * @param {object} lead - { prospectName, leadSource, crmRecordUrl }
 * @param {string} leadLogId - the lead log ID (for tracking)
 * @returns {object} Telnyx call object
 */
async function makeCall(repPhone, lead, leadLogId) {
  try {
    const call = await telnyx.calls.create({
      connection_id: process.env.TELNYX_CONNECTION_ID, // from Mission Control
      to: repPhone,
      from: process.env.TELNYX_CALLER_ID,              // your Telnyx number
    });

    console.log(`Telnyx call ${call.call_control_id} to ${repPhone} for lead ${leadLogId}`);

    // Store call_control_id in RoutingAttempt for later matching
    // (we'll need to update the attempt – see routing engine change below)

    return call;
  } catch (err) {
    console.error('Telnyx call failed:', err);
    throw err;
  }
}

/**
 * Send an SMS to the rep with the CRM lead link.
 * @param {string} repPhone
 * @param {string} crmRecordUrl
 */
async function sendSMS(repPhone, crmRecordUrl) {
  try {
    await telnyx.messages.create({
      from: process.env.TELNYX_CALLER_ID,
      to: repPhone,
      text: `Lead accepted! View the lead here: ${crmRecordUrl}`,
    });
    console.log(`SMS sent to ${repPhone}`);
  } catch (err) {
    console.error('SMS failed:', err);
  }
}

module.exports = { makeCall, sendSMS };