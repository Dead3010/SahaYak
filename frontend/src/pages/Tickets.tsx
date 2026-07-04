import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Inbox, Plus, CalendarDays, Bot, UserCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Ticket } from '../types';
import { StatusBadge, CategoryBadge } from '../components/StatusBadge';
import { TICKET_STATUSES, TICKET_CATEGORIES, formatStatus, formatCategory } from '../lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const SORT_OPTIONS = [
  { label: 'Newest first', value: 'createdAt:desc' },
  { label: 'Oldest first', value: 'createdAt:asc' },
  { label: 'Recently updated', value: 'updatedAt:desc' },
];

const PRESETS = [
  { label: 'Today', key: 'today' },
  { label: 'This Week', key: 'week' },
  { label: 'This Month', key: 'month' },
  { label: 'Last 30 Days', key: '30days' },
];

const EMPTY_FORM = { subject: '', body: '', fromName: '', fromEmail: '' };

export default function Tickets() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(() => searchParams.get('status') || '');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activePreset, setActivePreset] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const queryClient = useQueryClient();
  const toDateStr = (d: Date) => d.toISOString().split('T')[0];

  const applyPreset = (key: string) => {
    if (activePreset === key) { setActivePreset(''); setDateFrom(''); setDateTo(''); resetPage(); return; }
    const now = new Date();
    const today = toDateStr(now);
    let from = today;
    if (key === 'week') { const d = new Date(now); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); from = toDateStr(d); }
    else if (key === 'month') { from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`; }
    else if (key === '30days') { const d = new Date(now); d.setDate(d.getDate() - 30); from = toDateStr(d); }
    setActivePreset(key); setDateFrom(from); setDateTo(today); resetPage();
  };

  const clearDates = () => { setActivePreset(''); setDateFrom(''); setDateTo(''); resetPage(); };

  const createMutation = useMutation({
    mutationFn: () => api.tickets.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tickets'] }); setDialogOpen(false); setForm(EMPTY_FORM); setFormError(''); },
    onError: (err: Error) => setFormError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.subject.trim() || !form.body.trim() || !form.fromName.trim() || !form.fromEmail.trim()) {
      setFormError('All fields are required.');
      return;
    }
    createMutation.mutate();
  };

  const [sortBy, sortOrder] = sort.split(':');
  const params: Record<string, string> = { page: String(page), sortBy, sortOrder };
  if (status) params.status = status;
  if (category) params.category = category;
  if (search) params.search = search;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  if (assignedToId) params.assignedToId = assignedToId;

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
  });
  const agents = (usersData?.users ?? []).filter((u) => u.role === 'AGENT');

  const { data, isLoading: loading } = useQuery({
    queryKey: ['tickets', params],
    queryFn: () => api.tickets.list(params),
  });

  const tickets: Ticket[] = data?.tickets ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const resetPage = () => setPage(1);

  const pageNumbers = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  })();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">{total} total tickets</p>
        </div>
        <Button
          onClick={() => { setForm(EMPTY_FORM); setFormError(''); setDialogOpen(true); }}
          className="rounded-full font-semibold px-5 shadow-sm shadow-blue-200 hover:shadow-md transition-all duration-150"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Ticket
        </Button>
      </div>

      {/* Create ticket dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold">Create New Ticket</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fromName" className="text-slate-700 font-medium">Customer Name</Label>
                <Input id="fromName" placeholder="John Doe" value={form.fromName}
                  onChange={(e) => setForm((f) => ({ ...f, fromName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fromEmail" className="text-slate-700 font-medium">Email</Label>
                <Input id="fromEmail" type="email" placeholder="john@example.com" value={form.fromEmail}
                  onChange={(e) => setForm((f) => ({ ...f, fromEmail: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-slate-700 font-medium">Subject</Label>
              <Input id="subject" placeholder="Brief description of the issue" value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body" className="text-slate-700 font-medium">Description</Label>
              <Textarea id="body" placeholder="Describe the issue in detail…" rows={5} value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
            </div>
            {formError && <p className="text-sm text-red-600 animate-fade-in">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full">Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="rounded-full font-semibold">
                {createMutation.isPending ? 'Creating…' : 'Create Ticket'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Date filter dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
              <CalendarDays className="w-4 h-4 text-blue-500" />
              Date Filters
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(({ label, key }) => (
                  <button key={key} onClick={() => applyPreset(key)}
                    className={`text-sm px-3 py-1.5 rounded-full border font-semibold transition-all duration-150 ${
                      activePreset === key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >{label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Custom Range</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">From</p>
                  <input type="date" value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setActivePreset(''); resetPage(); }}
                    className="w-full text-sm h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">To</p>
                  <input type="date" value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setActivePreset(''); resetPage(); }}
                    className="w-full text-sm h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { clearDates(); setFilterOpen(false); }} className="rounded-full">Clear</Button>
            <Button onClick={() => setFilterOpen(false)} className="rounded-full font-semibold">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search tickets by subject, name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="pl-9 rounded-lg border-slate-200 focus:border-blue-400"
          />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className={`relative flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-150 shrink-0 ${
            dateFrom || dateTo
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
              : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 bg-white'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {(dateFrom || dateTo) && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-white" />
          )}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Ass. to</span>
          <Select value={assignedToId || 'all'} onValueChange={(v) => { setAssignedToId(v === 'all' ? '' : v); resetPage(); }}>
            <SelectTrigger className="w-36 rounded-lg border-slate-200 h-9">
              <SelectValue placeholder="Anyone" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Anyone</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={status || 'all'} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); resetPage(); }}>
          <SelectTrigger className="w-36 rounded-lg border-slate-200">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Statuses</SelectItem>
            {TICKET_STATUSES.map((s) => <SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={category || 'all'} onValueChange={(v) => { setCategory(v === 'all' ? '' : v); resetPage(); }}>
          <SelectTrigger className="w-40 rounded-lg border-slate-200">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Categories</SelectItem>
            {TICKET_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{formatCategory(c)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => { setSort(v); resetPage(); }}>
          <SelectTrigger className="w-44 rounded-lg border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <Inbox className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-base font-bold text-slate-700">No tickets found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or create a new ticket</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50/60">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-4" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</span>
          </div>

          {tickets.map((ticket, i) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-blue-50/40 transition-colors duration-150 group ${
                i < tickets.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              {/* Status dot */}
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                ticket.status === 'NEW' ? 'bg-blue-400' :
                ticket.status === 'PROCESSING' ? 'bg-amber-400' :
                ticket.status === 'OPEN' ? 'bg-rose-400' :
                ticket.status === 'RESOLVED' ? 'bg-emerald-400' : 'bg-slate-300'
              }`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors duration-150">
                    {ticket.subject}
                  </span>
                  {ticket.aiResolved && (
                    <Badge className="text-[10px] px-2 py-0 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold flex items-center gap-0.5">
                      <Bot className="w-2.5 h-2.5" /> Auto-resolved
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 truncate">
                    {ticket.fromName} · {ticket.fromEmail}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400 shrink-0">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {ticket.summary && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">{ticket.summary}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {ticket.team && (
                  <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    {ticket.team.name}
                  </span>
                )}
                {ticket.assignedTo && (
                  <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                    <UserCircle className="w-3.5 h-3.5" />
                    {ticket.assignedTo.name}
                  </span>
                )}
                <CategoryBadge category={ticket.category} />
                <StatusBadge status={ticket.status} />
                {ticket._count && (
                  <span className="text-xs text-slate-400 w-16 text-right">
                    {ticket._count.replies} {ticket._count.replies === 1 ? 'reply' : 'replies'}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-1">
            {[
              { label: '«', action: () => setPage(1), disabled: page === 1 },
              { label: '‹', action: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1 },
            ].map(({ label, action, disabled }) => (
              <button key={label} onClick={action} disabled={disabled}
                className="w-8 h-8 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 bg-white">
                {label}
              </button>
            ))}
            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="w-8 text-center text-sm text-slate-400">…</span>
              ) : (
                <button key={p} onClick={() => setPage(p as number)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    p === page
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 border border-blue-600'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >{p}</button>
              )
            )}
            {[
              { label: '›', action: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page === totalPages },
              { label: '»', action: () => setPage(totalPages), disabled: page === totalPages },
            ].map(({ label, action, disabled }) => (
              <button key={label} onClick={action} disabled={disabled}
                className="w-8 h-8 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 bg-white">
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total} tickets
          </p>
        </div>
      )}
    </div>
  );
}
