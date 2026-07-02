import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Users from './Users';
import { api } from '../lib/api';
import type { User } from '../types';

vi.mock('../lib/api', () => ({
  api: {
    users: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN', createdAt: '2024-01-01' } satisfies User,
  }),
}));

function renderUsers() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <Users />
    </QueryClientProvider>
  );
}

async function openAddUserDialog() {
  const addBtn = await screen.findByRole('button', { name: /add user/i });
  await userEvent.click(addBtn);
  await screen.findByRole('dialog');
}

describe('Add User form', () => {
  beforeEach(() => {
    vi.mocked(api.users.list).mockResolvedValue({ users: [] });
  });

  it('opens the dialog when the Add User button is clicked', async () => {
    renderUsers();
    await openAddUserDialog();
    expect(screen.getByRole('heading', { name: /add user/i })).toBeInTheDocument();
  });

  it('shows red borders on all three required fields when submitted empty', async () => {
    renderUsers();
    await openAddUserDialog();

    await userEvent.click(screen.getByRole('button', { name: /create user/i }));

    expect(screen.getByLabelText(/^name/i)).toHaveClass('border-destructive');
    expect(screen.getByLabelText(/^email/i)).toHaveClass('border-destructive');
    expect(screen.getByLabelText(/^password/i)).toHaveClass('border-destructive');
    expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
  });

  it('treats whitespace-only name as empty and shows red border only on that field', async () => {
    renderUsers();
    await openAddUserDialog();

    await userEvent.type(screen.getByLabelText(/^name/i), '   ');
    await userEvent.type(screen.getByLabelText(/^email/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /create user/i }));

    expect(screen.getByLabelText(/^name/i)).toHaveClass('border-destructive');
    expect(screen.getByLabelText(/^email/i)).not.toHaveClass('border-destructive');
    expect(screen.getByLabelText(/^password/i)).not.toHaveClass('border-destructive');
  });

  it('treats whitespace-only password as empty and shows red border only on that field', async () => {
    renderUsers();
    await openAddUserDialog();

    await userEvent.type(screen.getByLabelText(/^name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/^email/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/^password/i), '   ');
    await userEvent.click(screen.getByRole('button', { name: /create user/i }));

    expect(screen.getByLabelText(/^name/i)).not.toHaveClass('border-destructive');
    expect(screen.getByLabelText(/^email/i)).not.toHaveClass('border-destructive');
    expect(screen.getByLabelText(/^password/i)).toHaveClass('border-destructive');
  });

  it('clears a field red border as soon as the user starts typing in it', async () => {
    renderUsers();
    await openAddUserDialog();

    await userEvent.click(screen.getByRole('button', { name: /create user/i }));

    const nameInput = screen.getByLabelText(/^name/i);
    expect(nameInput).toHaveClass('border-destructive');

    await userEvent.type(nameInput, 'J');
    expect(nameInput).not.toHaveClass('border-destructive');
  });

  it('does not call api.users.create when required fields are empty', async () => {
    renderUsers();
    await openAddUserDialog();

    await userEvent.click(screen.getByRole('button', { name: /create user/i }));

    expect(api.users.create).not.toHaveBeenCalled();
  });

  it('calls api.users.create with trimmed values on valid submission', async () => {
    vi.mocked(api.users.create).mockResolvedValue({
      user: { id: 'u2', name: 'Jane', email: 'jane@test.com', role: 'AGENT', createdAt: '' },
    });

    renderUsers();
    await openAddUserDialog();

    await userEvent.type(screen.getByLabelText(/^name/i), '  Jane  ');
    await userEvent.type(screen.getByLabelText(/^email/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/^password/i), '  secret123  ');
    await userEvent.click(screen.getByRole('button', { name: /create user/i }));

    expect(api.users.create).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@test.com',
      password: 'secret123',
      role: 'AGENT',
    });
  });

  it('closes the dialog after a successful submission', async () => {
    vi.mocked(api.users.create).mockResolvedValue({
      user: { id: 'u2', name: 'Jane', email: 'jane@test.com', role: 'AGENT', createdAt: '' },
    });

    renderUsers();
    await openAddUserDialog();

    await userEvent.type(screen.getByLabelText(/^name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/^email/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /create user/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows the API error message inside the form on failure', async () => {
    vi.mocked(api.users.create).mockRejectedValue(new Error('Email already in use'));

    renderUsers();
    await openAddUserDialog();

    await userEvent.type(screen.getByLabelText(/^name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/^email/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /create user/i }));

    await screen.findByText('Email already in use');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the dialog and resets the form when Cancel is clicked', async () => {
    renderUsers();
    await openAddUserDialog();

    await userEvent.type(screen.getByLabelText(/^name/i), 'Jane');
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(await screen.findByRole('button', { name: /add user/i }));
    expect(await screen.findByLabelText(/^name/i)).toHaveValue('');
  });

  it('resets red borders when the dialog is reopened after a failed submit', async () => {
    renderUsers();
    await openAddUserDialog();

    await userEvent.click(screen.getByRole('button', { name: /create user/i }));
    expect(screen.getByLabelText(/^name/i)).toHaveClass('border-destructive');

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await userEvent.click(await screen.findByRole('button', { name: /add user/i }));

    expect(await screen.findByLabelText(/^name/i)).not.toHaveClass('border-destructive');
  });
});
