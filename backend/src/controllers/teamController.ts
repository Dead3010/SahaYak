import { Response } from 'express';
import { TicketCategory, Product } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const VALID_CATEGORIES: TicketCategory[] = ['GENERAL_QUESTION', 'TECHNICAL_QUESTION', 'REFUND_REQUEST'];
const VALID_PRODUCTS: Product[] = ['SAHAYAK', 'SANGAM', 'SANCHAY', 'SUGAM', 'SYNAPSE'];

const TEAM_INCLUDE = {
  members: {
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' as const },
  },
};

export const listTeams = async (_req: AuthRequest, res: Response) => {
  const teams = await prisma.team.findMany({ include: TEAM_INCLUDE, orderBy: [{ product: 'asc' }, { category: 'asc' }] });
  res.json({ teams });
};

export const createTeam = async (req: AuthRequest, res: Response) => {
  const { name, category, product } = req.body;
  if (!name || !category || !product) { res.status(400).json({ error: 'name, category, and product are required' }); return; }
  if (!VALID_CATEGORIES.includes(category)) { res.status(400).json({ error: 'Invalid category' }); return; }
  if (!VALID_PRODUCTS.includes(product)) { res.status(400).json({ error: 'Invalid product' }); return; }

  const existing = await prisma.team.findFirst({ where: { category, product } });
  if (existing) { res.status(409).json({ error: `A ${category} team for ${product} already exists` }); return; }

  const team = await prisma.team.create({ data: { name, category, product }, include: TEAM_INCLUDE });
  res.status(201).json({ team });
};

export const seedDefaultTeams = async (_req: AuthRequest, res: Response) => {
  const PRODUCTS: { value: Product; label: string }[] = [
    { value: 'SAHAYAK', label: 'SahaYak' },
    { value: 'SANGAM',  label: 'Sangam' },
    { value: 'SANCHAY', label: 'Sanchay' },
    { value: 'SUGAM',   label: 'Sugam' },
    { value: 'SYNAPSE', label: 'Synapse' },
  ];

  const CATEGORY_LABELS: Record<TicketCategory, string> = {
    GENERAL_QUESTION:   'General',
    TECHNICAL_QUESTION: 'Technical',
    REFUND_REQUEST:     'Refund',
  };

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const p of PRODUCTS) {
    for (const cat of VALID_CATEGORIES) {
      try {
        const existing = await prisma.team.findFirst({ where: { category: cat, product: p.value } });
        if (existing) { skipped++; continue; }
        await prisma.team.create({
          data: { name: `${p.label} – ${CATEGORY_LABELS[cat]}`, category: cat, product: p.value },
        });
        created++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${p.value}/${cat}: ${msg}`);
      }
    }
  }

  const teams = await prisma.team.findMany({ include: TEAM_INCLUDE, orderBy: [{ product: 'asc' }, { category: 'asc' }] });
  res.json({ message: `Created ${created} teams, skipped ${skipped} existing.${errors.length ? ` Errors: ${errors.join('; ')}` : ''}`, teams });
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
