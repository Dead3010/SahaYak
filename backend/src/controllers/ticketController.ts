import { Response } from 'express';
import { TicketStatus, TicketCategory, TicketPriority } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { classifyTicket, summarizeTicket, suggestReply, autoResolveFromKB, scorePriority, detectAndTranslate, parseGeminiError } from '../services/aiService';
import { sendEmail } from '../services/emailService';
import { sendWhatsAppMessage, getChatHistory, getContactName } from '../services/whatsappService';
import { prisma } from '../lib/prisma';

export async function triggerAutoResolve(ticketId: string) {
  try {
    console.log(`[AutoResolve] START ticket=${ticketId}`);
    await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'PROCESSING' } });
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) { console.log(`[AutoResolve] ticket not found`); return; }
    console.log(`[AutoResolve] calling Gemini for subject="${ticket.subject}"`);
    const result = await autoResolveFromKB(ticket.subject, ticket.body);
    console.log(`[AutoResolve] ticket=${ticketId} result=${result.status}${result.status === 'escalate' ? ` reason=${result.reason}` : ''}`);
    if (result.status === 'resolved') {
      const isWhatsApp = ticket.source === 'WHATSAPP';
      await prisma.reply.create({
        data: { body: result.reply, isAI: true, sentViaEmail: !isWhatsApp, sentViaWhatsApp: isWhatsApp, ticketId },
      });
      await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'RESOLVED', aiResolved: true } });
      if (isWhatsApp && ticket.fromPhone) {
        sendWhatsAppMessage(ticket.fromPhone, result.reply)
          .then(() => console.log(`[AutoResolve] WhatsApp sent to ${ticket.fromPhone}`))
          .catch((e) => console.error(`[AutoResolve] WhatsApp FAILED: ${e.message}`));
      } else {
        sendEmail({ to: ticket.fromEmail, toName: ticket.fromName, subject: ticket.subject, body: result.reply })
          .then(() => console.log(`[AutoResolve] email sent to ${ticket.fromEmail}`))
          .catch((e) => console.error(`[AutoResolve] email FAILED: ${e.message}`));
      }
    } else {
      // Re-fetch to get category set by classifier (may have run concurrently)
      const fresh = await prisma.ticket.findUnique({ where: { id: ticketId } });
      const category = fresh?.category ?? 'GENERAL_QUESTION';

      const team = await prisma.team.findFirst({
        where: { category },
        include: { members: { where: { role: 'AGENT' } } },
      });

      if (team && team.members.length > 0) {
        const agent = team.members[Math.floor(Math.random() * team.members.length)];
        console.log(`[AutoResolve] assigning ticket=${ticketId} to team="${team.name}" agent="${agent.name}"`);
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: 'OPEN', assignedToId: agent.id, teamId: team.id },
        });
        const agentWithPhone = await prisma.user.findUnique({ where: { id: agent.id }, select: { phone: true } });
        if (agentWithPhone?.phone) {
          const appUrl = process.env.FRONTEND_URL || 'https://sahayak-production-683a.up.railway.app';
          sendWhatsAppMessage(
            agentWithPhone.phone,
            `🎫 New Ticket Assigned to You\n\nSubject: "${ticket.subject}"\nCategory: ${ticket.category.replace(/_/g, ' ')}\n\nPlease check it out ASAP!\n👉 ${appUrl}/tickets/${ticketId}`
          ).catch(() => {});
        }
      } else {
        console.log(`[AutoResolve] no team/agents found for category=${category}, leaving unassigned`);
        await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'OPEN' } });
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[AutoResolve] ERROR for ticket ${ticketId}: ${msg}`);
    await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'OPEN' } }).catch(() => {});
  }
}

export const listTickets = async (req: AuthRequest, res: Response) => {
  const {
    status,
    category,
    priority,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = '1',
    limit = '20',
    assignedToId,
  } = req.query as Record<string, string>;

  const where: Record<string, unknown> = {};
  if (status) where.status = status as TicketStatus;
  if (category) where.category = category as TicketCategory;
  if (priority) where.priority = priority as TicketPriority;
  if (assignedToId) where.assignedToId = assignedToId;
  if (search) {
    where.OR = [
      { subject: { contains: search, mode: 'insensitive' } },
      { fromEmail: { contains: search, mode: 'insensitive' } },
      { fromName: { contains: search, mode: 'insensitive' } },
    ];
  }
  const { dateFrom, dateTo } = req.query as Record<string, string>;
  if (dateFrom || dateTo) {
    const range: { gte?: Date; lte?: Date } = {};
    if (dateFrom) range.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      range.lte = end;
    }
    where.createdAt = range;
  }

  const pageNum = Math.max(1, parseInt(page));
  const take = Math.min(100, parseInt(limit));
  const skip = (pageNum - 1) * take;

  const validSortFields = ['createdAt', 'updatedAt', 'status', 'category', 'subject'];
  const orderBy = validSortFields.includes(sortBy)
    ? { [sortBy]: sortOrder === 'asc' ? 'asc' : ('desc' as const) }
    : { createdAt: 'desc' as const };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
        _count: { select: { replies: true } },
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  res.json({ tickets, total, page: pageNum, totalPages: Math.ceil(total / take) });
};

export const getTicket = async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: (req.params.id as string) },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true } } },
        },
      },
    });
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    res.json({ ticket });
  } catch (err) {
    console.error('getTicket error:', err);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

export const createTicket = async (req: AuthRequest, res: Response) => {
  const { subject, body, fromEmail, fromName } = req.body;
  if (!subject || !body || !fromEmail || !fromName) {
    res.status(400).json({ error: 'subject, body, fromEmail, and fromName are required' });
    return;
  }

  const ticket = await prisma.ticket.create({
    data: { subject, body, fromEmail, fromName, source: 'MANUAL' },
  });

  triggerAutoResolve(ticket.id).catch(() => {});

  scorePriority(subject, body, ticket.category)
    .then((priority) => prisma.ticket.update({ where: { id: ticket.id }, data: { priority } }))
    .catch(() => {});

  detectAndTranslate(subject, body)
    .then((r) => prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        detectedLanguage: r.language,
        detectedLanguageName: r.languageName,
        ...(r.translatedSubject ? { translatedSubject: r.translatedSubject } : {}),
        ...(r.translatedBody ? { translatedBody: r.translatedBody } : {}),
      },
    }))
    .catch(() => {});

  res.status(201).json({ ticket });
};

export const updateTicket = async (req: AuthRequest, res: Response) => {
  const { status, category, assignedToId, priority } = req.body;
  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (category) data.category = category;
  if (priority) data.priority = priority as TicketPriority;
  if (assignedToId !== undefined) data.assignedToId = assignedToId || null;

  const ticket = await prisma.ticket.update({
    where: { id: (req.params.id as string) },
    data,
    include: { assignedTo: { select: { id: true, name: true, email: true, phone: true } } },
  });

  if (assignedToId && ticket.assignedTo?.phone) {
    const appUrl = process.env.FRONTEND_URL || 'https://sahayak-production-683a.up.railway.app';
    sendWhatsAppMessage(
      ticket.assignedTo.phone,
      `🎫 New Ticket Assigned to You\n\nSubject: "${ticket.subject}"\nCategory: ${ticket.category.replace(/_/g, ' ')}\n\nPlease check it out ASAP!\n👉 ${appUrl}/tickets/${ticket.id}`
    ).catch(() => {});
  }

  res.json({ ticket });
};

export const deleteTicket = async (req: AuthRequest, res: Response) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: (req.params.id as string) } });
  if (!ticket) { res.status(404).json({ error: 'Ticket not found' }); return; }
  await prisma.ticket.delete({ where: { id: (req.params.id as string) } });
  res.json({ message: 'Ticket deleted' });
};

export const classifyTicketHandler = async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: (req.params.id as string) } });
    if (!ticket) { res.status(404).json({ error: 'Ticket not found' }); return; }

    const category = await classifyTicket(ticket.subject, ticket.body);
    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { category, aiClassified: true },
    });
    res.json({ ticket: updated, category });
  } catch (err) {
    console.error('classifyTicket error:', err);
    res.status(500).json({ error: parseGeminiError(err) });
  }
};

export const summarizeTicketHandler = async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: (req.params.id as string) } });
    if (!ticket) { res.status(404).json({ error: 'Ticket not found' }); return; }

    const summary = await summarizeTicket(ticket.subject, ticket.body);
    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { summary },
    });
    res.json({ ticket: updated, summary });
  } catch (err) {
    console.error('summarizeTicket error:', err);
    res.status(500).json({ error: parseGeminiError(err) });
  }
};

export const suggestReplyHandler = async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: (req.params.id as string) } });
    if (!ticket) { res.status(404).json({ error: 'Ticket not found' }); return; }

    const kbEntries = await prisma.knowledgeBase.findMany({
      where: { category: ticket.category },
    });

    const suggestedReply = await suggestReply(
      ticket.subject,
      ticket.body,
      ticket.category,
      kbEntries
    );

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { suggestedReply },
    });
    res.json({ ticket: updated, suggestedReply });
  } catch (err) {
    console.error('suggestReply error:', err);
    res.status(500).json({ error: parseGeminiError(err) });
  }
};

export const addReply = async (req: AuthRequest, res: Response) => {
  const { body, sendEmail: doSend } = req.body;
  if (!body) { res.status(400).json({ error: 'body is required' }); return; }

  const ticket = await prisma.ticket.findUnique({ where: { id: (req.params.id as string) } });
  if (!ticket) { res.status(404).json({ error: 'Ticket not found' }); return; }

  let sentViaEmail = false;
  let sentViaWhatsApp = false;
  if (doSend) {
    if (ticket.source === 'WHATSAPP' && ticket.fromPhone) {
      await sendWhatsAppMessage(ticket.fromPhone, body);
      sentViaWhatsApp = true;
    } else {
      await sendEmail({
        to: ticket.fromEmail,
        toName: ticket.fromName,
        subject: ticket.subject,
        body,
        replyToTicketId: ticket.id,
      });
      sentViaEmail = true;
    }
  }

  const reply = await prisma.reply.create({
    data: {
      body,
      isAI: false,
      sentViaEmail,
      sentViaWhatsApp,
      ticketId: ticket.id,
      authorId: req.user!.id,
    },
    include: { author: { select: { id: true, name: true } } },
  });

  if (doSend) {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'RESOLVED' },
    });
  }

  res.status(201).json({ reply });
};

export const addComment = async (req: AuthRequest, res: Response) => {
  const { body } = req.body;
  if (!body) { res.status(400).json({ error: 'body is required' }); return; }

  const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id as string } });
  if (!ticket) { res.status(404).json({ error: 'Ticket not found' }); return; }

  const comment = await prisma.reply.create({
    data: { body, isAI: false, isInternal: true, sentViaEmail: false, ticketId: ticket.id, authorId: req.user!.id },
    include: { author: { select: { id: true, name: true } } },
  });

  res.status(201).json({ comment });
};

export const detectLanguageHandler = async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id as string } });
    if (!ticket) { res.status(404).json({ error: 'Ticket not found' }); return; }

    const r = await detectAndTranslate(ticket.subject, ticket.body);
    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        detectedLanguage: r.language,
        detectedLanguageName: r.languageName,
        ...(r.translatedSubject ? { translatedSubject: r.translatedSubject } : {}),
        ...(r.translatedBody ? { translatedBody: r.translatedBody } : {}),
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
        replies: { orderBy: { createdAt: 'asc' }, include: { author: { select: { id: true, name: true } } } },
      },
    });
    res.json({ ticket: updated });
  } catch (err) {
    res.status(500).json({ error: parseGeminiError(err) });
  }
};

export const prioritizeTicketHandler = async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id as string } });
    if (!ticket) { res.status(404).json({ error: 'Ticket not found' }); return; }

    const priority = await scorePriority(ticket.subject, ticket.body, ticket.category);
    const updated = await prisma.ticket.update({ where: { id: ticket.id }, data: { priority } });
    res.json({ ticket: updated, priority });
  } catch (err) {
    res.status(500).json({ error: parseGeminiError(err) });
  }
};

export const getWhatsAppChatHandler = async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id as string } });
    if (!ticket) { res.status(404).json({ error: 'Ticket not found' }); return; }
    if (ticket.source !== 'WHATSAPP') { res.status(400).json({ error: 'Not a WhatsApp ticket' }); return; }
    if (!ticket.fromPhone) { res.status(400).json({ error: 'No phone number on this ticket' }); return; }

    const [allMessages, chatName] = await Promise.all([
      getChatHistory(ticket.fromPhone, 100),
      getContactName(ticket.fromPhone),
    ]);

    // 5-minute buffer before ticket creation to capture the triggering message
    const sinceMs = new Date(ticket.createdAt).getTime() - 5 * 60 * 1000;
    const messages = allMessages
      .filter((m) => m.timestamp * 1000 >= sinceMs)
      .reverse();

    res.json({ messages, chatName });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
};

export const getDashboardStats = async (_req: AuthRequest, res: Response) => {
  const [total, newCount, processing, open, resolved, closed, byCategory, aiResolved, aiReplies] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: 'NEW' } }),
    prisma.ticket.count({ where: { status: 'PROCESSING' } }),
    prisma.ticket.count({ where: { status: 'OPEN' } }),
    prisma.ticket.count({ where: { status: 'RESOLVED' } }),
    prisma.ticket.count({ where: { status: 'CLOSED' } }),
    prisma.ticket.groupBy({ by: ['category'], _count: { id: true } }),
    prisma.ticket.count({ where: { aiResolved: true } }),
    prisma.reply.count({ where: { isAI: true, isInternal: false } }),
  ]);

  const recent = await prisma.ticket.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { assignedTo: { select: { name: true } } },
  });

  const resolvedTotal = resolved + closed;
  const aiResolutionRate = resolvedTotal > 0 ? Math.round((aiResolved / resolvedTotal) * 100) : 0;

  res.json({ total, new: newCount, processing, open, resolved, closed, byCategory, recent, aiResolved, aiReplies, aiResolutionRate });
};
