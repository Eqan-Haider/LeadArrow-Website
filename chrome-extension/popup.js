var state = {
  paired: false,
  tier: 'BASIC',
  email: '',
  agentName: '',
  workspace: '',
  telemetryActive: false,
  activeCalls: [],
};

var timerIntervals = {};

function $(id) { return document.getElementById(id); }

function show(elementId) {
  var el = $(elementId);
  if (el) el.classList.remove('hidden');
}

function hide(elementId) {
  var el = $(elementId);
  if (el) el.classList.add('hidden');
}

function updateTierBadge(tier) {
  var badge = $('tierBadge');
  if (!badge) return;
  badge.textContent = tier || 'BASIC';
  badge.className = 'badge';
  if (tier === 'PREMIUM') {
    badge.classList.add('badge-premium');
  } else {
    badge.classList.add('badge-basic');
  }
}

function formatTime(seconds) {
  var m = Math.floor(seconds / 60);
  var s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function renderActiveCalls(calls) {
  var list = $('activeCallsList');
  var noCalls = $('noCalls');
  if (!list || !noCalls) return;
  list.innerHTML = '';
  if (!calls || calls.length === 0) {
    noCalls.classList.remove('hidden');
    $('activeCallCount').textContent = '0';
    return;
  }
  noCalls.classList.add('hidden');
  $('activeCallCount').textContent = calls.length;
  calls.forEach(function(call) {
    var div = document.createElement('div');
    div.className = 'call-item fade-in';
    div.setAttribute('data-call-id', call.callId);
    var elapsedDisplay = formatTime(call.elapsed || 0);
    div.innerHTML =
      '<div class="call-info">' +
        '<div class="call-name">' + escapeHtml(call.leadName) + '</div>' +
        '<div class="call-meta">' + (call.email ? escapeHtml(call.email) : '') + (call.phone ? ' &middot; ' + escapeHtml(call.phone) : '') + '</div>' +
      '</div>' +
      '<span class="call-timer" id="timer-' + call.callId + '">' + elapsedDisplay + '</span>' +
      '<button class="terminate-btn" data-call-id="' + call.callId + '" title="Terminate Call">&#10005;</button>';
    list.appendChild(div);
    if (timerIntervals[call.callId]) {
      clearInterval(timerIntervals[call.callId]);
    }
    var timerSpan = div.querySelector('.call-timer');
    if (timerSpan) {
      var startTime = new Date(call.startTime).getTime();
      timerIntervals[call.callId] = setInterval(function() {
        var elapsed = Math.floor((Date.now() - startTime) / 1000);
        timerSpan.textContent = formatTime(elapsed);
      }, 1000);
    }
    var terminateBtn = div.querySelector('.terminate-btn');
    if (terminateBtn) {
      terminateBtn.addEventListener('click', function() {
        var callId = this.getAttribute('data-call-id');
        terminateCall(callId);
      });
    }
  });
}

function escapeHtml(text) {
  if (!text) return '';
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function terminateCall(callId) {
  fetch('http://localhost:5001/api/telephony/terminate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId: callId }),
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data && data.success) {
      refreshState();
    }
  }).catch(function(err) {
    console.error('Terminate failed:', err);
  });
}

function refreshState() {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, function(response) {
    if (!response) {
      show('stateUnlinked');
      hide('stateLinked');
      updateTierBadge('BASIC');
      return;
    }
    state = {
      paired: response.paired,
      tier: response.tier,
      email: response.email,
      agentName: response.agentName,
      workspace: response.workspace,
      telemetryActive: response.telemetryActive,
      activeCalls: response.activeCalls || [],
    };
    if (state.paired) {
      show('stateLinked');
      hide('stateUnlinked');
      updateTierBadge(state.tier);
      $('agentName').textContent = state.agentName || '-';
      $('workspaceName').textContent = state.workspace || '-';
      $('agentEmail').textContent = state.email || '-';
      var connStatus = $('connStatus');
      if (state.telemetryActive) {
        connStatus.className = 'badge badge-premium';
        connStatus.textContent = '\u25CF Live';
        $('telemetryStatus').textContent = '\u25CF Flowing';
        $('telemetryStatus').style.color = '#10b981';
      } else {
        connStatus.className = 'badge badge-offline';
        connStatus.textContent = '\u25CF Offline';
        $('telemetryStatus').textContent = '\u2717 Disconnected';
        $('telemetryStatus').style.color = '#ef4444';
      }
      renderActiveCalls(state.activeCalls);
    } else {
      show('stateUnlinked');
      hide('stateLinked');
      updateTierBadge('BASIC');
    }
  });
}

function pairExtension() {
  var input = $('pairingInput');
  var errorEl = $('pairError');
  var code = input ? input.value.trim() : '';
  if (!code) {
    if (errorEl) {
      errorEl.textContent = 'Please enter a pairing code';
      errorEl.classList.remove('hidden');
    }
    return;
  }
  if (errorEl) errorEl.classList.add('hidden');
  var pairBtn = $('pairBtn');
  if (pairBtn) {
    pairBtn.textContent = 'Pairing...';
    pairBtn.disabled = true;
  }
  chrome.runtime.sendMessage({ type: 'PAIR', pairingCode: code }, function(response) {
    if (pairBtn) {
      pairBtn.textContent = 'Pair';
      pairBtn.disabled = false;
    }
    if (response && response.success) {
      updateTierBadge(response.tier);
      refreshState();
    } else {
      if (errorEl) {
        errorEl.textContent = response ? response.error : 'Pairing failed. Check code and server status.';
        errorEl.classList.remove('hidden');
      }
    }
  });
}

function unpairExtension() {
  var unpairBtn = $('unpairBtn');
  if (unpairBtn) {
    unpairBtn.textContent = 'Disconnecting...';
    unpairBtn.disabled = true;
  }
  chrome.runtime.sendMessage({ type: 'UNPAIR' }, function(response) {
    if (unpairBtn) {
      unpairBtn.textContent = 'Disconnect & Unpair';
      unpairBtn.disabled = false;
    }
    Object.keys(timerIntervals).forEach(function(k) { clearInterval(timerIntervals[k]); });
    timerIntervals = {};
    refreshState();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  refreshState();
  var pairBtn = $('pairBtn');
  if (pairBtn) {
    pairBtn.addEventListener('click', pairExtension);
  }
  var pairingInput = $('pairingInput');
  if (pairingInput) {
    pairingInput.addEventListener('keydown', function(ev) {
      if (ev.key === 'Enter') pairExtension();
    });
    pairingInput.addEventListener('input', function() {
      var errorEl = $('pairError');
      if (errorEl) errorEl.classList.add('hidden');
    });
  }
  var unpairBtn = $('unpairBtn');
  if (unpairBtn) {
    unpairBtn.addEventListener('click', unpairExtension);
  }
});

chrome.runtime.onMessage.addListener(function(message) {
  if (message.type === 'ACTIVE_CALL_START' || message.type === 'ACTIVE_CALL_END' || message.type === 'CALL_TIMER_TICK') {
    refreshState();
  }
  if (message.type === 'NEW_LEAD_ALERT' || message.type === 'FOLLOW_UP_REMINDER') {
    refreshState();
  }
  if (message.type === 'LISTEN_LIVE') {
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  }
});

window.addEventListener('beforeunload', function() {
  Object.keys(timerIntervals).forEach(function(k) { clearInterval(timerIntervals[k]); });
  timerIntervals = {};
});
