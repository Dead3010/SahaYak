import { GoogleGenerativeAI } from '@google/generative-ai';
import { TicketCategory, TicketPriority } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const MODEL = 'gemini-2.0-flash';

const getClient = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const safeText = (result: { response: { text: () => string } }): string => {
  try { return result.response.text().trim(); } catch { return ''; }
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimit = msg.includes('429') || msg.toLowerCase().includes('quota');
      if (isRateLimit && i < retries - 1) {
        const delay = (i + 1) * 15000;
        console.log(`[AI] Rate limited, retrying in ${delay / 1000}s...`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

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
  const result = await withRetry(() => model.generateContent(
    `Classify this support ticket into exactly one of these categories: GENERAL_QUESTION, TECHNICAL_QUESTION, REFUND_REQUEST.

Subject: ${subject}
Body: ${body}

Respond with ONLY the category name, nothing else.`
  ));

  const text = safeText(result).toUpperCase();
  if (text.includes('REFUND')) return 'REFUND_REQUEST';
  if (text.includes('TECHNICAL')) return 'TECHNICAL_QUESTION';
  return 'GENERAL_QUESTION';
}

export async function scorePriority(
  subject: string,
  body: string,
  category: TicketCategory
): Promise<TicketPriority> {
  const model = getClient().getGenerativeModel({ model: MODEL });
  const result = await withRetry(() => model.generateContent(
    `You are a support triage system. Score the priority of this ticket as exactly one of: LOW, MEDIUM, HIGH, URGENT.

Guidelines:
- URGENT: legal threats, security breach, chargeback dispute, complete inability to access the product, or extreme frustration
- HIGH: billing errors (double charge, wrong amount), refund requests, account locked, business-critical issue
- MEDIUM: general technical issues, feature questions, moderate frustration
- LOW: general inquiries, how-to questions, calm tone, no time pressure

Category context: ${category.replace(/_/g, ' ')}
Subject: ${subject}
Body: ${body}

Respond with ONLY the priority level, nothing else.`
  ));

  const text = safeText(result).toUpperCase();
  if (text.includes('URGENT')) return 'URGENT';
  if (text.includes('HIGH')) return 'HIGH';
  if (text.includes('LOW')) return 'LOW';
  return 'MEDIUM';
}

export async function summarizeTicket(subject: string, body: string): Promise<string> {
  const model = getClient().getGenerativeModel({ model: MODEL });
  const result = await withRetry(() => model.generateContent(
    `Summarize this support ticket in 2-3 concise sentences. Focus on the core issue and what the customer needs.

Subject: ${subject}
Body: ${body}

Write only the summary, no preamble.`
  ));

  return safeText(result);
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
- Detect the language of the ticket and respond in the same language.
- If the ticket matches an escalation rule (legal threats, refund outside 30 days, chargeback dispute, account security), respond with ESCALATE and a short reason.
- If the knowledge base clearly answers the question, respond with RESOLVE and write a helpful, professional reply to the customer in the same language as the ticket.
- If the knowledge base does not contain a relevant answer, respond with UNRESOLVED.

Respond in this exact JSON format (no markdown, no code fences):
{"decision":"RESOLVE","reply":"<reply text here>"}
or
{"decision":"ESCALATE","reason":"<short reason>"}
or
{"decision":"UNRESOLVED"}`
  );

  let text = safeText(result);
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

export interface LanguageDetectionResult {
  language: string;
  languageName: string;
  translatedSubject?: string;
  translatedBody?: string;
}

export async function detectAndTranslate(
  subject: string,
  body: string
): Promise<LanguageDetectionResult> {
  const model = getClient().getGenerativeModel({ model: MODEL });

  const result = await withRetry(() =>
    model.generateContent(
      `Detect the language of this support ticket. If it is NOT English, translate the subject and body to English.

Subject: ${subject}
Body: ${body}

Respond in this exact JSON format (no markdown, no code fences):
If already English:
{"language":"en","languageName":"English"}

If non-English:
{"language":"<ISO 639-1 code>","languageName":"<English name of language>","translatedSubject":"<English translation>","translatedBody":"<English translation>"}`
    )
  );

  let text = safeText(result);
  text = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

  try {
    const parsed = JSON.parse(text);
    if (parsed.language && parsed.languageName) return parsed as LanguageDetectionResult;
  } catch { /* fall through */ }

  return { language: 'en', languageName: 'English' };
}

export interface BugAnalysisResult {
  rootCause: string;
  likelyCause: string;
  confidence: number;
  suggestedFix: string;
}

export async function analyzeBug(
  errorTitle: string,
  stepsText: string
): Promise<BugAnalysisResult> {
  const model = getClient().getGenerativeModel({ model: MODEL });

  const result = await withRetry(() =>
    model.generateContent(
      `You are a senior software engineer analyzing a bug report.

Error: ${errorTitle}

Steps leading to the error:
${stepsText}

Respond in this exact JSON format (no markdown, no code fences):
{
  "rootCause": "<1 sentence: what caused this error technically>",
  "likelyCause": "<1 sentence: what the user did that triggered it>",
  "confidence": <number 0-100>,
  "suggestedFix": "<1 sentence: how to fix it>"
}`
    )
  );

  let text = safeText(result);
  text = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

  try {
    const parsed = JSON.parse(text);
    if (parsed.rootCause && parsed.likelyCause && parsed.suggestedFix) {
      return {
        rootCause: parsed.rootCause,
        likelyCause: parsed.likelyCause,
        confidence: Number(parsed.confidence) || 80,
        suggestedFix: parsed.suggestedFix,
      };
    }
  } catch { /* fall through */ }

  return {
    rootCause: 'Could not analyze automatically.',
    likelyCause: 'Unknown trigger.',
    confidence: 0,
    suggestedFix: 'Review the error and steps manually.',
  };
}

export async function isSupportQuery(text: string): Promise<boolean> {
  const model = getClient().getGenerativeModel({ model: MODEL });
  const result = await withRetry(() =>
    model.generateContent(
      `Is this message a genuine customer support query? Answer only YES or NO.

Message: "${text}"

Rules:
- YES: questions about products, billing, refunds, account issues, technical problems, feature requests, complaints
- NO: casual greetings, random chit-chat, personal conversations, emojis only, gibberish, test messages`
    )
  );
  return safeText(result).toUpperCase().includes('YES');
}

export async function chatWithGanga(
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: string }>,
  kbContext: string
): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: MODEL,
    systemInstruction: `You are Ganga, a friendly and helpful support assistant for SahaYak AI.
Answer questions ONLY based on the knowledge base provided below.
If the knowledge base does not contain a relevant answer, politely say you don't have that information and suggest the user submit a support ticket.
Be warm, concise, and helpful. Use simple language.

KNOWLEDGE BASE:
${kbContext}`,
  });

  const geminiHistory = history.map((h) => ({
    role: h.role,
    parts: [{ text: h.parts }],
  }));

  const chat = model.startChat({ history: geminiHistory });
  const result = await withRetry(() => chat.sendMessage(message));
  return safeText(result);
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
Detect the language of the ticket and respond in the same language.
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

  return safeText(result);
}
