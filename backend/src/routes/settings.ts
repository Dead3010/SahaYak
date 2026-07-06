import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../services/emailService';

const router = Router();

router.get('/', authenticate, requireAdmin, (_req: AuthRequest, res: Response) => {
  res.json({
    supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || '',
    webhookPath: '/api/webhooks/email',
  });
});

router.post('/report-issue', async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'name, email and message are required' });
    return;
  }

  try {
    const notifyEmail = (process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER || '').trim();
    await sendEmail({
      to: notifyEmail,
      toName: 'SahaYak AI',
      subject: `Login Issue Report from ${name}`,
      body: `You have a new login issue report:\n\nName: ${name}\nEmail: ${email}\n\nIssue:\n${message}`,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('report-issue email error:', err);
    res.status(500).json({ error: 'Failed to send report' });
  }
});

router.post('/demo-inquiry', async (req: Request, res: Response) => {
  const { name, contact, email, org, interest } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: 'name and email are required' });
    return;
  }

  try {
    const notifyEmail = (process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER || '').trim();
    await sendEmail({
      to: notifyEmail,
      toName: 'SahaYak AI',
      subject: `New Demo Inquiry from ${name}`,
      body: `You have a new demo inquiry:\n\nName: ${name}\nContact: ${contact || '—'}\nEmail: ${email}\nOrganization: ${org || '—'}\nInterested in: ${interest || '—'}`,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('demo-inquiry email error:', err);
    res.status(500).json({ error: 'Failed to send inquiry email' });
  }
});

export default router;
