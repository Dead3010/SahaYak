import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Inbox, Users, LogOut, Headphones, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tickets', label: 'Tickets', icon: Inbox, end: false },
];

const adminItems = [
  { to: '/users', label: 'Users', icon: Users, end: false },
  { to: '/email-setup', label: 'Email Setup', icon: Mail, end: false },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm transition-all duration-200',
      isActive ? 'nav-link-active' : 'nav-link-idle'
    );

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 h-16 flex items-center px-6 gap-6"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0 mr-2">
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

      {/* Main nav */}
      <nav className="flex items-center gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Admin nav */}
      {user?.role === 'ADMIN' && (
        <>
          <div className="h-5 w-px shrink-0" style={{ backgroundColor: '#e2e8f0' }} />
          <nav className="flex items-center gap-1">
            {adminItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </>
      )}

      {/* Right: user + logout */}
      <div className="ml-auto flex items-center gap-2">
        {/* User pill */}
        <div
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg cursor-default"
          style={{
            backgroundColor: '#eff6ff',
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
          <div className="hidden sm:block leading-none">
            <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{user?.name}</p>
            <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: '#64748b' }}>{user?.role}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{ color: '#64748b' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fef2f2';
            (e.currentTarget as HTMLButtonElement).style.color = '#dc2626';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
          }}
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
