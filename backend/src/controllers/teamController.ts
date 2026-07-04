import { Response } from 'express';
import { TicketCategory } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const VALID_CATEGORIES: TicketCategory[] = ['GENERAL_QUESTION', 'TECHNICAL_QUESTION', 'REFUND_REQUEST'];

const TEAM_INCLUDE = {
  members: {
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' as const },
  },
};

export const listTeams = async (_req: AuthRequest, res: Response) => {
  const teams = await prisma.team.findMany({ include: TEAM_INCLUDE, orderBy: { createdAt: 'asc' } });
  res.json({ teams });
};

export const createTeam = async (req: AuthRequest, res: Response) => {
  const { name, category } = req.body;
  if (!name || !category) { res.status(400).json({ error: 'name and category are required' }); return; }
  if (!VALID_CATEGORIES.includes(category)) { res.status(400).json({ error: 'Invalid category' }); return; }

  const existing = await prisma.team.findUnique({ where: { category } });
  if (existing) { res.status(409).json({ error: `A team for ${category} already exists` }); return; }

  const team = await prisma.team.create({ data: { name, category }, include: TEAM_INCLUDE });
  res.status(201).json({ team });
};

export const updateTeam = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: 'name is required' }); return; }

  const team = await prisma.team.update({
    where: { id: req.params.id as string },
    data: { name },
    include: TEAM_INCLUDE,
  });
  res.json({ team });
};

export const deleteTeam = async (req: AuthRequest, res: Response) => {
  const team = await prisma.team.findUnique({ where: { id: req.params.id as string } });
  if (!team) { res.status(404).json({ error: 'Team not found' }); return; }
  await prisma.team.delete({ where: { id: req.params.id as string } });
  res.json({ message: 'Team deleted' });
};

export const addMember = async (req: AuthRequest, res: Response) => {
  const { userId } = req.body;
  if (!userId) { res.status(400).json({ error: 'userId is required' }); return; }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  if (user.role === 'ADMIN') { res.status(400).json({ error: 'Admins cannot be added to teams' }); return; }

  const team = await prisma.team.update({
    where: { id: req.params.id as string },
    data: { members: { connect: { id: userId } } },
    include: TEAM_INCLUDE,
  });
  res.json({ team });
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  const team = await prisma.team.update({
    where: { id: req.params.id as string },
    data: { members: { disconnect: { id: req.params.userId as string } } },
    include: TEAM_INCLUDE,
  });
  res.json({ team });
};
