import { Router, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { prisma } from '../lib/prisma';
import { chatWithGanga } from '../services/aiService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    const kbEntries = await prisma.knowledgeBase.findMany();
    let kbContext: string;
    if (kbEntries.length > 0) {
      kbContext = kbEntries.map((e) => `### ${e.title}\n${e.content}`).join('\n\n');
    } else {
      try {
        kbContext = readFileSync(join(__dirname, '../services/knowledge-base (2).md'), 'utf-8');
      } catch {
        kbContext = 'No knowledge base available.';
      }
    }

    const reply = await chatWithGanga(message, history, kbContext);
    res.json({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

export default router;
