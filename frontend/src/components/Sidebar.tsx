import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Inbox, Users, LogOut, Headphones, Mail, UsersRound, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tickets', label: 'Tickets', icon: Inbox, end: false },
];

const adminNavItems = [
  { to: '/users', label: 'Users', icon: Users, end: false },
  { to: '/teams', label: 'Teams', icon: UsersRound, end: false },
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

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleEmailSetup = () => {
    setDropdownOpen(false);
    navigate('/email-setup');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm transition-all duration-200',
      isActive ? 'nav-link-active' : 'nav-link-idle'
    );

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 h-16 flex items-center px-6 gap-4"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
            boxShadow: '0 2px 8px rgba(30,58,138,0.30)',
          }}
        >
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <span
          className="font-bold tracking-tight text-lg"
          style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}
        >
          SahaYak AI
        </span>
      </div>

      {/* Divider */}
      <div className="h-5 w-px shrink-0" style={{ backgroundColor: '#e2e8f0' }} />

      {/* Left nav: all nav items together */}
      <nav className="flex items-center gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
        {user?.role === 'ADMIN' &&
          adminNavItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
      </nav>

      {/* Right: user dropdown */}
      <div className="ml-auto" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: dropdownOpen ? '#e0eaff' : '#eff6ff',
            border: '1px solid #bfdbfe',
          }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}
          >
            <span className="text-[10px] font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block leading-none text-left">
            <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{user?.name}</p>
            <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: '#64748b' }}>{user?.role}</p>
          </div>
          <ChevronDown
            className="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
            style={{ color: '#64748b', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div
            className="absolute right-4 mt-2 w-48 rounded-xl overflow-hidden animate-fade-in"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
              top: '3.75rem',
            }}
          >
            {user?.role === 'ADMIN' && (
              <button
                onClick={handleEmailSetup}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors duration-150 text-left"
                style={{ color: '#374151' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f1f5f9'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
              >
                <Mail className="w-4 h-4 shrink-0" style={{ color: '#64748b' }} />
                Email Setup
              </button>
            )}
            <div style={{ borderTop: user?.role === 'ADMIN' ? '1px solid #f1f5f9' : undefined }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors duration-150 text-left"
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
  );
}
