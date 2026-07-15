import { Router, Request, Response } from 'express';
import { sendEmail } from '../services/emailService';
import { prisma } from '../lib/prisma';
import { triggerAutoResolve } from '../controllers/ticketController';
import { scorePriority, analyzeBug, classifyTicket } from '../services/aiService';

const router = Router();

interface SentryBreadcrumb {
  type: string;
  message?: string;
  timestamp?: string;
  data?: {
    from?: string;
    to?: string;
    url?: string;
    method?: string;
    status_code?: number;
    reason?: string;
  };
}

function formatBreadcrumbs(values: SentryBreadcrumb[]): string {
  return values
    .filter((b) => b.type !== 'default' || b.message)
    .map((b, i) => {
      const n = i + 1;
      if (b.type === 'navigation' && b.data?.from && b.data?.to) {
        return `${n}. 🔀 Navigated: ${b.data.from} → ${b.data.to}`;
      }
      if (b.type === 'ui.click' && b.message) {
        return `${n}. 👆 Clicked: ${b.message}`;
      }
      if (b.type === 'http' && b.data) {
        const status = b.data.status_code ? ` → ${b.data.status_code}` : '';
        return `${n}. 🌐 API Call: ${b.data.method || 'GET'} ${b.data.url}${status}`;
      }
      if (b.type === 'error' && b.message) {
        return `${n}. ❌ Error: ${b.message}`;
      }
      if (b.message) {
        return `${n}. • ${b.message}`;
      }
      return null;
    })
    .filter(Boolean)
    .join('\n');
}

router.post('/sentry', async (req: Request, res: Response) => {
  // Always respond 200 immediately so Sentry doesn't retry
  res.json({ ok: true });

  try {
    // Legacy webhook: event is at req.body.event
    // Internal integration webhook: event is at req.body.data.event
    const event = req.body?.data?.event ?? req.body?.event ?? req.body;
    if (!event) return;

    // Title: check exception values first (beforeSend format), then fallback
    const exceptionValue = event.exception?.values?.[0];
    const title: string =
      event.title ||
      (exceptionValue ? `${exceptionValue.type}: ${exceptionValue.value}` : '') ||
      event.message ||
      'Unknown Error';

    // Breadcrumbs: can be array (beforeSend) or { values: [] } (webhook)
    const rawBreadcrumbs = Array.isArray(event.breadcrumbs)
      ? event.breadcrumbs
      : (event.breadcrumbs?.values ?? []);
    const breadcrumbs: SentryBreadcrumb[] = rawBreadcrumbs;

    const userEmail: string = event.user?.email || event.user?.id || 'sentry@auto.report';
    const userName: string = event.user?.name || event.user?.email || 'Sentry Auto-Report';
    const pageUrl: string = event.request?.url || '';
    const environment: string = event.environment || 'unknown';
    const eventId: string = event.event_id || '';
    const sentryUrl: string = event.url ||
      (eventId ? `https://enjay.sentry.io/issues/?query=${eventId}` : '');
    const timestamp: string = event.timestamp
      ? new Date(Number(event.timestamp) * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Extract browser / OS from tags array: [["browser", "Chrome 120"], ...]
    const tags: string[][] = Array.isArray(event.tags) ? event.tags : [];
    const browser = tags.find(([k]) => k === 'browser')?.[1] || '';
    const os = tags.find(([k]) => k === 'os')?.[1] || '';
    const deviceInfo = [browser, os].filter(Boolean).join(' | ');

    const stepsText = breadcrumbs.length > 0
      ? formatBreadcrumbs(breadcrumbs)
      : `(No breadcrumbs captured — error occurred at: ${pageUrl || 'unknown page'})`;

    const body = [
      `Steps to Reproduce:`,
      stepsText,
      ``,
      `─────────────────────────`,
      `User:        ${userEmail}`,
      deviceInfo ? `Browser/OS:  ${deviceInfo}` : null,
      pageUrl ? `Page:        ${pageUrl}` : null,
      `Environment: ${environment}`,
      `Time:        ${timestamp}`,
      sentryUrl ? `Sentry Link: ${sentryUrl}` : null,
    ].filter((l) => l !== null).join('\n');

    // AI analysis (fire and forget — don't block email)
    let aiSection = '';
    try {
      const analysis = await analyzeBug(title, stepsText);
      aiSection = [
        ``,
        `─────────────────────────`,
        `🤖 AI Analysis`,
        `Root Cause:    ${analysis.rootCause}`,
        `Trigger:       ${analysis.likelyCause}`,
        `Suggested Fix: ${analysis.suggestedFix}`,
        `Confidence:    ${analysis.confidence}%`,
      ].join('\n');
    } catch { /* AI optional — don't fail email */ }

    const notifyEmail = (process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER || '').trim();

    // Send email to Yash
    if (notifyEmail) {
      await sendEmail({
        to: notifyEmail,
        toName: 'Yash',
        subject: `🐛 Bug Report — "${title}"`,
        body: body + aiSection,
      });
    }

    // Auto-create ticket in helpdesk
    const ticket = await prisma.ticket.create({
      data: {
        subject: title,
        body,
        fromEmail: userEmail,
        fromName: userName,
        source: 'EMAIL',
        category: 'TECHNICAL_QUESTION',
      },
    });

    triggerAutoResolve(ticket.id).catch(() => {});
    scorePriority(title, body, ticket.category)
      .then((priority) => prisma.ticket.update({ where: { id: ticket.id }, data: { priority } }))
      .catch(() => {});

  } catch (err) {
    console.error('[SentryWebhook] Error:', err instanceof Error ? err.message : err);
  }
});

// ── WhatsApp webhook (Green API) ──
router.post('/whatsapp', async (req: Request, res: Response) => {
  res.json({ ok: true }); // respond immediately

  try {
    const body = req.body;

    // Only handle incoming text messages
    if (body?.typeWebhook !== 'incomingMessageReceived') return;
    if (body?.messageData?.typeMessage !== 'textMessage') return;

    const phone: string = body.senderData?.sender?.replace('@c.us', '') || '';
    const senderName: string = body.senderData?.senderName || phone;
    const text: string = body.messageData?.textMessageData?.textMessage || '';

    if (!phone || !text) return;

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        subject: text.length > 80 ? text.slice(0, 77) + '...' : text,
        body: text,
        fromEmail: `${phone}@whatsapp`,
        fromName: senderName,
        fromPhone: phone,
        source: 'WHATSAPP',
      },
    });

    console.log(`[WhatsApp] New ticket from ${senderName} (${phone}): ${ticket.id}`);

    classifyTicket(ticket.subject, ticket.body)
      .then(async (category) => {
        await prisma.ticket.update({ where: { id: ticket.id }, data: { category, aiClassified: true } });
        scorePriority(ticket.subject, ticket.body, category)
          .then((priority) => prisma.ticket.update({ where: { id: ticket.id }, data: { priority } }))
          .catch(() => {});
      })
      .catch(() => {})
      .finally(() => {
        triggerAutoResolve(ticket.id).catch(() => {});
      });

  } catch (err) {
    console.error('[WhatsApp] Webhook error:', err instanceof Error ? err.message : err);
  }
});

export default router;
