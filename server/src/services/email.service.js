import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let transporter = null;
let isConfigured = false;

function getTransporter() {
  if (transporter) return transporter;

  isConfigured = Boolean(env.email.host && env.email.user && env.email.password);
  if (!isConfigured) return null;

  transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: { user: env.email.user, pass: env.email.password },
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured (see .env's SMTP_* vars); otherwise
 * logs what would have been sent and returns without throwing. This keeps
 * the app fully functional in local dev with no SMTP setup — password
 * reset and contact-form submissions still work, they just don't leave the
 * server — while sending for real the moment credentials are added.
 */
async function sendMail({ to, subject, text, html, replyTo }) {
  const client = getTransporter();

  if (!client) {
    logger.info({ to, subject }, 'SMTP not configured — email not sent (see .env SMTP_* vars)');
    return { sent: false };
  }

  try {
    await client.sendMail({ from: env.email.from, to, subject, text, html, replyTo });
    return { sent: true };
  } catch (err) {
    // Email failures should never break the request they were triggered
    // from (e.g. a password reset should still report success even if the
    // mail server is temporarily down) — log it and let the caller decide
    // whether that matters for their flow.
    logger.error({ err: err.message, to, subject }, 'Failed to send email');
    return { sent: false, error: err.message };
  }
}

export const emailService = {
  isConfigured: () => Boolean(env.email.host && env.email.user && env.email.password),

  async sendPasswordResetEmail(toEmail, rawToken, resetUrlBase) {
    const resetUrl = `${resetUrlBase}?token=${encodeURIComponent(rawToken)}`;
    return sendMail({
      to: toEmail,
      subject: 'Reset your ScoreMyResume password',
      text: `Reset your password: ${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
      html: `<p>Reset your password by clicking the link below:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
    });
  },

  async sendContactMessage({ name, email, subject, message }) {
    return sendMail({
      to: env.email.contactRecipient || env.email.from,
      subject: `[ScoreMyResume Contact] ${subject}`,
      replyTo: email,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, '<br>')}</p>`,
    });
  },
};
