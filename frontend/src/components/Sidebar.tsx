import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Headphones, Mail, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', initials: 'Da', color: '#1e3a8a', bg: '#dbeafe', end: true },
  { to: '/tickets',   label: 'Tickets',   initials: 'Ti', color: '#0f766e', bg: '#ccfbf1', end: false },
];

const adminNavItems = [
  { to: '/users', label: 'Users', initials: 'Us', color: '#c2410c', bg: '#ffedd5', end: false },
  { to: '/teams', label: 'Teams', initials: 'Te', color: '#6d28d9', bg: '#ede9fe', end: false },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { setDropdownOpen(false); logout(); navigate('/login'); };
  const handleEmailSetup = () => { setDropdownOpen(false); navigate('/email-setup'); };

  const allItems = [...navItems, ...(user?.role === 'ADMIN' ? adminNavItems : [])];

  return (
    <>
      {/* ── Top bar ── */}
      <header
        className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-5"
        style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', boxShadow: '0 2px 6px rgba(30,58,138,0.30)' }}
          >
            <Headphones className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>SahaYak AI</span>
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
              <div style={{ borderTop: user?.role === 'ADMIN' ? '1px solid #f1f5f9' : undefined }}>
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
      </header>

      {/* ── Left sidebar ── */}
      <aside
        className="fixed top-14 left-0 z-40 w-52 h-[calc(100vh-3.5rem)] flex flex-col"
        style={{ backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0' }}
      >
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {allItems.map(({ to, label, initials, color, bg, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
