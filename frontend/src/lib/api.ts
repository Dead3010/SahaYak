import axios from 'axios';

const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(new Error(err.response?.data?.error || err.message || 'Request failed'))
);

const request = <T>(method: string, path: string, data?: unknown): Promise<T> =>
  client.request<T, T>({ method, url: path, data });

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: import('../types').User }>('POST', '/auth/login', { email, password }),
    me: () => request<{ user: import('../types').User }>('GET', '/auth/me'),
  },

  tickets: {
    list: (params: Record<string, string> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request<{
        tickets: import('../types').Ticket[];
        total: number;
        page: number;
        totalPages: number;
      }>('GET', `/tickets${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => request<{ ticket: import('../types').Ticket }>('GET', `/tickets/${id}`),
    create: (data: { subject: string; body: string; fromEmail: string; fromName: string }) =>
      request<{ ticket: import('../types').Ticket }>('POST', '/tickets', data),
    update: (id: string, data: Partial<{ status: string; category: string; assignedToId: string | null; priority: string }>) =>
      request<{ ticket: import('../types').Ticket }>('PATCH', `/tickets/${id}`, data),
    classify: (id: string) =>
      request<{ ticket: import('../types').Ticket; category: string }>('POST', `/tickets/${id}/classify`),
    summarize: (id: string) =>
      request<{ ticket: import('../types').Ticket; summary: string }>('POST', `/tickets/${id}/summarize`),
    suggestReply: (id: string) =>
      request<{ ticket: import('../types').Ticket; suggestedReply: string }>('POST', `/tickets/${id}/suggest-reply`),
    prioritize: (id: string) =>
      request<{ ticket: import('../types').Ticket; priority: string }>('POST', `/tickets/${id}/prioritize`),
    detectLanguage: (id: string) =>
      request<{ ticket: import('../types').Ticket }>('POST', `/tickets/${id}/detect-language`),
    delete: (id: string) => request<{ message: string }>('DELETE', `/tickets/${id}`),
    addReply: (id: string, body: string, sendEmail: boolean) =>
      request<{ reply: import('../types').Reply }>('POST', `/tickets/${id}/replies`, { body, sendEmail }),
    addComment: (id: string, body: string) =>
      request<{ comment: import('../types').Reply }>('POST', `/tickets/${id}/comments`, { body }),
    stats: () => request<import('../types').DashboardStats>('GET', '/tickets/stats'),
  },

  settings: {
    get: () => request<{ supportEmail: string; webhookPath: string }>('GET', '/settings'),
    demoInquiry: (data: { name: string; contact: string; email: string; org: string; interest: string }) =>
      request<{ ok: boolean }>('POST', '/settings/demo-inquiry', data),
    reportIssue: (data: { name: string; email: string; message: string }) =>
      request<{ ok: boolean }>('POST', '/settings/report-issue', data),
    reportBug: (data: { name: string; email: string; description: string; area?: string }) =>
      request<{ ok: boolean }>('POST', '/settings/report-bug', data),
  },

  teams: {
    list: () => request<{ teams: import('../types').Team[] }>('GET', '/teams'),
    create: (data: { name: string; category: string }) => request<{ team: import('../types').Team }>('POST', '/teams', data),
    update: (id: string, data: { name: string }) => request<{ team: import('../types').Team }>('PATCH', `/teams/${id}`, data),
    delete: (id: string) => request<{ message: string }>('DELETE', `/teams/${id}`),
    addMember: (teamId: string, userId: string) => request<{ team: import('../types').Team }>('POST', `/teams/${teamId}/members`, { userId }),
    removeMember: (teamId: string, userId: string) => request<{ team: import('../types').Team }>('DELETE', `/teams/${teamId}/members/${userId}`),
  },

  users: {
    list: () => request<{ users: import('../types').User[] }>('GET', '/users'),
    create: (data: { email: string; password: string; name: string; role: string }) =>
      request<{ user: import('../types').User }>('POST', '/users', data),
    update: (id: string, data: Partial<{ name: string; email: string; role: string; password: string; phone: string }>) =>
      request<{ user: import('../types').User }>('PATCH', `/users/${id}`, data),
    delete: (id: string) => request<{ message: string }>('DELETE', `/users/${id}`),
  },

  chat: {
    send: (message: string, history: Array<{ role: string; parts: string }>) =>
      request<{ reply: string }>('POST', '/chat', { message, history }),
  },
};
