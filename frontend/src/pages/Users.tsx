import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Trash2, ShieldCheck, User as UserIcon, Pencil } from 'lucide-react';
import { api } from '../lib/api';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type FormState = { name: string; email: string; password: string; role: string };

const EMPTY_FORM: FormState = { name: '', email: '', password: '', role: 'AGENT' };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  const { data, isLoading: loading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
  });

  const users: User[] = data?.users ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] });

  const createMutation = useMutation({
    mutationFn: (f: FormState) => api.users.create(f),
    onSuccess: () => { handleClose(); invalidate(); },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FormState> }) =>
      api.users.update(id, payload),
    onSuccess: () => { handleClose(); invalidate(); },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: invalidate,
    onError: (e) => alert(e instanceof Error ? e.message : 'Failed to delete user'),
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError('');
    setShowCreate(true);
  };

  const openEdit = (user: User) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setError('');
    setEditUser(user);
  };

  const handleClose = () => {
    setShowCreate(false);
    setEditUser(null);
    setError('');
    setForm(EMPTY_FORM);
  };

  const handleCreate = () => {
    if (!form.name || !form.email || !form.password) { setError('All fields are required'); return; }
    setError('');
    createMutation.mutate(form);
  };

  const handleUpdate = () => {
    if (!editUser) return;
    const payload: Partial<FormState> = { name: form.name, email: form.email, role: form.role };
    if (form.password) payload.password = form.password;
    setError('');
    updateMutation.mutate({ id: editUser.id, payload });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(id);
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">{users.length} team member{users.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate} className="rounded-full font-semibold px-5 shadow-sm shadow-blue-200">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          <span>Member</span>
          <span>Actions</span>
        </div>
        {users.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-12">No users found.</p>
        )}
        {users.map((user, i) => (
          <div
            key={user.id}
            className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors duration-150 ${i < users.length - 1 ? 'border-b border-slate-100' : ''}`}
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
              <span className="text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                {user.id === currentUser?.id && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">you</span>
                )}
              </div>
              <p className="text-xs text-slate-400">{user.email}</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Joined {formatDate(user.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' ? (
                <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 gap-1 rounded-full font-semibold">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-100 gap-1 rounded-full font-semibold">
                  <UserIcon className="w-3 h-3" /> Agent
                </Badge>
              )}
              <button
                onClick={() => openEdit(user)}
                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-150"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(user.id, user.name)}
                disabled={user.id === currentUser?.id}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">Add Team Member</DialogTitle>
          </DialogHeader>
          <UserForm form={form} setForm={setForm} error={error} showPassword />
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} className="rounded-full">Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="rounded-full font-semibold">
              {saving ? 'Creating…' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">Edit User</DialogTitle>
          </DialogHeader>
          <UserForm form={form} setForm={setForm} error={error} showPassword passwordLabel="New password (leave blank to keep)" />
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} className="rounded-full">Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving} className="rounded-full font-semibold">
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserForm({
  form,
  setForm,
  error,
  showPassword,
  passwordLabel = 'Password',
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  error: string;
  showPassword: boolean;
  passwordLabel?: string;
}) {
  return (
    <div className="space-y-4 py-2">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 animate-fade-in">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@company.com" />
      </div>
      {showPassword && (
        <div className="space-y-1.5">
          <Label htmlFor="password">{passwordLabel}</Label>
          <Input id="password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Role</Label>
        <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AGENT">Agent</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
