import { GoogleGenerativeAI } from '@google/generative-ai';
import { TicketCategory } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const MODEL = 'gemini-2.5-flash';

const getClient = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function parseGeminiError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit'))
    return 'Gemini API daily quota exceeded. Try again tomorrow or upgrade to a paid plan.';
  if (msg.includes('400') || msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('invalid'))
    return 'Invalid GEMINI_API_KEY. Check your .env file.';
  if (msg.includes('403'))
    return 'GEMINI_API_KEY does not have permission to use this model.';
  return `Gemini API error: ${msg}`;
}

export async function classifyTicket(
  subject: string,
  body: string
): Promise<TicketCategory> {
  const model = getClient().getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(
    `Classify this support ticket into exactly one of these categories: GENERAL_QUESTION, TECHNICAL_QUESTION, REFUND_REQUEST.

Subject: ${subject}
Body: ${body}

Respond with ONLY the category name, nothing else.`
  );

  const text = result.response.text().trim().toUpperCase();

  if (text.includes('REFUND')) return 'REFUND_REQUEST';
  if (text.includes('TECHNICAL')) return 'TECHNICAL_QUESTION';
  return 'GENERAL_QUESTION';
}

export async function summarizeTicket(subject: string, body: string): Promise<string> {
  const model = getClient().getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(
    `Summarize this support ticket in 2-3 concise sentences. Focus on the core issue and what the customer needs.

Subject: ${subject}
Body: ${body}

Write only the summary, no preamble.`
  );

  return result.response.text().trim();
}

export type AutoResolveResult =
  | { status: 'resolved'; reply: string }
  | { status: 'escalate'; reason: string }
  | { status: 'unresolved' };

export async function autoResolveFromKB(subject: string, body: string): Promise<AutoResolveResult> {
  const kbPath = join(__dirname, 'knowledge-base (2).md');
  const knowledgeBase = readFileSync(kbPath, 'utf-8');

  const model = getClient().getGenerativeModel({ model: MODEL });

  const result = await model.generateContent(
    `You are a support agent. Using ONLY the knowledge base below, decide how to handle this ticket.

KNOWLEDGE BASE:
${knowledgeBase}

TICKET SUBJECT: ${subject}
TICKET BODY: ${body}

Rules:
- If the ticket matches an escalation rule (legal threats, refund outside 30 days, chargeback dispute, account security), respond with ESCALATE and a short reason.
- If the knowledge base clearly answers the question, respond with RESOLVE and write a helpful, professional reply to the customer.
- If the knowledge base does not contain a relevant answer, respond with UNRESOLVED.

Respond in this exact JSON format (no markdown, no code fences):
{"decision":"RESOLVE","reply":"<reply text here>"}
or
{"decision":"ESCALATE","reason":"<short reason>"}
or
{"decision":"UNRESOLVED"}`
  );

  let text = result.response.text().trim();
  text = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

  try {
    const parsed = JSON.parse(text);
    if (parsed.decision === 'RESOLVE' && parsed.reply) return { status: 'resolved', reply: parsed.reply };
    if (parsed.decision === 'ESCALATE' && parsed.reason) return { status: 'escalate', reason: parsed.reason };
    return { status: 'unresolved' };
  } catch {
    return { status: 'unresolved' };
  }
}

export async function suggestReply(
  subject: string,
  body: string,
  category: TicketCategory,
  knowledgeBase: Array<{ title: string; content: string }>
): Promise<string> {
  const kbContext =
    knowledgeBase.length > 0
      ? knowledgeBase.map((k) => `### ${k.title}\n${k.content}`).join('\n\n')
      : 'No relevant knowledge base articles found.';

  const model = getClient().getGenerativeModel({ model: MODEL });
  const result = await model.generateContent(
    `You are a helpful support agent. Write a professional, friendly reply to this support ticket.
Use the knowledge base articles below to provide accurate information.
Do not invent information not present in the knowledge base.
Be empathetic, concise, and solution-focused.

Category: ${category.replace(/_/g, ' ')}

Ticket Subject: ${subject}
Ticket Body: ${body}

Knowledge Base:
${kbContext}

Write only the reply email body (no subject line, no "From/To" headers). Start with a greeting.`
  );

  return result.response.text().trim();
}
