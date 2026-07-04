# In-App Email Support Widget — Full Implementation Plan

## Overview

When a customer is on any page of any of your products, they click a "Report an Issue" button. This opens their email client with a pre-filled email containing structured context (product name, page URL, their email). They write their query and send it. The existing Gmail poller picks it up, parses the structured context, creates the ticket with product/page info attached, and the AI classifies the issue type as normal.

No new API endpoints. No SDK. No authentication changes. The existing email pipeline handles everything.

---

## Email Format Spec

Every support email sent via the widget will have this exact structure:

**Subject:**
```
[ProductName] Issue on /page-path
```
Example: `[SahaYak CRM] Issue on /login`

**Body (pre-filled template customer sees):**
```
------ Support Request ------
Product: SahaYak CRM
Page: /login
User: john@example.com
-----------------------------

Describe your issue below:


```

The customer types their issue below the separator and sends. Everything above the separator is machine-readable metadata. The parser extracts it and strips it from the stored ticket body so agents only see the customer's actual message.

---

## Phase 1 — Database Schema

### File: `backend/prisma/schema.prisma`

Add two nullable fields to the `Ticket` model:

```prisma
productName  String?   // e.g. "SahaYak CRM"
pageContext  String?   // e.g. "/login"
```

Full updated Ticket model (relevant additions only):
```prisma
model Ticket {
  // ... existing fields ...
  productName  String?
  pageContext  String?
  // ... rest of fields ...
}
```

### Migration File

Create: `backend/prisma/migrations/<timestamp>_add_product_context_to_ticket/migration.sql`

```sql
ALTER TABLE "Ticket" ADD COLUMN "productName" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "pageContext"  TEXT;
```

Railway applies this automatically on next deploy via `prisma migrate deploy`.

---

## Phase 2 — Email Parser Utility

### New File: `backend/src/lib/parseEmailContext.ts`

This utility detects whether an incoming email was sent via the support widget and extracts the structured metadata.

```ts
export interface EmailContext {
  productName: string | null;
  pageContext: string | null;
  cleanBody: string;  // email body with the metadata header stripped out
}

const HEADER_REGEX = /------ Support Request ------\nProduct: (.+)\nPage: (.+)\nUser: .+\n-----------------------------\n*/;

export function parseEmailContext(rawBody: string): EmailContext {
  const match = rawBody.match(HEADER_REGEX);

  if (!match) {
    return { productName: null, pageContext: null, cleanBody: rawBody.trim() };
  }

  return {
    productName: match[1].trim(),
    pageContext: match[2].trim(),
    cleanBody: rawBody.replace(HEADER_REGEX, '').trim(),
  };
}
```

Key behavior:
- If the email was NOT sent via the widget (no header block), `productName` and `pageContext` are `null` and `cleanBody` is the original body — no change in behavior for regular emails.
- If the email WAS sent via the widget, metadata is extracted and the body stored in the DB is the clean customer message only (no repeated metadata clutter for agents).

---

## Phase 3 — Gmail Poller Update

### File: `backend/src/services/gmailPoller.ts`

Import the parser and use it when creating a ticket from email.

**Add import:**
```ts
import { parseEmailContext } from '../lib/parseEmailContext';
```

**Update the ticket creation block:**

Before (current):
```ts
const body = parsed.text || ... || '';

if (!fromEmail || !body) continue;

const ticket = await prisma.ticket.create({
  data: { subject, body, fromEmail, fromName, source: 'EMAIL' },
});
```

After:
```ts
const rawBody = parsed.text || ... || '';

if (!fromEmail || !rawBody) continue;

const { productName, pageContext, cleanBody } = parseEmailContext(rawBody);

const ticket = await prisma.ticket.create({
  data: {
    subject,
    body: cleanBody,       // store clean body without metadata header
    fromEmail,
    fromName,
    source: 'EMAIL',
    productName,           // null for regular emails, set for widget emails
    pageContext,           // null for regular emails, set for widget emails
  },
});
```

No other changes to the poller — classification and auto-resolve continue as normal after this.

---

## Phase 4 — Frontend Type Update

### File: `frontend/src/types/index.ts`

Add to the `Ticket` interface:
```ts
productName: string | null;
pageContext: string | null;
```

---

## Phase 5 — Ticket Detail UI

### File: `frontend/src/pages/TicketDetail.tsx`

Add a product context bar inside the header card, shown only when `ticket.productName` is set. Place it between the from/date line and the ticket body.

**Visual design:**
A slim amber/indigo info bar:
```
📦 SahaYak CRM  ·  /login
```

**JSX to add (after the `<p>From...</p>` line):**
```tsx
{ticket.productName && (
  <div className="mt-2 flex items-center gap-3 text-xs">
    <span className="flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
      <Package className="w-3 h-3" />
      {ticket.productName}
    </span>
    {ticket.pageContext && (
      <span className="flex items-center gap-1.5 text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
        {ticket.pageContext}
      </span>
    )}
  </div>
)}
```

Import `Package` from `lucide-react`.

---

## Phase 6 — Ticket List UI

### File: `frontend/src/pages/Tickets.tsx`

Show a small product tag on ticket rows that have `productName` set. Place it in the subject line area next to existing badges.

