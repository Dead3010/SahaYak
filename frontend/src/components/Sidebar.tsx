import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Headphones, Mail, LogOut, ChevronDown, HeadphonesIcon, Phone, Bug, CheckCircle2, Bell, Ticket, X, Check, CheckCheck, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SUPPORT_CONTACT = {
  name: 'Yash Mishra',
  role: 'Founder & Developer',
  email: 'yashmishra3010@gmail.com',
  phone: '+91 7575856512',
};

const navItems = [
  { to: '/dashboard', label: 'Dashboard', initials: 'Da', color: '#1e3a8a', bg: '#dbeafe', end: true },
  { to: '/tickets',   label: 'Tickets',   initials: 'Ti', color: '#0f766e', bg: '#ccfbf1', end: false },
];

const adminNavItems = [
  { to: '/users', label: 'Users', initials: 'Us', color: '#c2410c', bg: '#ffedd5', end: false },
  { to: '/teams', label: 'Teams', initials: 'Te', color: '#6d28d9', bg: '#ede9fe', end: false },
];

export default function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const { data: newTickets } = useQuery({
    queryKey: ['tickets-new-notif'],
    queryFn: () => api.tickets.list({ status: 'NEW', limit: '10', sortBy: 'createdAt', sortOrder: 'desc' }),
    refetchInterval: 15000,
  });

  const [readIds, setReadIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('bell_read_ids') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('bell_read_ids', JSON.stringify(readIds));
  }, [readIds]);

  const displayedTickets = (newTickets?.tickets ?? []).filter((t) => !readIds.includes(t.id));
  const unreadCount = displayedTickets.length;

  const markAsRead = (id: string) => setReadIds((prev) => prev.includes(id) ? prev : [...prev, id]);
  const markAllAsRead = () => setReadIds((prev) => [...new Set([...prev, ...(newTickets?.tickets ?? []).map((t) => t.id)])]);

  const prevCountRef = useRef<number | null>(null);
  const [toastTicket, setToastTicket] = useState<{ subject: string; fromName: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (newTickets === undefined) return;
    const current = newTickets.total;
    if (prevCountRef.current !== null && current > prevCountRef.current) {
      const newest = newTickets.tickets[0];
      setToastTicket({ subject: newest?.subject ?? 'New Ticket', fromName: newest?.fromName ?? '' });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToastTicket(null), 6000);
    }
    prevCountRef.current = current;
  }, [newTickets]);
  const [contactOpen, setContactOpen] = useState(false);
  const [bugOpen, setBugOpen] = useState(false);
  const [bugForm, setBugForm] = useState({ name: '', email: '', area: '', description: '', product: '' });
  const [bugLoading, setBugLoading] = useState(false);
  const [bugSuccess, setBugSuccess] = useState(false);
  const [bugError, setBugError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { setDropdownOpen(false); logout(); navigate('/login'); };
  const handleEmailSetup = () => { setDropdownOpen(false); navigate('/email-setup'); };
  const handleContactSupport = () => { setDropdownOpen(false); setContactOpen(true); };
  const handleReportBug = () => { setDropdownOpen(false); setBugOpen(true); };

  const closeBug = () => {
    setBugOpen(false);
    setBugSuccess(false);
    setBugError('');
    setBugForm({ name: '', email: '', area: '', description: '', product: '' });
  };

  const handleBugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBugLoading(true);
    setBugError('');
    try {
      await api.settings.reportBug({
        name: bugForm.name,
        email: bugForm.email,
        description: bugForm.description,
        area: bugForm.area || undefined,
        product: bugForm.product || undefined,
      });
      setBugSuccess(true);
    } catch {
      setBugError('Failed to send. Please try again.');
    } finally {
      setBugLoading(false);
    }
  };

  const allItems = [...navItems, ...(user?.role === 'ADMIN' ? adminNavItems : [])];

  return (
    <>
      {/* ── Top bar ── */}
      <header
        className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-5"
        style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        {/* Logo + hamburger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg shrink-0"
            style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
          >
            <Menu className="w-4 h-4" style={{ color: '#1e3a8a' }} />
          </button>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', boxShadow: '0 2px 6px rgba(30,58,138,0.30)' }}
          >
            <Headphones className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>SahaYak AI</span>
        </div>

        {/* Notification Bell + User pill */}
        <div className="flex items-center gap-2">
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((o) => !o)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150"
            style={{ backgroundColor: bellOpen ? '#e0eaff' : '#eff6ff', border: '1px solid #bfdbfe' }}
          >
            <Bell className="w-4 h-4" style={{ color: '#1e3a8a' }} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: '#ef4444' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div
              className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl overflow-hidden"
              style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 60 }}
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">New Tickets</span>
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>{unreadCount} unread</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors duration-150"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
              {displayedTickets.length > 0 ? (
                <div className="max-h-72 overflow-y-auto">
                  {displayedTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center border-b border-slate-50 hover:bg-blue-50/40 transition-colors duration-150 group">
                      <button
                        onClick={() => { markAsRead(ticket.id); setBellOpen(false); navigate(`/tickets/${ticket.id}`); }}
                        className="flex-1 text-left px-4 py-3 min-w-0"
                      >
                        <p className="text-sm font-semibold text-slate-800 truncate">{ticket.subject}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{ticket.fromName} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(ticket.id); }}
                        title="Mark as read"
                        className="shrink-0 mr-3 w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-emerald-100 transition-all duration-150"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-slate-400">No new tickets 🎉</div>
              )}
            </div>
          )}
        </div>

        {/* User pill + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-150"
            style={{ backgroundColor: dropdownOpen ? '#e0eaff' : '#eff6ff', border: '1px solid #bfdbfe' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}
            >
              <span className="text-[11px] font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="leading-none text-left">
              <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{user?.name}</p>
              <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: '#64748b' }}>{user?.role}</p>
            </div>
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-200"
              style={{ color: '#94a3b8', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden"
              style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 60 }}
            >
              {user?.role === 'ADMIN' && (
                <button
                  onClick={handleEmailSetup}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-colors duration-150"
                  style={{ color: '#374151' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                >
                  <Mail className="w-4 h-4 shrink-0" style={{ color: '#64748b' }} />
                  Email Setup
                </button>
              )}
              <div style={{ borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={handleContactSupport}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-colors duration-150"
                  style={{ color: '#374151' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                >
                  <HeadphonesIcon className="w-4 h-4 shrink-0" style={{ color: '#64748b' }} />
                  Contact Support
                </button>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={handleReportBug}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-colors duration-150"
                  style={{ color: '#dc2626' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fef2f2'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                >
                  <Bug className="w-4 h-4 shrink-0" />
                  Report Bug
                </button>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-colors duration-150"
                  style={{ color: '#dc2626' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fef2f2'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </header>

      {/* ── Contact Support dialog ── */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold flex items-center gap-2">
              <HeadphonesIcon className="w-4 h-4 text-blue-600" />
              Contact Support
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}
            >
              {SUPPORT_CONTACT.name.charAt(0)}
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-900">{SUPPORT_CONTACT.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{SUPPORT_CONTACT.role}</p>
            </div>
            {/* Contact details */}
            <div className="w-full space-y-2.5 mt-1">
              <a
                href={`mailto:${SUPPORT_CONTACT.email}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150"
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#bfdbfe'; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#eff6ff'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#f8fafc'; }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#dbeafe' }}>
                  <Mail className="w-4 h-4" style={{ color: '#1e3a8a' }} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Email</p>
                  <p className="text-sm font-semibold text-slate-800">{SUPPORT_CONTACT.email}</p>
                </div>
              </a>
              <a
                href={`tel:${SUPPORT_CONTACT.phone}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150"
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#bfdbfe'; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#eff6ff'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#f8fafc'; }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#dcfce7' }}>
                  <Phone className="w-4 h-4" style={{ color: '#15803d' }} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Phone</p>
                  <p className="text-sm font-semibold text-slate-800">{SUPPORT_CONTACT.phone}</p>
                </div>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Bug Report dialog ── */}
      <Dialog open={bugOpen} onOpenChange={(o) => { if (!o) closeBug(); }}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-500" />
              Report a Bug
            </DialogTitle>
          </DialogHeader>

          {bugSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-800">Bug report sent!</p>
              <p className="text-xs text-slate-500">We'll look into it and get back to you.</p>
              <Button onClick={closeBug} className="mt-2 rounded-full font-semibold px-6">Done</Button>
            </div>
          ) : (
            <form onSubmit={handleBugSubmit} className="space-y-3 py-1">
              {bugError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{bugError}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sb-name" className="text-xs font-semibold text-slate-600">Your Name</Label>
                  <Input id="sb-name" placeholder="John Doe" value={bugForm.name}
                    onChange={(e) => setBugForm((f) => ({ ...f, name: e.target.value }))} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sb-email" className="text-xs font-semibold text-slate-600">Email</Label>
                  <Input id="sb-email" type="email" placeholder="you@email.com" value={bugForm.email}
                    onChange={(e) => setBugForm((f) => ({ ...f, email: e.target.value }))} className="h-9 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sb-desc" className="text-xs font-semibold text-slate-600">Bug Description <span className="text-red-400">*</span></Label>
                <Textarea id="sb-desc" rows={3}
                  placeholder="What went wrong? e.g. 'Clicking Save on a ticket throws a 500 error.'"
                  value={bugForm.description}
                  onChange={(e) => setBugForm((f) => ({ ...f, description: e.target.value }))}
                  className="resize-none text-sm rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">
                  Product <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <Select value={bugForm.product} onValueChange={(v) => setBugForm((f) => ({ ...f, product: v }))}>
                  <SelectTrigger className="h-9 text-sm rounded-xl">
                    <SelectValue placeholder="Which product is affected?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAHAYAK">SahaYak AI</SelectItem>
                    <SelectItem value="SANGAM">Sangam</SelectItem>
                    <SelectItem value="SANCHAY">Sanchay</SelectItem>
                    <SelectItem value="SUGAM">Sugam</SelectItem>
                    <SelectItem value="SYNAPSE">Synapse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">
                  Affected Area <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <Select value={bugForm.area} onValueChange={(v) => setBugForm((f) => ({ ...f, area: v }))}>
                  <SelectTrigger className="h-9 text-sm rounded-xl">
                    <SelectValue placeholder="Where is the issue occurring?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dashboard">Dashboard</SelectItem>
                    <SelectItem value="Tickets">Tickets</SelectItem>
                    <SelectItem value="Ticket Detail">Ticket Detail</SelectItem>
                    <SelectItem value="Users">Users</SelectItem>
                    <SelectItem value="Teams">Teams</SelectItem>
                    <SelectItem value="Email Setup">Email Setup</SelectItem>
                    <SelectItem value="Login / Authentication">Login / Authentication</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-1">
                <Button type="button" variant="outline" onClick={closeBug} className="rounded-full">Cancel</Button>
                <Button type="submit"
                  disabled={bugLoading || !bugForm.name || !bugForm.email || !bugForm.description}
                  className="rounded-full font-semibold bg-red-500 hover:bg-red-600 border-red-500">
                  {bugLoading ? 'Sending…' : 'Send Report'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── New ticket toast popup ── */}
      {toastTicket && (
        <div
          className="fixed bottom-5 right-5 z-[100] flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl animate-fade-in"
          style={{ backgroundColor: '#1e3a8a', border: '1px solid #1d4ed8', minWidth: '260px', maxWidth: '320px' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#ffffff20' }}>
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white uppercase tracking-wide">New Ticket</p>
            <p className="text-sm font-semibold text-blue-100 truncate mt-0.5">{toastTicket.subject}</p>
            {toastTicket.fromName && (
              <p className="text-xs text-blue-300 mt-0.5">from {toastTicket.fromName}</p>
            )}
          </div>
          <button
            onClick={() => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); setToastTicket(null); }}
            className="shrink-0 text-blue-300 hover:text-white transition-colors duration-150 mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Left sidebar ── */}
      <aside
        className={`fixed top-14 left-0 z-40 w-52 h-[calc(100vh-3.5rem)] flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0' }}
      >
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {allItems.map(({ to, label, initials, color, bg, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ backgroundColor: isActive ? color : bg, color: isActive ? '#ffffff' : color }}
                  >
                    {initials}
                  </div>
                  <span style={{ color: isActive ? '#0f172a' : '#475569' }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
