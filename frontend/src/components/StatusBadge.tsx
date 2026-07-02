import { Badge } from '@/components/ui/badge';
import { TicketStatus, TicketCategory } from '../types';
import { cn } from '@/lib/utils';
import { formatStatus } from '@/lib/constants';

export function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, string> = {
    NEW:        'border font-semibold',
    PROCESSING: 'border font-semibold',
    OPEN:       'border font-semibold',
    RESOLVED:   'border font-semibold',
    CLOSED:     'border font-semibold',
  };
  const inlineStyles: Record<TicketStatus, React.CSSProperties> = {
    NEW:        { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' },
    PROCESSING: { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' },
    OPEN:       { backgroundColor: '#fce7f3', color: '#9d174d', borderColor: '#fbcfe8' },
    RESOLVED:   { backgroundColor: '#ccfbf1', color: '#065f46', borderColor: '#99f6e4' },
    CLOSED:     { backgroundColor: '#e0e7ff', color: '#3730a3', borderColor: '#c7d2fe' },
  };
  return (
    <Badge
      className={cn('text-xs px-3 py-0.5 rounded-full transition-colors duration-300', styles[status])}
      style={inlineStyles[status]}
    >
      {formatStatus(status)}
    </Badge>
  );
}

export function CategoryBadge({ category }: { category: TicketCategory }) {
  const inlineStyles: Record<TicketCategory, React.CSSProperties> = {
    GENERAL_QUESTION:   { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' },
    TECHNICAL_QUESTION: { backgroundColor: '#ede9fe', color: '#5b21b6', borderColor: '#ddd6fe' },
    REFUND_REQUEST:     { backgroundColor: '#fce7f3', color: '#9d174d', borderColor: '#fbcfe8' },
  };
  const labels: Record<TicketCategory, string> = {
    GENERAL_QUESTION:   'General',
    TECHNICAL_QUESTION: 'Technical',
    REFUND_REQUEST:     'Refund',
  };
  return (
    <Badge
      className="text-xs px-3 py-0.5 rounded-full border font-semibold transition-colors duration-300"
      style={inlineStyles[category]}
    >
      {labels[category]}
    </Badge>
  );
}
