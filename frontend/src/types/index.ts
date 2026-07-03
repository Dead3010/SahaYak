export type Role = 'ADMIN' | 'AGENT';
export type TicketStatus = 'NEW' | 'PROCESSING' | 'OPEN' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'GENERAL_QUESTION' | 'TECHNICAL_QUESTION' | 'REFUND_REQUEST';
export type TicketSource = 'EMAIL' | 'MANUAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Reply {
  id: string;
  body: string;
  isAI: boolean;
  sentViaEmail: boolean;
  createdAt: string;
  author: { id: string; name: string } | null;
}

export interface Ticket {
  id: string;
  subject: string;
  body: string;
  status: TicketStatus;
  category: TicketCategory;
  fromEmail: string;
  fromName: string;
  summary: string | null;
  suggestedReply: string | null;
  aiClassified: boolean;
  source: TicketSource;
  assignedTo: { id: string; name: string; email: string } | null;
  replies?: Reply[];
  _count?: { replies: number };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  total: number;
  new: number;
  processing: number;
  open: number;
  resolved: number;
  closed: number;
  byCategory: Array<{ category: TicketCategory; _count: { id: number } }>;
  recent: Ticket[];
}
