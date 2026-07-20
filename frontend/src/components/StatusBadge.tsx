import { TicketStatus, TicketCategory, TicketPriority, Product } from '../types';
import { formatStatus } from '@/lib/constants';

export function StatusBadge({ status }: { status: TicketStatus }) {
  const colors: Record<TicketStatus, string> = {
    NEW:        '#1e40af',
    PROCESSING: '#92400e',
    OPEN:       '#9d174d',
    RESOLVED:   '#065f46',
    CLOSED:     '#3730a3',
  };
  return (
    <span className="text-sm font-semibold" style={{ color: colors[status] }}>
      {formatStatus(status)}
    </span>
  );
}

export function PriorityBadge({ priority, compact = false }: { priority: TicketPriority; compact?: boolean }) {
  const icons: Record<TicketPriority, string> = {
    URGENT: '🔴',
    HIGH:   '🟠',
    MEDIUM: '🟡',
    LOW:    '⚪',
  };
  const labels: Record<TicketPriority, string> = {
    URGENT: 'Urgent',
    HIGH:   'High',
    MEDIUM: 'Medium',
    LOW:    'Low',
  };
  const colors: Record<TicketPriority, string> = {
    URGENT: '#991b1b',
    HIGH:   '#9a3412',
    MEDIUM: '#854d0e',
    LOW:    '#475569',
  };

  if (compact) {
    return (
      <span className="text-xs leading-none" title={labels[priority]}>
        {icons[priority]}
      </span>
    );
  }

  return (
    <span className="text-sm font-semibold" style={{ color: colors[priority] }} title={labels[priority]}>
      {`${icons[priority]} ${labels[priority]}`}
    </span>
  );
}

export function CategoryBadge({ category }: { category: TicketCategory }) {
  const colors: Record<TicketCategory, string> = {
    GENERAL_QUESTION:   '#1e40af',
    TECHNICAL_QUESTION: '#5b21b6',
    REFUND_REQUEST:     '#9d174d',
  };
  const labels: Record<TicketCategory, string> = {
    GENERAL_QUESTION:   'General',
    TECHNICAL_QUESTION: 'Technical',
    REFUND_REQUEST:     'Refund',
  };
  return (
    <span className="text-sm font-semibold" style={{ color: colors[category] }}>
      {labels[category]}
    </span>
  );
}

export function ProductBadge({ product }: { product: Product }) {
  const meta: Record<Product, { label: string; bg: string; text: string; border: string }> = {
    SAHAYAK: { label: 'SahaYak',  bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
    SANGAM:  { label: 'Sangam',   bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    SANCHAY: { label: 'Sanchay',  bg: '#faf5ff', text: '#6b21a8', border: '#e9d5ff' },
    SUGAM:   { label: 'Sugam',    bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
    SYNAPSE: { label: 'Synapse',  bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
  };
  const m = meta[product];
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
      style={{ backgroundColor: m.bg, color: m.text, borderColor: m.border }}
    >
      {m.label}
    </span>
  );
}
