/* global chrome */

var API_BASE = 'http://localhost:5001/api';

/* ------------------------------------------------------------------ */
/*  DOM REFS                                                           */
/* ------------------------------------------------------------------ */
const statusBadge  = document.getElementById('statusBadge');
const statusDot    = document.getElementById('statusDot');
const statusLabel  = document.getElementById('statusLabel');
const timerDisplay = document.getElementById('timerDisplay');
const timerSub     = document.getElementById('timerSub');
const leadName     = document.getElementById('leadName');
const radarRing    = document.getElementById('radarRing');
const btnTerminate = document.getElementById('btnTerminate');
const alertBadge   = document.getElementById('alertBadge');

const leadAlert     = document.getElementById('leadAlert');
const leadAlertName = document.getElementById('leadAlertName');
const leadAlertInfo = document.getElementById('leadAlertInfo');
const btnAccept     = document.getElementById('btnAccept');
const btnDecline    = document.getElementById('btnDecline');
const pairingSection = document.getElementById('pairingSection');
const pairingInput   = document.getElementById('pairingInput');
const btnPair        = document.getElementById('btnPair');

let userId = null;

/* Try to extract userId from stored token */
function loadUserId(cb) {
  chrome.storage.local.get(['userId'], function(result) {
    if (result.userId) userId = result.userId;
    if (cb) cb(userId);
  });
}

/* ------------------------------------------------------------------ */
/*  STATE RENDER ENGINE                                                */
/* ------------------------------------------------------------------ */
function render(state, breaches, pendingLead) {
  const s = state.status || 'IDLE';

  statusBadge.className = 'status-badge';
  statusDot.className   = 'status-dot';
  timerDisplay.className = 'timer-display';
  radarRing.className    = 'radar';

  if (s === 'ON_CALL') {
    statusBadge.classList.add('oncall');
    statusDot.classList.add('oncall');
    timerDisplay.classList.add('oncall');
    radarRing.classList.add('active');
    statusLabel.textContent = 'LIVE INBOUND \u{1F4DE}';
    btnTerminate.disabled = false;
  } else if (s === 'DIALING') {
    statusBadge.classList.add('dialing');
    statusDot.classList.add('dialing');
    timerDisplay.classList.add('dialing');
    statusLabel.textContent = 'DIALING \u26A1';
    btnTerminate.disabled = true;
  } else {
    statusBadge.classList.add('idle');
    statusDot.classList.add('idle');
    timerDisplay.classList.add('idle');
    statusLabel.textContent = 'IDLE';
    btnTerminate.disabled = true;
  }

  const sec = state.elapsed || 0;
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s_ = String(sec % 60).padStart(2, '0');
  timerDisplay.textContent = m + ':' + s_;

  if (state.leadName && s === 'ON_CALL') {
    leadName.textContent = state.leadName;
  } else {
    leadName.textContent = '\u2014';
  }

  if (s === 'ON_CALL' && state.callId) {
    timerSub.textContent = 'Trunk ' + state.callId.slice(0, 18) + '\u2026';
  } else {
    timerSub.innerHTML = '&nbsp;';
  }

  /* Pairing section */
  if (!userId && s === 'IDLE') {
    pairingSection.style.display = 'block';
  } else {
    pairingSection.style.display = 'none';
  }

  /* Lead alert section */
  if (pendingLead && pendingLead.leadId && s !== 'ON_CALL') {
    leadAlert.style.display = 'block';
    leadAlertName.textContent = pendingLead.prospectName || 'Unknown Prospect';
    const parts = [];
    if (pendingLead.email && pendingLead.email !== '\u2014') parts.push('\u2709\uFE0F ' + pendingLead.email);
    if (pendingLead.phone && pendingLead.phone !== '\u2014') parts.push('\uD83D\uDCDE ' + pendingLead.phone);
    leadAlertInfo.textContent = parts.join('  \u2022  ');
  } else {
    leadAlert.style.display = 'none';
  }

  /* alert breach badge */
  if (alertBadge && breaches && breaches.length > 0) {
    const latest = breaches[0];
    alertBadge.textContent = '\u26A0\uFE0F ' + latest.metric.replace(/_/g, ' ') + ': ' + latest.message;
    alertBadge.style.display = 'block';
  } else if (alertBadge) {
    alertBadge.style.display = 'none';
  }
}

