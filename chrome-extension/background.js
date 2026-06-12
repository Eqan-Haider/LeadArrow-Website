var SSE_URL = 'http://localhost:5001/api/stream';
var PAIR_URL = 'http://localhost:5001/api/extension/pair';
var TELEMETRY_ACTIVE = false;
var eventSource = null;
var pendingNotifications = {};
var activeCallTimers = {};

function getStoredData() {
  return new Promise(function(resolve) {
    chrome.storage.sync.get({
      paired: false,
      tier: 'BASIC',
      email: '',
      agentName: '',
      workspace: '',
      pairingCode: '',
      activeCalls: {},
    }, function(data) { resolve(data); });
  });
}

function setStoredData(data) {
  return new Promise(function(resolve) {
    chrome.storage.sync.set(data, function() { resolve(); });
  });
}

function connectSSE() {
  if (eventSource) {
    try { eventSource.close(); } catch(e) {}
    eventSource = null;
  }
  eventSource = new EventSource(SSE_URL);
  eventSource.addEventListener('connected', function(e) {
    console.log('[LeadArrow Bridge] SSE stream established');
    TELEMETRY_ACTIVE = true;
  });
  eventSource.addEventListener('ACTIVE_CALL_START', function(e) {
    try {
      var data = JSON.parse(e.data);
      handleIncomingCall(data);
    } catch(ex) {
      console.error('[LeadArrow Bridge] Failed to parse ACTIVE_CALL_START', ex);
    }
  });
  eventSource.addEventListener('ACTIVE_CALL_END', function(e) {
    try {
      var data = JSON.parse(e.data);
      handleCallEnded(data);
    } catch(ex) {
      console.error('[LeadArrow Bridge] Failed to parse ACTIVE_CALL_END', ex);
    }
  });
  eventSource.addEventListener('NEW_LEAD_ALERT', function(e) {
    try {
      var data = JSON.parse(e.data);
      chrome.runtime.sendMessage({ type: 'NEW_LEAD_ALERT', data: data });
    } catch(ex) {}
  });
  eventSource.addEventListener('FOLLOW_UP_REMINDER', function(e) {
    try {
      var data = JSON.parse(e.data);
      chrome.runtime.sendMessage({ type: 'FOLLOW_UP_REMINDER', data: data });
    } catch(ex) {}
  });
  eventSource.onerror = function() {
    console.error('[LeadArrow Bridge] SSE connection error, reconnecting in 5s');
    TELEMETRY_ACTIVE = false;
    if (eventSource) {
      try { eventSource.close(); } catch(e) {}
      eventSource = null;
    }
    setTimeout(connectSSE, 5000);
  };
}

function handleIncomingCall(data) {
  var callId = data.callId || data.leadId || 'call-' + Date.now();
  var leadName = data.leadName || data.prospectName || 'Unknown Lead';
  var startTime = data.startTime || new Date().toISOString();
  getStoredData().then(function(storage) {
    if (storage.tier !== 'PREMIUM') return;
    var calls = storage.activeCalls || {};
    calls[callId] = {
      leadName: leadName,
      startTime: startTime,
      status: 'CONNECTED',
      email: data.email || null,
      phone: data.phone || null,
    };
    setStoredData({ activeCalls: calls });
    chrome.notifications.create(callId, {
      type: 'basic',
      iconUrl: 'icon-128.png',
      title: '\u260E LeadArrow - Active Call',
      message: leadName + ' is now on the line. Call connected at ' + new Date(startTime).toLocaleTimeString(),
      priority: 2,
      buttons: [
        { title: '\uD83D\uDD0A Listen Live' },
        { title: '\u274C Terminate Call' },
      ],
      requireInteraction: true,
    });
    startCallTimer(callId, startTime);
    chrome.runtime.sendMessage({ type: 'ACTIVE_CALL_START', data: data });
  });
}

function handleCallEnded(data) {
  var callId = data.callId || data.leadId;
  if (!callId) return;
  var duration = data.duration || 0;
  getStoredData().then(function(storage) {
    var calls = storage.activeCalls || {};
    delete calls[callId];
    setStoredData({ activeCalls: calls });
    clearCallTimer(callId);
    chrome.notifications.clear(callId);
    chrome.runtime.sendMessage({ type: 'ACTIVE_CALL_END', data: data });
  });
}

