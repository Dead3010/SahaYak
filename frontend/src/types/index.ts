export type Role = 'ADMIN' | 'AGENT';
export type TicketStatus = 'NEW' | 'PROCESSING' | 'OPEN' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'GENERAL_QUESTION' | 'TECHNICAL_QUESTION' | 'REFUND_REQUEST';
export type TicketSource = 'EMAIL' | 'MANUAL' | 'WHATSAPP';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Product = 'SAHAYAK' | 'SANGAM' | 'SANCHAY' | 'SUGAM' | 'SYNAPSE';

export interface Team {
  id: string;
  name: string;
  category: TicketCategory;
  product: Product;
  members: { id: string; name: string; email: string; role: Role }[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string | null;
  teamId: string | null;
  createdAt: string;
}

export interface Reply {
  id: string;
  body: string;
  isAI: boolean;
  isInternal: boolean;
  sentViaEmail: boolean;
  sentViaWhatsApp: boolean;
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
  aiResolved: boolean;
  source: TicketSource;
  priority: TicketPriority;
  fromPhone: string | null;
  product: Product | null;
  detectedLanguage: string | null;
  detectedLanguageName: string | null;
  translatedSubject: string | null;
  translatedBody: string | null;
  assignedTo: { id: string; name: string; email: string } | null;
  teamId: string | null;
  team: { id: string; name: string } | null;
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
  aiResolved: number;
  aiReplies: number;
  aiResolutionRate: number;
}