```tsx
{ticket.productName && (
  <Badge className="text-[10px] px-2 py-0 h-4 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 font-semibold">
    {ticket.productName}
  </Badge>
)}
```

Import `Package` from lucide-react (already imported for detail page).

---

## Phase 7 — Widget Snippet (for Product Teams)

### New File: `backend/src/lib/supportWidget.ts`

A tiny utility your product teams copy into their codebase. Framework-agnostic vanilla JS.

```ts
interface SupportWidgetOptions {
  product: string;          // e.g. "SahaYak CRM"
  supportEmail: string;     // your support inbox e.g. "support@sahayak.com"
  userEmail?: string;       // pre-fill from logged-in session
  page?: string;            // defaults to window.location.pathname
}

export function openSupportEmail(options: SupportWidgetOptions): void {
  const page = options.page ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const userEmail = options.userEmail ?? 'Not logged in';

  const subject = encodeURIComponent(`[${options.product}] Issue on ${page}`);

  const body = encodeURIComponent(
    `------ Support Request ------\n` +
    `Product: ${options.product}\n` +
    `Page: ${page}\n` +
    `User: ${userEmail}\n` +
    `-----------------------------\n\n` +
    `Describe your issue below:\n\n`
  );

  window.location.href = `mailto:${options.supportEmail}?subject=${subject}&body=${body}`;
}
```

**Usage in any product (React example):**
```tsx
import { openSupportEmail } from '@/lib/supportWidget';

<button
  onClick={() => openSupportEmail({
    product: 'SahaYak CRM',
    supportEmail: 'support@sahayak.com',
    userEmail: currentUser.email,
  })}
>
  Report an Issue
</button>
```

**Usage in plain HTML:**
```html
<a href="#" onclick="openSupportEmail({ product: 'ProductA', supportEmail: 'support@sahayak.com' })">
  Report an Issue
</a>
```

The snippet is self-contained — product teams just copy the `openSupportEmail` function and call it with their config. No API key, no auth, no dependency.

---

## Phase 8 — AI Classification Behavior (No Change Needed)

The existing classification flow continues unchanged:

1. Email arrives → parsed → `productName` + `pageContext` extracted → ticket created
2. `classifyTicket(subject, cleanBody)` runs → assigns `GENERAL_QUESTION / TECHNICAL_QUESTION / REFUND_REQUEST`
3. `triggerAutoResolve(ticketId)` runs → if unresolved, auto-assigns to matching team

The `productName` is purely informational for agents. It does not affect AI classification or team routing (those are based on issue type, not product). This is intentional — if you later want product-specific routing, that's a separate feature.

---

## Files Changed Summary

| File | Change |
|------|--------|
| `backend/prisma/schema.prisma` | Add `productName`, `pageContext` to `Ticket` |
| `backend/prisma/migrations/<ts>_add_product_context/migration.sql` | `ALTER TABLE` for two new columns |
| `backend/src/lib/parseEmailContext.ts` | **New** — email header parser |
| `backend/src/services/gmailPoller.ts` | Import parser, use `cleanBody`, pass `productName`/`pageContext` to ticket create |
| `backend/src/lib/supportWidget.ts` | **New** — mailto link generator for product teams |
| `frontend/src/types/index.ts` | Add `productName`, `pageContext` to `Ticket` interface |
| `frontend/src/pages/TicketDetail.tsx` | Add product context bar in header card |
| `frontend/src/pages/Tickets.tsx` | Add product name badge on ticket rows |

---

## Testing Plan

### Step 1 — Simulate a widget email
Manually send an email to your support Gmail address with exactly this format:
```
Subject: [TestProduct] Issue on /login

------ Support Request ------
Product: TestProduct
Page: /login
User: test@example.com
-----------------------------

I cannot log in to my account. The password reset link is not working.
```

### Step 2 — Verify ticket creation
- Open the ticket in the app
- Confirm `productName` shows "TestProduct"
- Confirm `pageContext` shows "/login"
- Confirm ticket `body` only contains the customer message (no metadata header)

### Step 3 — Verify regular emails are unaffected
Send a plain email (no widget header). Confirm `productName` and `pageContext` are null and the ticket body is correct.

### Step 4 — Verify the widget snippet
Copy `openSupportEmail` into a test HTML file, call it, and verify the mailto link opens with the correct pre-filled subject and body.

### Step 5 — End-to-end
Use the snippet in one of your actual products. Click the button, send the email, wait for the 30s poller, and confirm the ticket appears with full context in the dashboard.

---

## Rollout Instructions for Product Teams

Send each product team this:

> **Adding a Support Button to Your Product**
>
> 1. Copy the `openSupportEmail` function from `backend/src/lib/supportWidget.ts`
> 2. Add a button anywhere in your UI and call:
>    ```js
>    openSupportEmail({
>      product: 'YOUR_PRODUCT_NAME',        // e.g. "Billing Portal"
>      supportEmail: 'support@sahayak.com',
>      userEmail: currentUser.email,        // from your auth session
>    })
>    ```
> 3. The user's default email client opens with everything pre-filled.
> 4. That's it — the support ticket is automatically created and routed.
