import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Clock, CheckCircle2, XCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';

const statConfig = [
  {
    label: 'Total Tickets',
    key: 'total' as const,
    link: '/tickets',
    icon: BarChart3,
    iconBg: '#fff3cd',
    iconColor: '#d97706',
    numColor: '#92400e',
    cardBorder: '#fcd34d',
    cardBg: '#fffbeb',
  },
  {
    label: 'Open',
    key: 'open' as const,
    link: '/tickets?status=OPEN',
    icon: Clock,
    iconBg: '#fce7f3',
    iconColor: '#db2777',
    numColor: '#831843',
    cardBorder: '#f9a8d4',
    cardBg: '#fdf2f8',
  },
  {
    label: 'Resolved',
    key: 'resolved' as const,
    link: '/tickets?status=RESOLVED',
    icon: CheckCircle2,
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    numColor: '#14532d',
    cardBorder: '#86efac',
    cardBg: '#f0fdf4',
  },
  {
    label: 'Closed',
    key: 'closed' as const,
    link: '/tickets?status=CLOSED',
    icon: XCircle,
    iconBg: '#e0e7ff',
    iconColor: '#4f46e5',
    numColor: '#3730a3',
    cardBorder: '#c7d2fe',
    cardBg: '#eef2ff',
  },
];

const cardShadow = '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)';
const cardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: cardShadow,
};

export default function Dashboard() {
  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ['tickets', 'stats'],
    queryFn: () => api.tickets.stats(),
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-7 w-48 rounded-lg animate-pulse" style={{ backgroundColor: '#e2e8f0' }} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl animate-pulse" style={{ backgroundColor: '#f1f5f9' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>Overview of your support operations</p>
        </div>
        <div
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg"
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e3a8a',
          }}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Live data
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {statConfig.map(({ label, key, link, icon: Icon, iconBg, iconColor, numColor, cardBorder, cardBg }) => (
          <Link key={key} to={link}>
            <div
              className="rounded-xl p-5 cursor-pointer transition-all duration-200"
              style={{ backgroundColor: cardBg, border: `1.5px solid ${cardBorder}`, boxShadow: cardShadow }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = '0 4px 14px rgba(30,58,138,0.10), 0 12px 32px rgba(30,58,138,0.12)';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = cardShadow;
                el.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{label}</p>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: numColor }}>{stats[key]}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">

        {/* By Category — Bar Chart */}
        <div className="rounded-xl p-6" style={cardStyle}>
          <h2 className="text-sm font-semibold mb-6 uppercase tracking-wider" style={{ color: '#94a3b8' }}>
            Tickets by Category
          </h2>
          {stats.byCategory.length === 0 ? (
            <p className="text-sm" style={{ color: '#94a3b8' }}>No data yet.</p>
          ) : (() => {
            const maxCount = Math.max(...stats.byCategory.map((c) => c._count.id));
            const BAR_HEIGHT = 140;
            const categoryMeta: Record<string, { label: string; gradient: string; labelColor: string }> = {
              GENERAL_QUESTION:   { label: 'General',   gradient: 'linear-gradient(180deg, #38bdf8 0%, #1e3a8a 100%)', labelColor: '#0369a1' },
              TECHNICAL_QUESTION: { label: 'Technical', gradient: 'linear-gradient(180deg, #a78bfa 0%, #5b21b6 100%)', labelColor: '#6d28d9' },
              REFUND_REQUEST:     { label: 'Refund',    gradient: 'linear-gradient(180deg, #fbbf24 0%, #b45309 100%)', labelColor: '#b45309' },
            };
            return (
              <div className="flex items-end justify-around gap-3" style={{ height: BAR_HEIGHT + 56 }}>
                {stats.byCategory.map((c) => {
                  const meta = categoryMeta[c.category] ?? categoryMeta.GENERAL_QUESTION;
                  const barH = maxCount > 0 ? Math.max(8, Math.round((c._count.id / maxCount) * BAR_HEIGHT)) : 8;
                  return (
                    <div key={c.category} className="flex flex-col items-center gap-1.5 flex-1">
                      {/* count label */}
                      <span className="text-sm font-bold" style={{ color: '#1e293b' }}>{c._count.id}</span>
                      {/* bar wrapper — pushes bar to bottom */}
                      <div className="flex items-end w-full" style={{ height: BAR_HEIGHT }}>
                        <div
                          className="w-full rounded-t-lg transition-all duration-700"
                          style={{ height: barH, background: meta.gradient, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                        />
                      </div>
                      {/* category label */}
                      <span className="text-xs font-semibold text-center leading-tight" style={{ color: meta.labelColor }}>
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Recent Tickets */}
        <div className="rounded-xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
              Recent Tickets
            </h2>
            <Link
              to="/tickets"
              className="text-xs font-semibold flex items-center gap-1 transition-colors duration-200"
              style={{ color: '#1e3a8a' }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-0.5 -mx-2">
            {stats.recent.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#eff6ff'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'; }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: '#0f172a' }}>
                    {ticket.subject}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#94a3b8' }}>
                    {ticket.fromName} · {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={ticket.status} />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
