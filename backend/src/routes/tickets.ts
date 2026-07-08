import { Router } from 'express';
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  classifyTicketHandler,
  summarizeTicketHandler,
  suggestReplyHandler,
  prioritizeTicketHandler,
  detectLanguageHandler,
  addReply,
  addComment,
  getDashboardStats,
} from '../controllers/ticketController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/', listTickets);
router.post('/', createTicket);
router.get('/:id', getTicket);
router.patch('/:id', updateTicket);
router.delete('/:id', deleteTicket);
router.post('/:id/classify', classifyTicketHandler);
router.post('/:id/summarize', summarizeTicketHandler);
router.post('/:id/suggest-reply', suggestReplyHandler);
router.post('/:id/prioritize', prioritizeTicketHandler);
router.post('/:id/detect-language', detectLanguageHandler);
router.post('/:id/replies', addReply);
router.post('/:id/comments', addComment);

export default router;
