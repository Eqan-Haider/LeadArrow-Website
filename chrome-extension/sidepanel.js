document.addEventListener('DOMContentLoaded', function() {
  var $ = function(id) { return document.getElementById(id); };

  var emptyState = $('empty-state');
  var callPanel = $('call-panel');
  var followupPanel = $('followup-panel');
  var mockBanner = $('mock-banner');
  var leadNameDisplay = $('lead-name-display');
  var leadSourceDisplay = $('lead-source-display');
  var callStatusDisplay = $('call-status-display');
  var callDurationDisplay = $('call-duration-display');
  var callNumberDisplay = $('call-number-display');
  var acceptCallBtn = $('accept-call-btn');
  var declineCallBtn = $('decline-call-btn');
  var followupCallBtn = $('followup-call-btn');
  var followupText = $('followup-text');

  if (!emptyState || !callPanel) return;

  var callStartTime = null;
  var durationInterval = null;

  function formatDuration(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function setCallPanel(show) {
    if (emptyState) emptyState.classList.toggle('hidden', show);
    if (callPanel) callPanel.classList.toggle('hidden', !show);
  }

  function updateFromStorage() {
    try {
      chrome.storage.local.get(['currentLead', 'activeCall', 'followupLead'], function(data) {
        if (chrome.runtime.lastError) {
          console.log('[LeadArrow Sidepanel] Storage error:', chrome.runtime.lastError);
          return;
        }
        var hasLead = data.currentLead;
        var hasCall = data.activeCall;
        var hasFollowup = data.followupLead;

        if (hasFollowup) {
          setCallPanel(false);
          if (followupPanel) followupPanel.classList.remove('hidden');
          if (followupText) followupText.textContent = 'Follow-up reminder \u2014 call ' + (hasFollowup.leadName || 'lead') + ' now.';
          if (followupCallBtn) followupCallBtn.dataset.phone = hasFollowup.phone || '';
          return;
        }

        if (followupPanel) followupPanel.classList.add('hidden');

        if (hasLead) {
          setCallPanel(true);
          if (leadNameDisplay) leadNameDisplay.textContent = hasLead.prospectName || 'Unknown Lead';
          if (leadSourceDisplay) leadSourceDisplay.textContent = 'Source: ' + (hasLead.leadSource || 'Unknown');
          if (callStatusDisplay) callStatusDisplay.textContent = 'Ringing';
          if (callNumberDisplay) callNumberDisplay.textContent = hasLead.phoneNumber || '\u2014';
          if (!hasCall && callDurationDisplay) {
            callDurationDisplay.textContent = '00:00';
            if (durationInterval) clearInterval(durationInterval);
            callStartTime = null;
          }
        } else if (hasCall) {
          setCallPanel(true);
          if (leadNameDisplay) leadNameDisplay.textContent = hasCall.leadName || 'Outbound Call';
          if (leadSourceDisplay) leadSourceDisplay.textContent = 'Number: ' + (hasCall.phoneNumber || '\u2014');
          if (callStatusDisplay) callStatusDisplay.textContent = hasCall.status === 'connected' ? 'Connected' : 'Connecting...';
          if (callNumberDisplay) callNumberDisplay.textContent = hasCall.phoneNumber || '\u2014';
          if (hasCall.status === 'connected' && hasCall.startTime) {
            callStartTime = hasCall.startTime;
            if (durationInterval) clearInterval(durationInterval);
            durationInterval = setInterval(function() {
              if (callDurationDisplay) callDurationDisplay.textContent = formatDuration(Date.now() - callStartTime);
            }, 200);
          }
        } else {
          setCallPanel(false);
          if (durationInterval) clearInterval(durationInterval);
          callStartTime = null;
        }
      });
    } catch (e) {
      console.log('[LeadArrow Sidepanel] Error reading storage:', e);
    }
  }

  if (acceptCallBtn) {
    acceptCallBtn.addEventListener('click', function() {
      try { chrome.runtime.sendMessage({ action: 'ACCEPT_LEAD' }); } catch(e) {}
      if (callStatusDisplay) callStatusDisplay.textContent = 'Connected';
    });
  }

  if (declineCallBtn) {
    declineCallBtn.addEventListener('click', function() {
      try { chrome.runtime.sendMessage({ action: 'DECLINE_LEAD' }); } catch(e) {}
      setCallPanel(false);
      if (durationInterval) clearInterval(durationInterval);
      callStartTime = null;
    });
  }

  if (followupCallBtn) {
    followupCallBtn.addEventListener('click', function() {
      var phone = followupCallBtn.dataset.phone;
      if (phone) {
        try { chrome.runtime.sendMessage({ action: 'CLICK_TO_CALL', phoneNumber: phone }); } catch(e) {}
      }
    });
  }

  try {
    chrome.storage.onChanged.addListener(function(changes) {
      if (changes.currentLead || changes.activeCall || changes.followupLead) {
        updateFromStorage();
      }
    });
  } catch(e) {}

  updateFromStorage();
});
