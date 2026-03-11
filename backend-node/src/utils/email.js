'use strict';

const axios = require('axios');
const config = require('../config/env');

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

async function sendHtmlMessage(to, subject, htmlBody) {
  const { apiKey, from } = config.brevo;

  if (!apiKey || apiKey.includes('your-brevo')) {
    console.warn(`[email] Brevo API key not configured. Skipping email to ${to}`);
    return;
  }

  try {
    await axios.post(
      BREVO_URL,
      {
        sender: { name: 'Productiv', email: from },
        to: [{ email: to }],
        subject,
        htmlContent: htmlBody,
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`[email] Sent to ${to}`);
  } catch (err) {
    console.error(`[email] Failed to send to ${to}:`, err.message);
  }
}

async function sendSimpleMessage(to, subject, text) {
  return sendHtmlMessage(to, subject, `<html><body>${text}</body></html>`);
}

module.exports = { sendHtmlMessage, sendSimpleMessage };
