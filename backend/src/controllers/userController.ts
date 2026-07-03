import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const USER_SELECT = { id: true, email: true, name: true, role: true, createdAt: true } as const;

const parseRole = (role: unknown): Role => (role === 'ADMIN' ? 'ADMIN' : 'AGENT');

export const listUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: 'email, password, and name are required' });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: parseRole(role) },
      select: USER_SELECT,
    });
    res.status(201).json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as Record<string, string>;
  const { name, email, role, password } = req.body;

  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (role) data.role = parseRole(role);
  if (password) data.password = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
    res.json({ user });
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params as Record<string, string>;
  if (req.user?.id === id) {
    res.status(400).json({ error: 'Cannot delete your own account' });
    return;
  }
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
};
