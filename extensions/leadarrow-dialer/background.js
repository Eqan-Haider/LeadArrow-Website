const BACKEND_URL = "https://backend-nu-nine-86.vercel.app";
let userId = null;

let callState = {
  status: 'IDLE',
  callId: null,
  leadName: null,
  leadId: null,
  startTime: null,
  elapsed: 0,
};

let alertBreaches = [];
let lastBreachNotified = '';

/* Lead alert state */
let pendingLead = null;

let elapsedInterval = null;
let sseClient = null;

/* ------------------------------------------------------------------ */
/*  SSE STREAM LISTENER                                                */
/* ------------------------------------------------------------------ */
function connectSSE() {
  if (sseClient) {
    sseClient.close();
    sseClient = null;
  }
  const es = new EventSource(API_BASE + '/stream');
  sseClient = es;

  es.addEventListener('NEW_LEAD_ALERT', (e) => {
    try {
      const data = JSON.parse(e.data);
      pendingLead = data;
      broadcastState();
      showNotification('New Lead', data.prospectName || 'Incoming lead');
    } catch (err) {
      console.error('[LeadArrow BG] SSE LEAD_ALERT parse error', err);
    }
  });

  es.addEventListener('LEAD_ALERT', (e) => {
    try {
      const data = JSON.parse(e.data);
      pendingLead = data;
      broadcastState();
      showNotification('New Lead', data.prospectName || 'Incoming lead');
    } catch (err) {
      console.error('[LeadArrow BG] SSE LEAD_ALERT parse error', err);
    }
  });

  es.addEventListener('NEW_BOOKING_ALERT', (e) => {
    try {
      const data = JSON.parse(e.data);
      pendingLead = data;
      broadcastState();
      showNotification('New Booking', data.prospectName || 'Incoming booking');
    } catch (err) {
      console.error('[LeadArrow BG] SSE BOOKING_ALERT parse error', err);
    }
  });

  es.addEventListener('ACTIVE_CALL_START', (e) => {
    try {
      const data = JSON.parse(e.data);
      callState.status = 'ON_CALL';
      callState.callId = data.callId || null;
      callState.leadName = data.leadName || 'Unknown';
      callState.leadId = data.leadId || null;
      callState.startTime = data.startTime || new Date().toISOString();
      callState.elapsed = 0;
      startElapsedTimer();
      broadcastState();
      showNotification('LeadArrow Alert', 'Voice Trunk Active with Inbound Lead!');
    } catch (err) {
      console.error('[LeadArrow BG] SSE ACTIVE_CALL_START parse error', err);
    }
  });

  es.addEventListener('ACTIVE_CALL_END', (e) => {
    try {
      const data = JSON.parse(e.data);
      callState.status = 'IDLE';
      callState.callId = null;
      callState.leadName = null;
      callState.leadId = null;
      callState.startTime = null;
      callState.elapsed = data.duration || 0;
      stopElapsedTimer();
      broadcastState();
    } catch (err) {
      console.error('[LeadArrow BG] SSE ACTIVE_CALL_END parse error', err);
    }
  });

  es.addEventListener('ALERT_BREACH', (e) => {
    try {
      const data = JSON.parse(e.data);
      alertBreaches.unshift(data);
      if (alertBreaches.length > 20) alertBreaches.length = 20;
      broadcastState();
      const breachKey = data.metric + '-' + data.timestamp;
      if (breachKey !== lastBreachNotified) {
        lastBreachNotified = breachKey;
        showNotification(
          'CRITICAL BREACH: ' + data.metric,
          data.message || 'Threshold exceeded!'
        );
      }
    } catch (err) {
      console.error('[LeadArrow BG] SSE ALERT_BREACH parse error', err);
    }
  });

  es.addEventListener('connected', () => {
    console.log('[LeadArrow BG] SSE stream established');
  });

  es.onerror = () => {
    console.warn('[LeadArrow BG] SSE error – will retry in 5s');
    es.close();
    sseClient = null;
    setTimeout(connectSSE, 5000);
  };
}

/* ------------------------------------------------------------------ */
/*  ELAPSED TIME COUNTER                                               */
/* ------------------------------------------------------------------ */
function startElapsedTimer() {
  stopElapsedTimer();
  elapsedInterval = setInterval(() => {
    if (callState.status === 'ON_CALL' && callState.startTime) {
      callState.elapsed = Math.floor(
        (Date.now() - new Date(callState.startTime).getTime()) / 1000
      );
      broadcastState();
    }
  }, 1000);
}

function stopElapsedTimer() {
  if (elapsedInterval) {
    clearInterval(elapsedInterval);
    elapsedInterval = null;
  }
}

