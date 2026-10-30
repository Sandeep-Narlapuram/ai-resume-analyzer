import { emailService } from '../services/email.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { logger } from '../config/logger.js';

export const contactController = {
  async submit(req, res) {
    const { name, email, subject, message } = req.body;

    const result = await emailService.sendContactMessage({ name, email, subject, message });

    if (!emailService.isConfigured()) {
      // No SMTP configured — log it so the message isn't silently lost,
      // and still tell the person it was received (it was, just not
      // forwarded anywhere yet). See server/README.md.
      logger.info({ name, email, subject }, 'Contact message received (SMTP not configured, not emailed)');
    } else if (!result.sent) {
      logger.warn({ name, email, subject }, 'Contact message email failed to send');
    }

    sendSuccess(res, { message: "Message received — we'll get back to you soon." });
  },
};
