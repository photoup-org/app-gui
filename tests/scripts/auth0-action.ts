const axios = require('axios');

exports.onExecutePostLogin = async (event: any, api: any) => {
  if (event.stats.logins_count !== 1) {
    return;
  }
  if (!event.organization || !event.organization.id) return;

  const webhookUrl = event.secrets.WEBHOOK_URL;
  const webhookSecret = event.secrets.WEBHOOK_SECRET;

  try {
    await axios.post(webhookUrl, {
      email: event.user.email,
      auth0UserId: event.user.user_id,
      auth0OrgId: event.organization.id
    }, {
      headers: { 'Authorization': `Bearer ${webhookSecret}` },
      timeout: 5000
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to sync user to Next.js webhook:", error.message);
    } else {
      console.error("Failed to sync user to Next.js webhook:", String(error));
    }
  }
};
