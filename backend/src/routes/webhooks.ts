import { Router, Request, Response } from 'express';
import { sendEmail } from '../services/emailService';
import { prisma } from '../lib/prisma';
import { triggerAutoResolve } from '../controllers/ticketController';
import { scorePriority } from '../services/aiService';

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

function cleanClickLabel(msg: string): string | null {
  // Short readable message with no CSS classes — use as-is
  if (msg.length < 50 && !msg.includes('.') && !msg.match(/^[0-9a-f]{20,}$/i)) return msg;
  // Extract element tag + type from Tailwind CSS selector string
  const match = msg.match(/^(\w+)[^[]*(?:\[type="([^"]+)"\])?/);
  if (!match) return null;
  const tag = match[1];
  const type = match[2];
  if (tag === 'button' && type === 'submit') return 'Submit button';
  if (tag === 'button') return 'Button';
  if (tag === 'input' && type === 'password') return 'Password field';
  if (tag === 'input' && type === 'email') return 'Email field';
  if (tag === 'input') return 'Input field';
  if (tag === 'a') return 'Link';
  if (tag === 'span' || tag === 'div' || tag === 'p') return null;
  return tag;
}

function formatBreadcrumbs(values: SentryBreadcrumb[]): string {
  let n = 0;
  return values
    .map((b) => {
      // Skip hash-looking default breadcrumbs
      if (b.message?.match(/^[0-9a-f]{20,}$/i)) return null;

      if (b.type === 'navigation' && b.data?.from && b.data?.to) {
        n++;
        return `${n}. 🔀 Went to: ${b.data.to}`;
      }
      if (b.type === 'ui.click' && b.message) {
        const label = cleanClickLabel(b.message);
        if (!label) return null;
        n++;
        return `${n}. 👆 Clicked: ${label}`;
      }
      if (b.type === 'http' && b.data) {
        const url = (b.data.url || '').replace(/^https?:\/\/[^/]+/, '').split('?')[0];
        const status = b.data.status_code ? ` → ${b.data.status_code}` : '';
        n++;
        return `${n}. 🌐 API: ${b.data.method || 'GET'} ${url}${status}`;
      }
      if (b.type === 'error' && b.message) {
        n++;
        return `${n}. ❌ Error: ${b.message}`;
      }
      if (b.message && b.message.length < 100) {
        n++;
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
    const title: string = event.title || event.message || 'Unknown Error';
    const breadcrumbs: SentryBreadcrumb[] = event.breadcrumbs?.values ?? [];
    const userEmail: string = event.user?.email || event.user?.id || 'sentry@auto.report';
    const userName: string = event.user?.name || event.user?.email || 'Sentry Auto-Report';
    const pageUrl: string = event.request?.url || '';
    const environment: string = event.environment || 'unknown';
    const sentryUrl: string = event.url || '';
    const timestamp: string = event.timestamp
      ? new Date(event.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
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

    const notifyEmail = (process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER || '').trim();

    // Send email to Yash
    if (notifyEmail) {
      await sendEmail({
        to: notifyEmail,
        toName: 'Yash',
        subject: `🐛 Bug Report — "${title}"`,
        body,
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

export default router;
