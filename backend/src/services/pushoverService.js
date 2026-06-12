const pushoverAppToken = process.env.PUSHOVER_APP_TOKEN; // Your LeadArrow app token

async function sendPushoverNotification(userKey, message, url = '') {
  if (!userKey || !pushoverAppToken) return false;

  try {
    const response = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: pushoverAppToken,
        user: userKey,
        message: message,
        url: url,
        url_title: 'View Lead',
        priority: 1, // High priority – bypasses quiet hours
        sound: 'persistent',
      }),
    });

    const result = await response.json();
    if (result.status === 1) {
      console.log('Pushover notification sent successfully');
      return true;
    } else {
      console.error('Pushover error:', result.errors);
      return false;
    }
  } catch (err) {
    console.error('Pushover request failed:', err);
    return false;
  }
}

module.exports = { sendPushoverNotification };