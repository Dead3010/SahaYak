import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersRound, UserPlus, UserMinus, Pencil, Plus, X } from 'lucide-react';
import { api } from '../lib/api';
import { Team, User } from '../types';
import { formatCategory } from '../lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const CATEGORIES = ['GENERAL_QUESTION', 'TECHNICAL_QUESTION', 'REFUND_REQUEST'] as const;

const categoryMeta: Record<string, { label: string; color: string }> = {
  GENERAL_QUESTION:   { label: 'General',   color: 'bg-sky-50 text-sky-700 border-sky-200' },
  TECHNICAL_QUESTION: { label: 'Technical', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  REFUND_REQUEST:     { label: 'Sales',     color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function Teams() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [addMemberTeam, setAddMemberTeam] = useState<Team | null>(null);
  const [createForm, setCreateForm] = useState({ name: '', category: '' });
  const [editName, setEditName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');

  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => api.teams.list(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
  });

  const teams: Team[] = teamsData?.teams ?? [];
  const allAgents: User[] = (usersData?.users ?? []).filter((u) => u.role === 'AGENT');

  const invalidate = () => qc.invalidateQueries({ queryKey: ['teams'] });

  const createMutation = useMutation({
    mutationFn: () => api.teams.create(createForm),
    onSuccess: () => { invalidate(); setCreateOpen(false); setCreateForm({ name: '', category: '' }); setError(''); },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed to create team'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.teams.update(id, { name }),
    onSuccess: () => { invalidate(); setEditTeam(null); setError(''); },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed to update team'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.teams.delete(id),
    onSuccess: invalidate,
    onError: (e) => alert(e instanceof Error ? e.message : 'Failed to delete team'),
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => api.teams.addMember(teamId, userId),
    onSuccess: () => { invalidate(); qc.invalidateQueries({ queryKey: ['users'] }); setSelectedUserId(''); },
    onError: (e) => alert(e instanceof Error ? e.message : 'Failed to add member'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => api.teams.removeMember(teamId, userId),
    onSuccess: () => { invalidate(); qc.invalidateQueries({ queryKey: ['users'] }); },
    onError: (e) => alert(e instanceof Error ? e.message : 'Failed to remove member'),
  });

  const unassignedAgents = allAgents.filter((u) => !u.teamId);
  const teamMemberIds = (addMemberTeam?.members ?? []).map((m) => m.id);
  const availableAgents = unassignedAgents.filter((u) => !teamMemberIds.includes(u.id));

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Teams</h1>
          <p className="text-sm text-slate-500 mt-1">Manage teams and assign agents to handle ticket categories</p>
        </div>
        {teams.length < 3 && (
          <Button onClick={() => { setCreateForm({ name: '', category: '' }); setError(''); setCreateOpen(true); }}
            className="rounded-full font-semibold px-5 shadow-sm shadow-blue-200">
            <Plus className="w-4 h-4 mr-1.5" /> New Team
          </Button>
        )}
      </div>

      {/* Team cards */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <UsersRound className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-base font-bold text-slate-700">No teams yet</p>
          <p className="text-sm text-slate-400 mt-1">Create up to 3 teams — one per ticket category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {teams.map((team) => {
            const meta = categoryMeta[team.category] ?? categoryMeta.GENERAL_QUESTION;
            return (
              <div key={team.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
                {/* Team header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{team.name}</h2>
                    <Badge className={`mt-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${meta.color}`}>
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setEditName(team.name); setError(''); setEditTeam(team); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if (confirm(`Delete team "${team.name}"?`)) deleteMutation.mutate(team.id); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Members */}
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Agents ({team.members.length})
                  </p>
                  {team.members.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No agents assigned</p>
                  ) : (
                    <div className="space-y-1.5">
                      {team.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-bold text-white">{member.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-700 truncate">{member.name}</span>
                          </div>
                          <button
                            onClick={() => removeMemberMutation.mutate({ teamId: team.id, userId: member.id })}
                            className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add member button */}
                <Button variant="outline" size="sm"
                  onClick={() => { setSelectedUserId(''); setAddMemberTeam(team); }}
                  className="rounded-full text-xs font-semibold w-full border-dashed">
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Add Agent
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) { setCreateOpen(false); setError(''); } }}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">New Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
            <div className="space-y-1.5">
              <Label>Team Name</Label>
              <Input placeholder="e.g. Tech Support" value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Handles Category</Label>
              <Select value={createForm.category} onValueChange={(v) => setCreateForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CATEGORIES.filter((c) => !teams.find((t) => t.category === c)).map((c) => (
                    <SelectItem key={c} value={c}>{formatCategory(c)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={() => { if (!createForm.name || !createForm.category) { setError('All fields required'); return; } createMutation.mutate(); }}
              disabled={createMutation.isPending} className="rounded-full font-semibold">
              {createMutation.isPending ? 'Creating…' : 'Create Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={!!editTeam} onOpenChange={(o) => { if (!o) { setEditTeam(null); setError(''); } }}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">Rename Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
            <div className="space-y-1.5">
              <Label>Team Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTeam(null)} className="rounded-full">Cancel</Button>
            <Button onClick={() => { if (editTeam) updateMutation.mutate({ id: editTeam.id, name: editName }); }}
              disabled={updateMutation.isPending} className="rounded-full font-semibold">
              {updateMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={!!addMemberTeam} onOpenChange={(o) => { if (!o) setAddMemberTeam(null); }}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">
              Add Agent to {addMemberTeam?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {availableAgents.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No unassigned agents available.</p>
            ) : (
              <div className="space-y-1.5">
                <Label>Select Agent</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger><SelectValue placeholder="Choose an agent" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {availableAgents.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name} — {u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberTeam(null)} className="rounded-full">Cancel</Button>
            {availableAgents.length > 0 && (
              <Button
                onClick={() => { if (addMemberTeam && selectedUserId) addMemberMutation.mutate({ teamId: addMemberTeam.id, userId: selectedUserId }); }}
                disabled={!selectedUserId || addMemberMutation.isPending}
                className="rounded-full font-semibold">
                {addMemberMutation.isPending ? 'Adding…' : 'Add Agent'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
