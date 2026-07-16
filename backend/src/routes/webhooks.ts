import { Router, Request, Response } from 'express';
import { sendEmail } from '../services/emailService';
import { sendWhatsAppMessage } from '../services/whatsappService';
import { prisma } from '../lib/prisma';
import { triggerAutoResolve } from '../controllers/ticketController';
import { scorePriority, analyzeBug, classifyTicket, isSupportQuery, analyzeWhatsAppImage } from '../services/aiService';

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

    // Only handle incoming messages
    if (body?.typeWebhook !== 'incomingMessageReceived') return;
    const msgType: string = body?.messageData?.typeMessage || '';
    if (msgType !== 'textMessage' && msgType !== 'imageMessage') return;

    const chatId: string = body.senderData?.chatId || '';
    const senderPhone: string = body.senderData?.sender?.replace('@c.us', '') || '';
    const senderName: string = body.senderData?.senderName || senderPhone;
    const text: string = body.messageData?.textMessageData?.textMessage || '';

    if (!chatId) return;

    // ── Image message handler ──────────────────────────────────────────────────
    if (msgType === 'imageMessage') {
      const downloadUrl: string = body.messageData?.fileMessageData?.downloadUrl || '';
      const mimeType: string = body.messageData?.fileMessageData?.mimeType || 'image/jpeg';
      if (!downloadUrl) return;

      const isGroup = chatId.endsWith('@g.us');
      const replyTarget = chatId.replace('@g.us', '').replace('@c.us', '');
      const displayName = isGroup ? `${senderName} (Group)` : senderName;

      // Deduplication — don't create if active ticket exists
      const activeTicket = await prisma.ticket.findFirst({
        where: { fromPhone: replyTarget, source: 'WHATSAPP', status: { not: 'CLOSED' } },
      });
      if (activeTicket) {
        console.log(`[WhatsApp] Active ticket ${activeTicket.id} exists for ${senderName}, skipping image ticket`);
        return;
      }

      try {
        const analysis = await analyzeWhatsAppImage(downloadUrl, senderName, mimeType);

        const ticket = await prisma.ticket.create({
          data: {
            subject: analysis.subject,
            body: analysis.body,
            fromEmail: `${senderPhone}@whatsapp`,
            fromName: displayName,
            fromPhone: replyTarget,
            source: 'WHATSAPP',
          },
        });

        console.log(`[WhatsApp] Image ticket from ${senderName} (${senderPhone}): ${ticket.id}`);

        sendWhatsAppMessage(replyTarget, analysis.whatsappReply).catch(() => {});

        classifyTicket(ticket.subject, ticket.body)
          .then(async (category) => {
            await prisma.ticket.update({ where: { id: ticket.id }, data: { category, aiClassified: true } });
            scorePriority(ticket.subject, ticket.body, category)
              .then((priority) => prisma.ticket.update({ where: { id: ticket.id }, data: { priority } }))
              .catch(() => {});
          })
          .catch(() => {})
          .finally(() => { triggerAutoResolve(ticket.id).catch(() => {}); });
      } catch (err) {
        console.error('[WhatsApp] Image analysis error:', err instanceof Error ? err.message : err);
      }
      return;
    }

    if (!text) return;

    // For groups, chatId ends with @g.us; for personal it ends with @c.us
    const isGroup = chatId.endsWith('@g.us');
    const replyTarget = chatId.replace('@g.us', '').replace('@c.us', '');
    const displayName = isGroup ? `${senderName} (Group)` : senderName;

    // Filter greetings instantly — no AI needed
    const GREETINGS = /^(hi+|he+y+|hello+|hlo|helo|hola|namaste|namaskar|sup|yo|wassup|howdy|greetings|good\s*(morning|afternoon|evening|night)|hii+|hiii+)[\s!?.]*$/i;
    if (GREETINGS.test(text.trim())) {
      sendWhatsAppMessage(
        replyTarget,
        `👋 Hello ${senderName}! How can I help you today?\n\nPlease describe your support issue in detail and we'll get back to you shortly. 😊`
      ).catch(() => {});
      return;
    }

    // Skip very short or casual messages (less than 8 chars or single words like "Ha", "Ok", "Cool")
    const trimmed = text.trim();
    if (trimmed.length < 8 || /^[a-zA-Zऀ-ॿ]{1,6}[!?.]*$/.test(trimmed)) return;

    // Check if user already has an active (unresolved) ticket — don't create duplicates
    const activeTicket = await prisma.ticket.findFirst({
      where: {
        fromPhone: replyTarget,
        source: 'WHATSAPP',
        status: { not: 'CLOSED' },
      },
    });
    if (activeTicket) {
      console.log(`[WhatsApp] Active ticket ${activeTicket.id} exists for ${senderName}, skipping`);
      return;
    }

    // Use Gemini to check if it's a genuine support query
    const isSupport = await isSupportQuery(text).catch(() => true); // default to true if AI fails
    if (!isSupport) {
      sendWhatsAppMessage(
        replyTarget,
        `🙏 Hi ${senderName}! This channel is for customer support only.\n\nPlease describe your support issue and we'll be happy to help! 😊`
      ).catch(() => {});
      return;
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        subject: text.length > 80 ? text.slice(0, 77) + '...' : text,
        body: text,
        fromEmail: `${senderPhone}@whatsapp`,
        fromName: displayName,
        fromPhone: replyTarget,
        source: 'WHATSAPP',
      },
    });

    console.log(`[WhatsApp] New ticket from ${senderName} (${senderPhone}): ${ticket.id}`);

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