/* ------------------------------------------------------------------ */
/*  PAIRING                                                            */
/* ------------------------------------------------------------------ */
btnPair.addEventListener('click', function() {
  var code = pairingInput.value.trim().toUpperCase();
  if (!code) return;
  btnPair.disabled = true;
  btnPair.textContent = 'Pairing...';
  var pairingError = document.getElementById('pairingError');
  fetch(API_BASE + '/reps/pairing/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pairingCode: code }),
  }).then(function(r){return r.json()}).then(function(resp){
    if (resp.userId) {
      chrome.runtime.sendMessage({ type: 'STORE_USERID', userId: resp.userId }, function(){
        userId = resp.userId;
        pairingSection.style.display = 'none';
        btnPair.disabled = false;
        btnPair.textContent = 'Pair';
      });
    } else {
      pairingError.textContent = resp.error || 'Invalid code';
      pairingError.style.display = 'block';
      btnPair.disabled = false;
      btnPair.textContent = 'Pair';
    }
  }).catch(function(){
    pairingError.textContent = 'Network error';
    pairingError.style.display = 'block';
    btnPair.disabled = false;
    btnPair.textContent = 'Pair';
  });
});

/* ------------------------------------------------------------------ */
/*  INITIAL STATE FROM BACKGROUND                                      */
/* ------------------------------------------------------------------ */
function fetchInitialState() {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (resp) => {
    if (resp) {
      if (resp.userId) userId = resp.userId;
      if (resp.callState) render(resp.callState, resp.alertBreaches, resp.pendingLead);
    }
  });
}

/* ------------------------------------------------------------------ */
/*  LISTEN FOR BACKGROUND STATE BROADCASTS                             */
/* ------------------------------------------------------------------ */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'STATE_UPDATE') {
    if (msg.callState) render(msg.callState, msg.alertBreaches, msg.pendingLead);
  }
});

/* ------------------------------------------------------------------ */
/*  ACCEPT LEAD                                                        */
/* ------------------------------------------------------------------ */
btnAccept.addEventListener('click', () => {
  btnAccept.disabled = true;
  btnAccept.textContent = 'Accepting...';
  chrome.runtime.sendMessage({ type: 'ACCEPT_LEAD', userId }, (resp) => {
    btnAccept.disabled = false;
    btnAccept.textContent = '\u2713 Accept';
    if (resp && !resp.success) {
      console.warn('Accept failed:', resp.message);
    }
  });
});

/* ------------------------------------------------------------------ */
/*  DECLINE LEAD                                                       */
/* ------------------------------------------------------------------ */
btnDecline.addEventListener('click', () => {
  btnDecline.disabled = true;
  btnDecline.textContent = 'Declining...';
  chrome.runtime.sendMessage({ type: 'DECLINE_LEAD', userId }, (resp) => {
    btnDecline.disabled = false;
    btnDecline.textContent = '\u2717 Decline';
  });
});

/* ------------------------------------------------------------------ */
/*  TERMINATE BUTTON                                                   */
/* ------------------------------------------------------------------ */
btnTerminate.addEventListener('click', () => {
  btnTerminate.disabled = true;
  chrome.runtime.sendMessage({ type: 'TERMINATE_CALL' }, (resp) => {
    if (resp && !resp.success) {
      btnTerminate.disabled = false;
    }
  });
});

/* ------------------------------------------------------------------ */
/*  BOOT                                                               */
/* ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', function() {
  loadUserId();
  fetchInitialState();
});
