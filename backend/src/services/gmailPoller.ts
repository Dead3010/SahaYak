import { ImapFlow } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser';
import { prisma } from '../lib/prisma';
import { classifyTicket, scorePriority } from './aiService';
import { triggerAutoResolve } from '../controllers/ticketController';

const POLL_INTERVAL_MS = 30_000;

// Only process emails that arrive after the server starts
const SERVER_START_TIME = new Date();

async function fetchUnreadEmails() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    logger: false,
  });

  // Prevent socket errors from becoming unhandled exceptions that crash the server
  client.on('error', (err: Error) => {
    console.error('[GmailPoller] Socket error:', err.message || JSON.stringify(err));
  });

  try {
    await client.connect();
  } catch (err) {
    const detail = err instanceof Error ? (err.message || err.stack || JSON.stringify(err)) : String(err);
    console.error('[GmailPoller] Connection error:', detail);
    return;
  }

  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      // Only fetch unread emails received since the server started — ignores old inbox history
      const uids: number[] = await client.search({ seen: false, since: SERVER_START_TIME }, { uid: true }) as number[];

      if (uids && uids.length > 0) {
        for await (const msg of client.fetch(uids, { source: true }, { uid: true })) {
          try {
            if (!msg.source) continue;

            const parsed: ParsedMail = await new Promise((resolve, reject) =>
              simpleParser(msg.source as Buffer, (err, mail) => err ? reject(err) : resolve(mail))
            );

            const fromRaw = parsed.from?.value?.[0];
            const fromEmail = fromRaw?.address || '';
            const fromName = fromRaw?.name || fromEmail;
            const subject = (typeof parsed.subject === 'string' ? parsed.subject : '') || '(no subject)';
            const body = parsed.text || (typeof parsed.html === 'string' ? parsed.html.replace(/<[^>]+>/g, '') : '') || '';

            if (!fromEmail || !body) continue;

            // Extract product from subject tag e.g. "[Sangam]"
            const SUBJECT_PRODUCT_MAP: Record<string, string> = {
              'sahayak ai': 'SAHAYAK', sahayak: 'SAHAYAK',
              sangam: 'SANGAM', sanchay: 'SANCHAY',
              sugam: 'SUGAM', synapse: 'SYNAPSE',
            };
            const tagMatch = subject.match(/\[([^\]]+)\]\s*$/i);
            const detectedProduct = tagMatch
              ? SUBJECT_PRODUCT_MAP[tagMatch[1].toLowerCase().trim()] ?? null
              : null;

            const ticket = await prisma.ticket.create({
              data: { subject, body, fromEmail, fromName, source: 'EMAIL', ...(detectedProduct ? { product: detectedProduct as import('@prisma/client').Product } : {}) },
            });

            // Mark as read best-effort — must not block auto-resolve
            client.messageFlagsAdd({ uid: msg.uid } as unknown as number[], ['\\Seen'], { uid: true }).catch(() => {});

            classifyTicket(subject, body)
              .then(async (category) => {
                await prisma.ticket.update({ where: { id: ticket.id }, data: { category, aiClassified: true } });
                scorePriority(subject, body, category)
                  .then((priority) => prisma.ticket.update({ where: { id: ticket.id }, data: { priority } }))
                  .catch(() => {});
              })
              .catch(() => {})
              .finally(() => {
                triggerAutoResolve(ticket.id).catch(() => {});
              });
          } catch {
            // skip malformed messages
          }
        }
      }
    } finally {
      lock.release();
    }
  } catch (err) {
    console.error('[GmailPoller] Error:', err instanceof Error ? err.message : err);
  } finally {
    await client.logout().catch(() => client.close());
  }
}

export function startGmailPoller() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('[GmailPoller] GMAIL_USER or GMAIL_APP_PASSWORD not set — poller disabled.');
    return;
  }

  console.log(`[GmailPoller] Started — polling every ${POLL_INTERVAL_MS / 1000}s`);
  fetchUnreadEmails();
  setInterval(fetchUnreadEmails, POLL_INTERVAL_MS);
}