function startCallTimer(callId, startTime) {
  clearCallTimer(callId);
  activeCallTimers[callId] = setInterval(function() {
    var elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    chrome.runtime.sendMessage({
      type: 'CALL_TIMER_TICK',
      callId: callId,
      elapsed: elapsed,
    });
  }, 1000);
}

function clearCallTimer(callId) {
  if (activeCallTimers[callId]) {
    clearInterval(activeCallTimers[callId]);
    delete activeCallTimers[callId];
  }
}

function pairWithServer(pairingCode) {
  return fetch(PAIR_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pairingCode: pairingCode }),
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data && data.success) {
      return setStoredData({
        paired: true,
        tier: data.tier || 'BASIC',
        email: data.email || '',
        agentName: data.agentName || '',
        workspace: data.workspace || '',
        pairingCode: pairingCode,
      }).then(function() {
        connectSSE();
        return data;
      });
    }
    throw new Error(data.message || 'Pairing failed');
  });
}

function unpairFromServer() {
  if (eventSource) {
    try { eventSource.close(); } catch(e) {}
    eventSource = null;
  }
  TELEMETRY_ACTIVE = false;
  Object.keys(activeCallTimers).forEach(clearCallTimer);
  pendingNotifications = {};
  return setStoredData({
    paired: false,
    tier: 'BASIC',
    email: '',
    agentName: '',
    workspace: '',
    pairingCode: '',
    activeCalls: {},
  });
}

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
  getStoredData().then(function(storage) {
    var call = (storage.activeCalls || {})[notificationId];
    if (!call) return;
    if (buttonIndex === 0) {
      chrome.notifications.clear(notificationId);
      chrome.runtime.sendMessage({ type: 'LISTEN_LIVE', callId: notificationId, leadName: call.leadName });
    } else if (buttonIndex === 1) {
      var leadId = notificationId;
      fetch('http://localhost:5001/api/telephony/terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: leadId }),
      }).then(function() {
        chrome.notifications.clear(notificationId);
      }).catch(function(err) {
        console.error('[LeadArrow Bridge] Terminate failed:', err);
      });
    }
  });
});

chrome.alarms.create('reconnect-check', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === 'reconnect-check') {
    getStoredData().then(function(storage) {
      if (storage.paired && storage.tier === 'PREMIUM' && !TELEMETRY_ACTIVE) {
        console.log('[LeadArrow Bridge] Reconnect check: reconnecting SSE');
        connectSSE();
      }
    });
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'PAIR') {
    pairWithServer(message.pairingCode).then(function(data) {
      sendResponse({ success: true, tier: data.tier });
    }).catch(function(err) {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
  if (message.type === 'UNPAIR') {
    unpairFromServer().then(function() {
      sendResponse({ success: true });
    }).catch(function(err) {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
  if (message.type === 'GET_STATE') {
    getStoredData().then(function(storage) {
      var activeCallsArray = Object.keys(storage.activeCalls || {}).map(function(k) {
        var c = storage.activeCalls[k];
        var elapsed = Math.floor((Date.now() - new Date(c.startTime).getTime()) / 1000);
        return { callId: k, leadName: c.leadName, startTime: c.startTime, status: c.status, elapsed: elapsed, email: c.email, phone: c.phone };
      });
      sendResponse({
        paired: storage.paired,
        tier: storage.tier,
        email: storage.email,
        agentName: storage.agentName,
        workspace: storage.workspace,
        telemetryActive: TELEMETRY_ACTIVE,
        activeCalls: activeCallsArray,
      });
    });
    return true;
  }
});

chrome.runtime.onStartup.addListener(function() {
  getStoredData().then(function(storage) {
    if (storage.paired && storage.tier === 'PREMIUM') {
      connectSSE();
    }
  });
});

getStoredData().then(function(storage) {
  if (storage.paired && storage.tier === 'PREMIUM') {
    connectSSE();
  }
  console.log('[LeadArrow Bridge] Background service initialized. Paired:', storage.paired, '| Tier:', storage.tier);
});
