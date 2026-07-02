import type { TicketStatus, TicketCategory } from '../types';

export const TICKET_STATUSES: TicketStatus[] = ['NEW', 'PROCESSING', 'OPEN', 'RESOLVED', 'CLOSED'];
export const TICKET_CATEGORIES: TicketCategory[] = ['GENERAL_QUESTION', 'TECHNICAL_QUESTION', 'REFUND_REQUEST'];

export const formatStatus = (s: TicketStatus): string =>
  s.charAt(0) + s.slice(1).toLowerCase();

export const formatCategory = (c: TicketCategory): string =>
  c.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
