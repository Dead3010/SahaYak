import { Router } from 'express';
import { listTeams, createTeam, updateTeam, deleteTeam, addMember, removeMember } from '../controllers/teamController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', listTeams);
router.post('/', createTeam);
router.patch('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