/* ------------------------------------------------------------------ */
/*  POLLING FALLBACK (via alarms API)                                  */
/* ------------------------------------------------------------------ */
function pollActiveCalls() {
  fetch(API_BASE + '/telephony/calls')
    .then((r) => r.json())
    .then((body) => {
      const entries = Object.values(body.activeCalls || {});
      if (entries.length > 0) {
        const c = entries[0];
        if (callState.status !== 'ON_CALL') {
          callState.status = 'ON_CALL';
          callState.callId = c.callId || null;
          callState.leadName = c.leadName || 'Unknown';
          callState.leadId = c.leadId || null;
          callState.startTime = c.startTime || new Date().toISOString();
          callState.elapsed = 0;
          startElapsedTimer();
          showNotification('LeadArrow Alert', 'Voice Trunk Active with Inbound Lead!');
        }
      } else {
        if (callState.status === 'ON_CALL') {
          callState.status = 'IDLE';
          callState.callId = null;
          callState.leadName = null;
          callState.leadId = null;
          callState.startTime = null;
          stopElapsedTimer();
        }
      }
      broadcastState();
    })
    .catch(() => {});
}

function pollAlertsStatus() {
  fetch(API_BASE + '/alerts/status')
    .then((r) => r.json())
    .then((data) => {
      if (data.breaches && data.breaches.length > 0) {
        const latest = data.breaches[0];
        const breachKey = latest.metric + '-' + latest.timestamp;
        if (breachKey !== lastBreachNotified) {
          lastBreachNotified = breachKey;
          alertBreaches = data.breaches.slice(0, 20);
          broadcastState();
          showNotification(
            'CRITICAL BREACH: ' + latest.metric,
            latest.message || 'Threshold exceeded!'
          );
        }
      }
    })
    .catch(() => {});
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'leadarrow-poll') {
    pollActiveCalls();
    pollAlertsStatus();
  }
});

/* ------------------------------------------------------------------ */
/*  MESSAGING LAYER (popup <-> background)                             */
/* ------------------------------------------------------------------ */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'GET_STATE': {
      sendResponse({ callState, alertBreaches, pendingLead, userId });
      break;
    }
    case 'STORE_USERID': {
      userId = msg.userId;
      chrome.storage.local.set({ userId: msg.userId });
      sendResponse({ success: true });
      break;
    }
    case 'ACCEPT_LEAD': {
      const lead = pendingLead;
      const uid = msg.userId || userId;
      if (lead && lead.leadId) {
        fetch(API_BASE + '/workspace/leads/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: lead.leadId, userId: uid }),
        }).then(function(r){return r.json()}).then(function(res){
          pendingLead = null;
          broadcastState();
          sendResponse(res);
          if (lead.crmRecordUrl) chrome.tabs.create({ url: lead.crmRecordUrl });
          if (lead.smsLink) chrome.tabs.create({ url: lead.smsLink });
        }).catch(function(){sendResponse({success:false})});
        return true;
      }
      sendResponse({ success: false, message: 'No pending lead' });
      break;
    }
    case 'DECLINE_LEAD': {
      const dLead = pendingLead;
      const did = msg.userId || userId;
      if (dLead && dLead.leadId) {
        fetch(API_BASE + '/workspace/leads/decline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: dLead.leadId, userId: did }),
        }).then(function(r){return r.json()}).then(function(res){
          pendingLead = null;
          broadcastState();
          sendResponse(res);
        }).catch(function(){sendResponse({success:false})});
        return true;
      }
      sendResponse({ success: false, message: 'No pending lead' });
      break;
    }
    case 'TERMINATE_CALL': {
      if (callState.leadId) {
        fetch(API_BASE + '/telephony/terminate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: callState.leadId }),
        })
          .then((r) => r.json())
          .then((res) => sendResponse(res))
          .catch(() => sendResponse({ success: false }));
        return true;
      }
      sendResponse({ success: false, message: 'No active call' });
      break;
    }
    case 'DIAL': {
      const payload = msg.payload || {};
      fetch(API_BASE + '/telephony/dial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((r) => r.json())
        .then((res) => sendResponse(res))
        .catch(() => sendResponse({ success: false }));
      return true;
    }
    default:
      break;
  }
});

function broadcastState() {
  chrome.runtime.sendMessage({ type: 'STATE_UPDATE', callState, alertBreaches, pendingLead }).catch(() => {});
}

/* ------------------------------------------------------------------ */
/*  PERSIST USER ID                                                    */
/* ------------------------------------------------------------------ */
function loadUserId() {
  chrome.storage.local.get(['userId'], function(result) {
    if (result.userId) userId = result.userId;
  });
}

/* ------------------------------------------------------------------ */
/*  NOTIFICATION HELPER                                                */
/* ------------------------------------------------------------------ */
function showNotification(title, message) {
  chrome.notifications.create(
    'leadarrow-alert-' + Date.now(),
    {
      type: 'basic',
      iconUrl: 'icon-128.png',
      title: title,
      message: message,
      priority: 2,
    },
    () => {}
  );
}

/* ------------------------------------------------------------------ */
/*  INIT                                                               */
/* ------------------------------------------------------------------ */
chrome.runtime.onInstalled.addListener(() => {
  loadUserId();
  chrome.alarms.create('leadarrow-poll', { periodInMinutes: 0.25 });
  connectSSE();
  pollActiveCalls();
  pollAlertsStatus();
});

chrome.runtime.onStartup.addListener(() => {
  loadUserId();
  chrome.alarms.create('leadarrow-poll', { periodInMinutes: 0.25 });
  connectSSE();
  pollActiveCalls();
  pollAlertsStatus();
});
