import { Router } from 'express';
import { listTeams, createTeam, updateTeam, deleteTeam, addMember, removeMember, seedDefaultTeams } from '../controllers/teamController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', listTeams);
router.post('/', createTeam);
router.post('/seed-defaults', seedDefaultTeams);
router.patch('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
