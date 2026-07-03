
# AI-Powered Ticket Management System

## Problem

We receive hundreds of support emails daily. Our agents manually read, classify, and respond to each ticket — which is slow and leads to impersonal, canned responses.

## Solution

Build a ticket management system that uses AI to automatically classify, respond to, and route support tickets — delivering faster, more personalized responses to students while freeing up agents for complex issues.

## Features

- Receive support emails and create tickets
- Auto-generate human-friendly responses using a knowledge base
- Ticket list with filtering and sorting
- Ticket detail view
- AI-powered ticket classification 
- AI summaries
- AI-suggested replies
- User management (admin only)
- Dashboard to view and manage all tickets

## Ticket Statuses

- Open
- Resolved
- Closed

## Ticket Categories

- General Question
- Technical Question
- Refund Request

## User Roles

- **Admin**: Deployed with the system. Can create and manage agents.
- **Agent**: Created by admin. Can view and manage tickets.

## Technical Stack

### HTTP Client — Axios
- All API requests must use **Axios** via a shared client instance (`frontend/src/lib/api.ts`).
- The client is pre-configured with `baseURL: '/api'` and a request interceptor that attaches the Bearer token from `localStorage`.
- A response interceptor unwraps `res.data` on success and normalises error messages on failure.
- Do not use `fetch` directly anywhere in the frontend.

### Authentication — Better Auth
- Authentication is handled by **better-auth** on the backend (`backend/src/index.ts`).
- The frontend obtains a JWT token via `POST /api/auth/login` and stores it in `localStorage`.
- The `useAuth` hook (`frontend/src/hooks/useAuth.ts`) is the single source of truth for the current user — always use it instead of reading from localStorage directly.
- Session state is derived from `GET /api/auth/me`; redirect to `/login` on 401.

### Server State — TanStack Query (React Query)
- All server state must be managed with **TanStack Query** (`@tanstack/react-query`).
- A single `QueryClient` is created in `frontend/src/main.tsx` and provided via `QueryClientProvider` wrapping the whole app.
- **Do not** use `useEffect` + `useState` to load remote data — use `useQuery` instead.
- **Do not** call mutating API methods directly from event handlers — use `useMutation` instead.
- After a successful mutation, invalidate the relevant query key(s) with `queryClient.invalidateQueries(...)` to keep the cache fresh.
- Query key conventions:
  - `['tickets', params]` — paginated/filtered ticket list
  - `['tickets', 'stats']` — dashboard statistics
  - `['ticket', id]` — single ticket detail
  - `['users']` — user list
