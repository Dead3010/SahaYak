# SahaYak AI — Support Knowledge Base

*Last Updated: 2026*

This document contains official support policies, feature guides, and
troubleshooting answers used by the AI to resolve customer tickets.

------------------------------------------------------------------------

## 1. Account & Login Issues

### Q: I forgot my password. How do I reset it?

1. Go to the login page.
2. Click **Forgot Password**.
3. Enter your registered email address.
4. Check your inbox for a reset link — it expires in 24 hours.

If the email does not arrive within a few minutes, check your spam or
promotions folder.

------------------------------------------------------------------------

### Q: I'm not receiving the password reset email.

Possible reasons:
- The email address entered does not match your account.
- The email landed in your spam or promotions folder.
- Your email provider is delaying delivery.

Wait 10 minutes and check all folders. If it still hasn't arrived,
contact support with your registered email address.

------------------------------------------------------------------------

### Q: My account is locked or I'm getting "Invalid credentials".

Repeated failed login attempts temporarily lock an account for security.
Wait 15 minutes and try again. If the issue persists, use the Forgot
Password flow to reset your credentials.

------------------------------------------------------------------------

### Q: How do I change my email address or password?

Log in and go to **Account Settings → Profile**. You can update your
email and password there. For email changes, a verification link will be
sent to the new address before the change takes effect.

------------------------------------------------------------------------

### Q: I reset my password but I still can't log in.

- Make sure you are using the new password, not the old one.
- Clear your browser's saved passwords — your browser may be
  auto-filling the old one.
- Check that Caps Lock is not on.
- Try copying and pasting the password instead of typing it.
- If the issue continues, request another password reset.

------------------------------------------------------------------------

### Q: My session keeps expiring and logging me out.

Sessions expire after a period of inactivity for security. To stay
logged in, make sure you are actively using the app. If sessions are
expiring unusually quickly (within minutes), try:
- Clearing browser cookies.
- Disabling privacy or anti-tracking extensions.
- Checking if your browser is set to clear cookies on close.

------------------------------------------------------------------------

### Q: I'm logged in on one tab but getting "Unauthorized" errors in another.

This usually means your session token was refreshed in one tab but not
the other. Refresh all tabs. If the error persists across all tabs, log
out and log back in.

------------------------------------------------------------------------

### Q: The admin is locked out of the system and cannot log in.

Contact support immediately with the admin email address and the
organization name. We can manually reset admin credentials after
verifying your identity.

------------------------------------------------------------------------

### Q: Can two people be logged in with the same account at the same time?

Yes, the same account can be used in multiple browser tabs or devices
simultaneously. Each session is independent.

------------------------------------------------------------------------

### Q: I get a "Forbidden" page after logging in.

The Forbidden page appears when you try to access a page that requires a
role you do not have. For example, Agents cannot access the Users, Teams,
or Email Setup pages — those are Admin-only. If you believe you should
have access, ask your Admin to update your role.

------------------------------------------------------------------------

## 2. Dashboard

### Q: What does the Dashboard show?

The Dashboard gives you a real-time overview of your support operations:

- **AI Performance panel** — shows how many tickets were auto-resolved
  by AI, how many AI replies were sent, and the overall AI resolution rate.
- **Tickets by Category** — a bar chart showing ticket volume split
  across General Question, Technical Question, and Refund Request.
- **Recent Tickets** — the 5 most recently created tickets with quick
  links to open each one.

------------------------------------------------------------------------

### Q: What does "Auto-resolved" mean on the Dashboard?

Auto-resolved is the count of tickets that were answered and closed
entirely by AI without any agent involvement. When a ticket comes in, the
AI checks the knowledge base and — if it finds a confident answer — sends
a reply to the customer automatically and marks the ticket as Resolved.

------------------------------------------------------------------------

### Q: What is the "AI Resolution Rate"?

The AI Resolution Rate is the percentage of all resolved and closed
tickets that were handled by AI rather than a human agent. A higher rate
means the AI is handling more of your support volume independently.

------------------------------------------------------------------------

### Q: The Dashboard is showing 0 for everything even though tickets exist.

This may be a loading issue. Try:
1. Refreshing the page.
2. Logging out and back in.
3. Clearing browser cache (Ctrl+Shift+R).

If stats are still 0 after a refresh and tickets are visible on the
Tickets page, contact support.

------------------------------------------------------------------------

### Q: The bar chart on the Dashboard is not showing.

The bar chart only appears when tickets exist. If you have no tickets yet,
the chart will show "No data yet." Create or import some tickets first.
If tickets exist but the chart is still blank, refresh the page.

------------------------------------------------------------------------

### Q: The Recent Tickets list on the Dashboard is not updating.

The Dashboard loads fresh data every time you visit. If a newly created
ticket is not appearing in Recent Tickets, refresh the page. There is no
live auto-update on the Dashboard — navigating away and back will always
show the latest data.

------------------------------------------------------------------------

### Q: The Dashboard data looks stale or incorrect.

The Dashboard pulls live data every time you visit. If numbers look
wrong, try refreshing the page. If a stat seems permanently off, contact
support with a screenshot of the Dashboard.

------------------------------------------------------------------------

## 3. Tickets — Overview & List

### Q: What is a ticket?

A ticket represents one support request from a customer. It contains:
- The customer's name and email
- Subject and message body
- Status, category, and priority
- Any AI-generated summary or suggested reply
- All replies and internal comments

------------------------------------------------------------------------

### Q: What are the ticket statuses?

- **New** — Just received, not yet reviewed.
- **Processing** — AI is currently analyzing the ticket.
- **Open** — Assigned to an agent or team, awaiting resolution.
- **Resolved** — A reply has been sent and the issue is considered closed.
- **Closed** — Manually closed by an agent.

------------------------------------------------------------------------

### Q: What are the ticket categories?

- **General Question** — General inquiries about the product or service.
- **Technical Question** — Issues with the app, bugs, or how features work.
- **Refund Request** — Requests for refunds or billing disputes.

The AI automatically classifies incoming tickets into one of these three
categories and routes them to the correct team.

------------------------------------------------------------------------

### Q: What are the ticket priorities?

- **Urgent** — Legal threats, security breach, chargeback dispute,
  complete inability to access the product.
- **High** — Billing errors, refund requests, account lockout,
  business-critical issues.
- **Medium** — General technical issues, feature questions.
- **Low** — General inquiries, how-to questions, calm tone.

Priority is automatically scored by AI when a ticket is created.

------------------------------------------------------------------------

### Q: How do I create a new ticket manually?

On the Tickets page, click the **New Ticket** button (top right). Fill
in the customer's name, email, subject, and message description, then
click **Create Ticket**. The AI will automatically classify, prioritize,
and attempt to auto-resolve the ticket.

------------------------------------------------------------------------

### Q: I clicked "New Ticket" but the ticket was not created.

If the manual ticket creation form is not working:
1. Make sure all fields are filled in — Customer Name, Email, Subject,
   and Description are all required.
2. Check for a red error message below the form — it will tell you what
   is missing or invalid.
3. Ensure the email field contains a valid email address format.
4. Try refreshing the page and submitting again.
5. If the button stays in a loading state and nothing happens, check your
   internet connection or try a different browser.

If the issue persists, contact support with a screenshot of the form and
any error message shown.

------------------------------------------------------------------------

### Q: How do I search for a ticket?

On the Tickets page, use the search bar at the top of the list. You can
search by subject, customer name, or email address. Results update as
you type.

------------------------------------------------------------------------

### Q: My search is not returning the ticket I'm looking for.

Search matches against subject, customer name, and email. Make sure you
are spelling the search term correctly. Search is not case-sensitive.
If you are searching by partial email (e.g. "gmail"), it should still
match. If a ticket truly cannot be found, it may have been deleted.

------------------------------------------------------------------------

### Q: How do I filter tickets?

The Tickets page has several filters:

- **Status** — Filter by New, Open, Resolved, Closed (click the stat
  cards at the top).
- **Category** — General, Technical, or Refund.
- **Priority** — Urgent, High, Medium, or Low.
- **Assigned To** — Filter by a specific agent.
- **Date Range** — Use the filter icon to pick a date range or use quick
  presets: Today, This Week, This Month, Last 30 Days.

------------------------------------------------------------------------

### Q: How do I clear all filters?

To clear a dropdown filter, select the "All" option from the dropdown.
To clear date filters, click the filter icon and then **Clear**. Status
filters set by clicking stat cards can be cleared by clicking the active
card again.

------------------------------------------------------------------------

### Q: A ticket has disappeared from the list.

Possible reasons:
- An active filter is hiding it (e.g. you are viewing only "Open" tickets
  but the ticket was moved to "Resolved"). Clear all filters and search
  for the ticket by subject or email.
- The ticket was deleted by an admin or agent.
- The ticket is on a different page — check using pagination.

------------------------------------------------------------------------

### Q: How many tickets are shown per page?

20 tickets are shown per page. Use the pagination controls at the bottom
to navigate. The total ticket count is shown at the top of the list.

------------------------------------------------------------------------

### Q: Can I reopen a resolved or closed ticket?

Yes. Open the ticket detail, click **Update**, change the status back to
**Open**, and click **Save Changes**. The ticket will return to the active
queue.

------------------------------------------------------------------------

### Q: Can I merge duplicate tickets?

Ticket merging is not currently supported. If a customer submitted the
same issue multiple times, resolve or close the duplicates manually and
handle only the original ticket.

------------------------------------------------------------------------

### Q: Can I export the ticket list?

Bulk ticket export is not currently available from the UI. Contact
support if you need a data export for reporting purposes.

------------------------------------------------------------------------

### Q: How do I delete a ticket?

Open the ticket detail page and click the **Delete** button (top right,
red). You will be asked to confirm. Deleted tickets are permanently
removed and cannot be recovered.

------------------------------------------------------------------------

### Q: Can I undo a ticket deletion?

No. Ticket deletion is permanent and cannot be undone. Always confirm
carefully before deleting.

------------------------------------------------------------------------

## 4. Ticket Detail

### Q: What can I do on the Ticket Detail page?

From the ticket detail, you can:
- Read the customer's full message (and translation if non-English)
- Run AI tools: Classify, Summarize, Suggest Reply
- Update the ticket's status, category, priority, and assigned agent
- Write and send a reply to the customer (optionally via email)
- Leave internal comments for your team
- Delete the ticket

------------------------------------------------------------------------

### Q: The ticket detail page is not loading.

Try refreshing the page. If you get a "Ticket not found" error, the
ticket may have been deleted. If you get a generic error, check your
internet connection or try logging out and back in.

------------------------------------------------------------------------

### Q: How do I update a ticket's status, category, or priority?

Click the **Update** button (pencil icon) near the ticket title. A panel
will appear on the right where you can change status, category, priority,
and the assigned agent. Click **Save Changes** when done.

------------------------------------------------------------------------

### Q: My changes to status/priority/category are not saving.

If clicking **Save Changes** does nothing or reverts:
1. Check your internet connection.
2. Make sure you are still logged in (refresh the page).
3. Try making the change again.

If the problem persists, contact support with the ticket ID.

------------------------------------------------------------------------

### Q: How do I assign a ticket to an agent?

Open the ticket, click **Update**, then use the **Assigned To** dropdown
to select an agent. Click **Save Changes**. Tickets can also be
auto-assigned by the AI based on the ticket category and your team
configuration.

------------------------------------------------------------------------

### Q: The agent I want to assign is not in the dropdown.

The dropdown lists all users in the system. If an agent is missing:
- Confirm their account exists in **Settings → Users**.
- Make sure they have the Agent or Admin role.
- If you just created their account, refresh the ticket page.

------------------------------------------------------------------------

### Q: How do I reply to a customer?

Scroll to the **Write a Reply** section at the bottom of the ticket
detail. Type your reply and click **Save Reply** to save it internally,
or check **Send via email to customer** and click **Send Reply** to email
it directly to the customer. When you send a reply via email, the ticket
status automatically changes to **Resolved**.

------------------------------------------------------------------------

### Q: My reply was saved but the customer did not receive an email.

Email delivery only happens when **Send via email to customer** is checked
before clicking Send. A "Save Reply" without that checkbox only saves the
reply internally — it does not email the customer. To send an email, write
a new reply, check the box, and click **Send Reply**.

Also verify that your outgoing email is configured correctly in
**Email Setup**.

------------------------------------------------------------------------

### Q: The customer replied to the email we sent — will it create a new ticket?

If the customer replies to the support email address that is connected via
Gmail in Email Setup, their reply will be pulled in as a new ticket the
next time the email poller runs (every 60 seconds). It will not be
automatically threaded into the original ticket — it will appear as a
separate new ticket.

------------------------------------------------------------------------

### Q: Can I attach files to a reply?

File attachments are not currently supported in replies. If a customer
needs to share a file, ask them to upload it to a file sharing service
(Google Drive, Dropbox) and share the link in their next message.

------------------------------------------------------------------------

### Q: Can I use my voice to write a reply?

Yes. In the **Write a Reply** section, click the **Speak** button (mic
icon). Grant microphone permission when prompted. Speak your reply and it
will be transcribed in real time. Click **Stop** when you are done, then
review and send. Voice input requires Chrome or Edge and microphone access.

------------------------------------------------------------------------

### Q: The voice input is transcribing incorrectly.

Speech recognition accuracy depends on:
- Microphone quality and background noise levels.
- Speaking speed — speaking clearly and at a moderate pace improves accuracy.
- Browser — Chrome gives the best results.

Always review the transcribed text before sending. You can edit it freely
in the text area after stopping the recording.

------------------------------------------------------------------------

### Q: What are internal comments?

Internal comments (the amber **Comments** panel on the right) are notes
visible only to your team — they are never sent to the customer. Use them
to leave context, questions, or handover notes for other agents.

------------------------------------------------------------------------

### Q: Can I delete a reply or internal comment?

Deleting individual replies or comments is not currently supported. If a
reply was sent to a customer in error, contact support.

------------------------------------------------------------------------

### Q: Can I view the original language of a ticket?

Yes. If a ticket is detected as non-English, you will see a language
badge (e.g. 🌐 Spanish) on the ticket. Use the **View Original** /
**View in English** toggle to switch between the original and translated
version of the message.

------------------------------------------------------------------------

### Q: Can I send a reply in the customer's language?

The AI Suggest Reply feature detects the customer's language and
automatically drafts the reply in the same language. If you are writing
a manual reply, you will need to translate it yourself or use the AI
suggestion as a starting point.

------------------------------------------------------------------------

## 5. AI Features

### Q: What AI features does SahaYak AI have?

SahaYak AI includes the following AI capabilities:

1. **Auto-Resolve** — Automatically answers tickets using the knowledge
   base and closes them without agent involvement.
2. **Classify** — Detects the ticket category (General, Technical, Refund).
3. **Priority Scoring** — Assigns priority (Low to Urgent) based on
   ticket content and urgency signals.
4. **Summarize** — Generates a 2–3 sentence summary of the ticket.
5. **Suggest Reply** — Drafts a professional reply using knowledge base
   articles relevant to the ticket.
6. **Language Detection & Translation** — Detects the language of the
   ticket and provides an English translation for agents.
7. **Auto-Assignment** — Routes escalated tickets to the correct team
   based on category.
8. **Ganga Chatbot** — A floating AI assistant that answers quick
   questions from your knowledge base in real time.

------------------------------------------------------------------------

### Q: How does Auto-Resolve work?

When a ticket is created (manually or via email), the AI immediately
reads the ticket subject and body and checks the knowledge base. If it
finds a confident answer, it:
1. Sends a reply to the customer automatically.
2. Marks the ticket as **Resolved** and sets the AI-resolved flag.

If the AI cannot find an answer or detects an escalation trigger, it
routes the ticket to the appropriate team instead.

------------------------------------------------------------------------

### Q: Can I turn off Auto-Resolve?

Auto-Resolve runs automatically for every new ticket and cannot currently
be disabled per ticket. If you want to handle a ticket manually before
the AI processes it, you can update the ticket status to Closed or
reassign it after the AI has run — the AI's reply will still be logged
in the ticket history.

------------------------------------------------------------------------

### Q: The AI auto-resolved a ticket incorrectly. How do I fix it?

If the AI resolved a ticket with an inaccurate reply:
1. Open the ticket and click **Update** to set the status back to **Open**.
2. Write a correct manual reply to the customer and send it via email.
3. Contact support to report the inaccurate AI response so the knowledge
   base can be improved.

------------------------------------------------------------------------

### Q: What triggers an escalation instead of auto-resolve?

The AI escalates to a human agent when:
- The customer mentions legal action or a lawsuit.
- The refund request falls outside the 30-day window.
- A chargeback or bank dispute is mentioned.
- There is a suspected account security breach.
- The AI cannot find a relevant answer in the knowledge base.

Escalated tickets are auto-assigned to the team responsible for that
ticket category.

------------------------------------------------------------------------

### Q: How do I manually run AI on a ticket?

Open the ticket detail and look for the **AI Tools** section. You will
see three buttons:

- **Classify** — Re-classifies the ticket into a category.
- **Summarize** — Generates a short summary of the ticket.
- **Suggest Reply** — Drafts a reply based on the knowledge base.

Click any button to run that action. Results appear immediately below.

------------------------------------------------------------------------

### Q: The AI classified my ticket into the wrong category.

You can re-run classification by clicking **Classify** in the AI Tools
section, or manually correct it by clicking **Update** and selecting the
right category. If the AI is consistently misclassifying similar tickets,
the knowledge base may need more specific content — contact support.

------------------------------------------------------------------------

### Q: The AI assigned the wrong priority to a ticket.

You can manually override the priority at any time by clicking **Update**
and selecting the correct priority. AI priority scoring is an estimate
based on the ticket content — human judgment always takes precedence.

------------------------------------------------------------------------

### Q: The AI summary is inaccurate or incomplete.

Click **Summarize** again to regenerate the summary. If the regenerated
summary is still poor, the ticket body may be too short or ambiguous.
You can ignore the summary and read the full ticket body directly.

------------------------------------------------------------------------

### Q: The Suggest Reply feature is generating an irrelevant reply.

The Suggest Reply feature uses only your knowledge base. If the
suggestion is off-topic, it may mean:
- The knowledge base does not have a relevant article for this type of
  ticket.
- The ticket topic is too specific or unusual.

Edit the suggestion before sending, and consider adding a relevant
article to the knowledge base to improve future suggestions.

------------------------------------------------------------------------

### Q: The AI suggested reply is not appearing in the reply text area.

After clicking **Suggest Reply**, the suggested text should automatically
populate the reply text area. If it does not:
1. Check if an error message appeared — this usually means a quota issue.
2. Refresh the ticket page and try again.
3. If the issue persists, copy the text from the AI Summary area manually.

------------------------------------------------------------------------

### Q: Can the AI learn from my corrections or past replies?

Not automatically. The AI generates responses based on the knowledge base
content. To improve AI accuracy over time, update the knowledge base with
better or more specific articles. Contact your Admin to manage knowledge
base content.

------------------------------------------------------------------------

### Q: Why does the AI sometimes say it cannot find an answer?

The AI only answers from the knowledge base. If a topic is not covered,
the AI will say so and suggest the customer submit a ticket. To improve
coverage, ask your admin to add articles to the knowledge base.

------------------------------------------------------------------------

### Q: The AI features are returning an error or taking too long.

The most common cause is a Gemini API quota limit. The free tier has
daily usage limits. If you see a quota error:
- Wait until the next day when the quota resets.
- Or upgrade to a paid Gemini API plan.

If the AI is slow but not erroring, it may be processing a long ticket —
wait up to 30 seconds. If it times out, try again.

------------------------------------------------------------------------

### Q: My ticket was created but the AI is not processing it — it's stuck on "New" or "Processing".

When a ticket is created, the AI automatically tries to classify,
prioritize, and auto-resolve it. If a ticket stays stuck:

- **Most common cause:** The Gemini API quota has been exceeded. AI
  processing will resume once the daily quota resets (within 24 hours).
- **Check:** Go to the Ticket Detail page. If AI tools return an error,
  it confirms a quota issue.
- **Workaround:** Manually set the ticket status to **Open** using the
  Update button, then assign it to an agent to handle manually.
- **If quota is not the issue:** Contact support with the ticket ID.

------------------------------------------------------------------------

### Q: The AI is replying to customers in the wrong language.

The AI is designed to detect the ticket language and reply in the same
language. If it is replying in the wrong language:
1. Check that the customer's message is clearly written in their language
   (mixed-language messages can confuse detection).
2. Re-run the **Suggest Reply** tool — it re-detects language each time.
3. Edit the reply manually before sending if needed.

------------------------------------------------------------------------

### Q: What is the Ganga chatbot?

Ganga is a floating AI assistant (the 😊 button at the bottom-left of
the screen). You can ask Ganga quick questions and it will answer using
the knowledge base. Ganga remembers your conversation for the current
session and clears history when you log out.

------------------------------------------------------------------------

### Q: Can Ganga answer questions not in the knowledge base?

No. Ganga only answers from the knowledge base. If a question is not
covered, Ganga will say it does not have that information and suggest
you submit a support ticket.

------------------------------------------------------------------------

### Q: Ganga is not appearing on the screen.

The Ganga chatbot (😊 button) appears at the bottom-left of the screen
on all pages after you log in. If it is not visible:
- Scroll down — it is fixed to the bottom-left corner.
- Check if a browser extension or zoom level is hiding it.
- Try zooming out in your browser (Ctrl+- on Windows).
- Try a different browser.

------------------------------------------------------------------------

### Q: Ganga is not responding to my messages.

If Ganga does not reply after sending a message:
1. Check your internet connection.
2. Wait a few seconds — the AI response may take a moment.
3. If you see an error, the Gemini API quota may be exceeded.
4. Refresh the page and try again.

------------------------------------------------------------------------

### Q: How do I clear my Ganga chat history?

Ganga chat history is automatically cleared when you log out. To clear
it manually during a session, refresh the page and your chat will reset
(note: this also clears any unsaved chat context).

------------------------------------------------------------------------

## 6. Teams

### Q: What are teams?

Teams group agents by ticket category. Each team is assigned one
category (General, Technical, or Refund). When the AI escalates a ticket,
it automatically assigns it to the team responsible for that category and
picks a random available agent from the team.

------------------------------------------------------------------------

### Q: How do I create a team?

Go to **Teams** (Admin only) and click **Create Team**. Enter a team
name and select a category. Only one team can exist per category.

------------------------------------------------------------------------

### Q: Can a team handle more than one category?

No. Each team is linked to exactly one category. If you need agents to
handle multiple categories, add those agents to multiple teams — but note
that each agent can only be in one team at a time.

------------------------------------------------------------------------

### Q: How do I add agents to a team?

On the Teams page, find the team and click **Add Member**. Select an
agent from the dropdown. An agent can belong to only one team at a time.

------------------------------------------------------------------------

### Q: Can an agent be in more than one team?

No. Each agent can belong to only one team. If you assign an agent to a
new team, they are automatically removed from their previous team.

------------------------------------------------------------------------

### Q: How do I remove an agent from a team?

On the Teams page, find the team member and click the remove (×) button
next to their name. The agent will be unlinked from the team but their
account remains active.

------------------------------------------------------------------------

### Q: How do I rename a team?

On the Teams page, click the **Edit** (pencil) button on the team card.
Update the name and save. The category link cannot be changed after
creation — delete and recreate the team if you need to change the category.

------------------------------------------------------------------------

### Q: How do I delete a team?

On the Teams page, click the **Delete** button on the team card and
confirm. Deleting a team does not delete the agents in it — they will
simply become unassigned from the team. Any tickets routed to that team
will remain assigned to individual agents.

------------------------------------------------------------------------

### Q: What happens if no team is set up for a category?

If an escalated ticket's category has no team assigned, the ticket will
remain unassigned with status **Open**. An admin will need to manually
assign it to an agent.

------------------------------------------------------------------------

### Q: My team is not receiving auto-assigned tickets.

Check the following:
- The team has at least one agent member. Teams with no members cannot
  receive auto-assignments.
- The team is assigned to the correct category that matches the incoming
  tickets.
- The ticket was escalated (not auto-resolved). Auto-resolved tickets go
  directly to Resolved and are not assigned to a team.

------------------------------------------------------------------------

### Q: How do I reassign a ticket from one team to another?

Open the ticket, click **Update**, and change the **Assigned To** agent
to someone from the other team. Team assignment follows agent assignment
automatically based on which team the agent belongs to.

------------------------------------------------------------------------

## 7. Email Setup & Incoming Tickets

### Q: How does SahaYak AI receive support emails?

SahaYak AI connects to your Gmail account via IMAP to pull in support
emails and convert them into tickets. Go to **Email Setup** (Admin only)
and enter your Gmail address and an App Password. The system checks for
new emails every 60 seconds.

------------------------------------------------------------------------

### Q: What is a Gmail App Password?

A Gmail App Password is a 16-character code that lets SahaYak AI access
your Gmail without using your main password. To generate one:
1. Enable **2-Step Verification** on your Google account.
2. Go to Google Account → Security → App Passwords.
3. Create a new App Password for "Mail".
4. Paste the code into the Email Setup page.

------------------------------------------------------------------------

### Q: My emails are not being converted into tickets.

Check the following:
- The Gmail address and App Password in Email Setup are correct.
- 2-Step Verification is enabled on your Google account.
- The emails are arriving in your Gmail inbox (not another folder or tab).
- The email polling service is running (contact support if unsure).
- The Gmail account has IMAP enabled (Google Account → Security → IMAP).

------------------------------------------------------------------------

### Q: I clicked "New Ticket" but the ticket was not created.

Make sure all fields are filled in — Customer Name, Email, Subject, and
Description are all required. Check for a red error message below the
form. Ensure the email field has a valid format. If the button stays
loading, check your internet connection or try a different browser.

------------------------------------------------------------------------

### Q: How often does the system check for new emails?

The email poller runs every 60 seconds. New tickets from emails may take
up to 1 minute to appear after the email arrives in your Gmail inbox.

------------------------------------------------------------------------

### Q: Will old emails in my Gmail inbox be imported as tickets?

Only unread emails that arrive after the Gmail connection is set up will
be pulled in. Old emails already in your inbox will not be imported
retroactively.

------------------------------------------------------------------------

### Q: Can I receive tickets from sources other than Gmail?

Currently, SahaYak AI supports Gmail via IMAP polling and manual ticket
creation. Support for additional email providers is planned for a future
release.

------------------------------------------------------------------------

### Q: What email is sent back to the customer when a ticket is auto-resolved?

The AI generates a professional reply based on the knowledge base and
sends it from your configured support email address. The customer receives
it as a normal email response.

------------------------------------------------------------------------

### Q: The customer replied to our email — will it create a new ticket?

If the customer replies to the support email address connected in Email
Setup, their reply will be pulled in as a new ticket the next time the
poller runs (within 60 seconds). It will not be automatically threaded
into the original ticket — it will appear as a separate new ticket.

------------------------------------------------------------------------

### Q: Can I customize the auto-reply email template?

The AI generates replies dynamically based on the knowledge base — there
is no fixed template. To influence the tone and content of AI replies,
update the knowledge base articles. Contact support if you need further
customization.

------------------------------------------------------------------------

### Q: The customer says our email landed in their spam folder.

This is an email deliverability issue with the sender domain. Ensure
your Gmail account has proper SPF/DKIM settings. Ask the customer to mark
your email as "Not Spam" and add your support address to their contacts.

------------------------------------------------------------------------

### Q: I get a security warning from Google when connecting Gmail.

Google may warn you when a third-party app accesses your Gmail. As long
as you are using an App Password (not your main Google password), this is
safe. Follow the App Password setup steps in the Email Setup guide above.
Never enter your main Google password into SahaYak AI.

------------------------------------------------------------------------

### Q: How do I disconnect or change the Gmail account?

Go to **Email Setup** and update the Gmail address and App Password with
the new account's credentials. The old connection will be replaced
immediately.

------------------------------------------------------------------------

## 8. Users & Roles

### Q: What roles exist in SahaYak AI?

- **Admin** — Full access: manages users, teams, email setup, and all
  settings. Admins are set up when the system is deployed.
- **Agent** — Can view and respond to tickets. Agents are created by admins.

------------------------------------------------------------------------

### Q: How do I create a new agent?

Go to **Users** (Admin only) and click **Add User**. Fill in their name,
email, password, and set the role to Agent. The agent can log in
immediately with the credentials you set.

------------------------------------------------------------------------

### Q: How many users can I add?

There is no hard limit on the number of users. However, your subscription
plan may have limits — check your plan details or contact support.

------------------------------------------------------------------------

### Q: How do I reset an agent's password?

Go to **Users**, find the agent, click **Edit**, and set a new password.
The agent can use the new password to log in immediately. You can also
ask them to use the Forgot Password flow on the login page to reset it
themselves.

------------------------------------------------------------------------

### Q: Can agents create other agents or manage users?

No. Only Admins can create, edit, or delete users. Agents have no access
to the Users or Teams pages.

------------------------------------------------------------------------

### Q: Can an agent see all tickets or only their own?

Agents can see all tickets in the system. Filtering by
**Assigned To → their own name** on the Tickets page lets them focus on
tickets assigned to them specifically.

------------------------------------------------------------------------

### Q: How do I delete a user?

Go to **Users**, find the user, and click **Delete**. Their account is
removed immediately. Tickets assigned to them remain in the system as
unassigned and can be reassigned manually.

------------------------------------------------------------------------

### Q: What happens to tickets when an agent is deleted?

Tickets previously assigned to the deleted agent become unassigned. They
will still appear on the Tickets page and can be manually reassigned to
another agent by an Admin.

------------------------------------------------------------------------

### Q: Can I temporarily disable a user without deleting them?

Temporary disabling is not currently supported. As a workaround, you can
change the user's password to prevent them from logging in, and restore
it later when they should regain access.

------------------------------------------------------------------------

### Q: Can I change a user's role from Agent to Admin?

Yes. Go to **Users**, find the user, click **Edit**, and change the role
to Admin. The change takes effect immediately on their next page load.

------------------------------------------------------------------------

### Q: An agent says they cannot see the Teams or Email Setup page.

Teams and Email Setup are Admin-only pages. Agents are redirected to a
Forbidden page if they try to access them. Ask an Admin to change their
role to Admin if they need access, or handle the setup on their behalf.

------------------------------------------------------------------------

## 9. Billing & Subscriptions

### Q: What payment methods do you accept?

We accept all major credit and debit cards (Visa, Mastercard, Amex) as
well as payments via Stripe. Invoices can be issued for annual plans.

------------------------------------------------------------------------

### Q: How does billing work?

Subscriptions are billed monthly or annually depending on your chosen
plan. You will receive an invoice by email before each renewal. You can
view all past invoices from **Account Settings → Billing**.

------------------------------------------------------------------------

### Q: What plans are available?

- **Monthly Plan** — ₹1,499/month
- **Yearly Plan** — ₹1,199/month (billed annually — saves 20%)

Both plans include all features. The yearly plan offers a discounted rate.

------------------------------------------------------------------------

### Q: Is there a free trial?

Contact our sales team via the Demo Request form on the landing page to
discuss a trial or demo of the platform.

------------------------------------------------------------------------

### Q: How do I upgrade or downgrade my plan?

Go to **Account Settings → Billing → Change Plan**. Select the desired
plan and confirm. Upgrades take effect immediately and are prorated.
Downgrades take effect at the start of the next billing cycle.

------------------------------------------------------------------------

### Q: Can I switch from monthly to yearly billing mid-cycle?

Yes. Switching to yearly takes effect immediately. You will be charged the
annual rate and any remaining days on your monthly plan will be prorated
as a credit.

------------------------------------------------------------------------

### Q: My credit card was declined. What should I do?

- Check that the card details (number, expiry, CVV) are entered correctly.
- Ensure the card has sufficient funds or credit.
- Check with your bank — some banks block international or online
  transactions by default.
- Try a different card.
- Contact support if the issue persists.

------------------------------------------------------------------------

### Q: What happens if a payment fails?

If a payment fails, your subscription will enter a grace period of a few
days during which you can update your payment method. If payment is not
received within the grace period, your account will be suspended. All
your data is retained and access is restored as soon as payment succeeds.

------------------------------------------------------------------------

### Q: Can I pause my subscription instead of cancelling?

Subscription pausing is not currently supported. You can cancel and
resubscribe when you are ready — your data is retained for 30 days after
cancellation.

------------------------------------------------------------------------

### Q: How do I cancel my subscription?

Go to **Account Settings → Billing → Cancel Subscription**. Your access
continues until the end of the current billing period. Your data is
retained for 30 days after cancellation before being permanently deleted.
Export your data before cancelling if needed.

------------------------------------------------------------------------

### Q: What happens after I cancel?

- Access continues until the end of the paid period.
- Data is retained for 30 days after the period ends.
- After 30 days, all data is permanently deleted.
- You will not be charged again unless you resubscribe.

------------------------------------------------------------------------

### Q: Can I get a GST/tax invoice?

Yes. Tax invoices are available for all plans. Contact support with your
GST number and business details to get a tax invoice issued.

------------------------------------------------------------------------

### Q: I was charged twice. What do I do?

Contact support immediately with your account email and the transaction
details (date and amount). We will investigate and issue a refund for any
duplicate charge within 5–7 business days.

------------------------------------------------------------------------

### Q: Where can I view my past invoices?

Go to **Account Settings → Billing**. All past invoices are listed there
and can be downloaded as PDFs.

------------------------------------------------------------------------

## 10. Refund Policy

### Q: What is the refund policy?

We offer a **30-day money-back guarantee** on all plans.

- Full refund if requested within 30 days of the initial purchase.
- No refund for renewal charges unless requested within 7 days of renewal.
- Partial refunds are not issued for unused time on monthly plans.

Refunds are processed within 5–10 business days to the original payment
method.

------------------------------------------------------------------------

### Q: How do I request a refund?

To request a refund:
1. Contact support within the eligible window.
2. Provide your account email and order/invoice number.
3. Include a brief reason for the request.

Our team will confirm eligibility and process the refund.

------------------------------------------------------------------------

### Q: I am outside the 30-day window. Can I still get a refund?

Refunds outside the 30-day window are not standard policy. However, if
there are exceptional circumstances (e.g. a billing error, a major
service outage, or a duplicate charge), contact support and we will
review your case individually.

------------------------------------------------------------------------

### Q: I want a refund on my annual plan. Am I eligible?

Annual plan refunds follow the same 30-day policy from the date of
purchase. If you are within 30 days of the initial annual purchase,
you are eligible for a full refund. After 30 days, refunds on annual
plans are not issued for the remaining unused period.

------------------------------------------------------------------------

### Q: How long does a refund take to reach me?

Refunds are processed within 5–10 business days and are returned to the
original payment method. Depending on your bank, it may take an
additional 2–5 business days to appear in your account.

------------------------------------------------------------------------

### Q: I requested a refund but haven't received it yet.

If it has been more than 10 business days since your refund was
confirmed, contact support with your refund confirmation and we will
investigate with our payment processor.

------------------------------------------------------------------------

## 11. Technical Issues

### Q: The app is not loading or showing a blank screen.

Try the following steps:
1. Hard-refresh the page (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac).
2. Clear your browser cache and cookies.
3. Try a different browser (Chrome or Edge recommended).
4. Disable browser extensions that may interfere.
5. Check your internet connection.

If the issue persists, contact support with your browser version and a
screenshot.

------------------------------------------------------------------------

### Q: What browsers does SahaYak AI support?

SahaYak AI is fully supported on:
- Google Chrome (recommended)
- Microsoft Edge

It may work on Firefox and Safari but some features (such as voice input)
are not supported. Internet Explorer is not supported.

------------------------------------------------------------------------

### Q: Does SahaYak AI work on mobile or tablet?

The app is designed for desktop use. It may be usable on a tablet in
landscape mode, but the full experience is optimized for a desktop or
laptop screen. A dedicated mobile app is not currently available.

------------------------------------------------------------------------

### Q: I'm experiencing slow performance or timeouts.

Slow performance is usually caused by network conditions or high server
load. Try:
- Refreshing the page.
- Checking your internet speed.
- Logging out and back in.

If timeouts happen consistently, contact support with details about when
and where it occurs.

------------------------------------------------------------------------

### Q: The page is not scrolling or a button is not clickable.

Try:
1. Clicking somewhere else on the page first to dismiss any open dropdown.
2. Closing any open dialog or modal (press Escape).
3. Refreshing the page.
4. Checking if a browser extension is blocking interaction.

------------------------------------------------------------------------

### Q: A dialog or popup is not closing.

Press the **Escape** key or click the **Cancel** / **×** button. If the
dialog is stuck:
1. Refresh the page (unsaved changes in the form will be lost).
2. Try a different browser.

------------------------------------------------------------------------

### Q: Data on the page is not refreshing after I make a change.

Most pages auto-refresh after actions like creating, updating, or
deleting a ticket. If you do not see your change reflected:
1. Wait 2–3 seconds for the update to complete.
2. Use the **Refresh** button on the Tickets page (circular arrow icon).
3. Navigate away and back to force a fresh load.

------------------------------------------------------------------------

### Q: I have multiple tabs open and the data looks inconsistent.

Each tab fetches data independently. Changes made in one tab will not
automatically appear in other tabs. Refresh the other tabs manually to
see the latest data.

------------------------------------------------------------------------

### Q: The AI features are returning an error.

The most common cause is a Gemini API quota limit. If you see a quota
error, wait until the next day when the quota resets, or upgrade to a
paid Gemini API plan. If the error is not quota-related, contact support
with the exact error message.

------------------------------------------------------------------------

### Q: Features or buttons are not working as expected.

First, try clearing your browser cache and doing a hard refresh. If the
issue continues across multiple browsers, it may be a bug. Contact
support with:
- The name of the feature affected.
- Steps to reproduce the issue.
- Browser and OS version.
- A screenshot or screen recording if possible.

------------------------------------------------------------------------

### Q: I'm getting an error message. What does it mean?

Common error messages:
- **"Unauthorized"** — Your session expired. Log out and back in.
- **"Forbidden"** — You do not have permission for this action.
- **"Ticket not found"** — The ticket may have been deleted.
- **"Something went wrong"** — Temporary server error. Try again shortly.
- **"Gemini API daily quota exceeded"** — AI unavailable until quota
  resets. Try again tomorrow.
- **"All fields are required"** — Fill in all required form fields.

If an error persists, note the exact message and contact support.

------------------------------------------------------------------------

### Q: The voice input (Speak button) is not working.

Voice input requires:
- Chrome or Edge browser (not supported in Safari or Firefox).
- Microphone permission granted in your browser.
- A working microphone connected to your device.

If you denied microphone permission earlier, go to your browser settings,
allow microphone access for this site, then refresh.

------------------------------------------------------------------------

### Q: Translation is not showing for a non-English ticket.

Translation runs automatically when a ticket is created. If not showing:
1. Open the ticket detail.
2. Click **Translate to English** if the button is visible.
3. Wait a moment for the translation to load.

If translation still fails, it may be a Gemini API quota issue.

------------------------------------------------------------------------

### Q: Is there a notification when a new ticket arrives?

Yes. A notification bell icon in the sidebar shows a count of new tickets.
Clicking it shows a list of recent tickets. The count refreshes every
15 seconds automatically. If notifications seem delayed, check your
internet connection.

------------------------------------------------------------------------

### Q: The notification bell count is wrong or not clearing.

The notification count updates every 15 seconds. If it shows an incorrect
count, wait a moment and it will self-correct. If it persists after
refreshing, contact support.

------------------------------------------------------------------------

## 12. Data & Privacy

### Q: How is my data stored and protected?

All data is stored in encrypted databases hosted on secure cloud
infrastructure. Data in transit is protected via TLS/HTTPS. We do not
sell or share your data with third parties.

------------------------------------------------------------------------

### Q: Can I export my data?

Yes. Go to **Account Settings → Data → Export**. You will receive a
downloadable archive of your account data within a few minutes.

------------------------------------------------------------------------

### Q: How do I delete my account and all associated data?

Contact support and request account deletion. All data will be
permanently deleted within 30 days. This action is irreversible — export
your data first if needed.

------------------------------------------------------------------------

### Q: Does SahaYak AI use my ticket data to train AI models?

No. Your ticket data is not used to train any AI models. The AI uses only
your knowledge base content to generate responses.

------------------------------------------------------------------------

### Q: Who can see my tickets and customer data?

Only users (Admins and Agents) within your organization who are logged in
to SahaYak AI can view tickets and customer data. Data is not shared
with other organizations.

------------------------------------------------------------------------

## 13. General & Other Questions

### Q: How do I contact support?

You can reach support by:
- Submitting a ticket through this system.
- Emailing our support address directly.
- Using the **Contact Support** option in the sidebar menu.
- Using the Ganga chatbot for quick answers.

------------------------------------------------------------------------

### Q: Is there a Service Level Agreement (SLA) for response times?

Response time targets depend on your plan. Generally:
- **Urgent** tickets: within 2 hours.
- **High** priority: within 8 hours.
- **Medium/Low**: within 24–48 hours.

Contact support for SLA details specific to your plan.

------------------------------------------------------------------------

### Q: Is there an API I can use to integrate SahaYak AI with other tools?

A public API for integrations is on the roadmap. Contact support to
discuss your integration needs — custom integrations may be available on
enterprise plans.

------------------------------------------------------------------------

### Q: What happens during planned maintenance or downtime?

Planned maintenance is announced in advance by email. During downtime,
incoming support emails are queued and imported automatically once the
system is back online. No emails or tickets are lost during maintenance.

------------------------------------------------------------------------

### Q: The app looks different from what I see in the demo or screenshots.

The app is regularly updated with improvements. If a feature you saw in a
demo is not visible, it may require a specific role (Admin vs Agent) or
plan. Contact support if you cannot find a feature you expected.

------------------------------------------------------------------------

## 14. Escalation Rules (Internal AI Policy)

The AI must escalate to a human agent if any of the following apply:

- The customer threatens legal action or mentions a lawsuit.
- The refund request falls outside the 30-day window.
- The customer disputes a charge or mentions a chargeback or bank dispute.
- The issue involves a suspected account security breach or unauthorized
  access.
- The customer is clearly frustrated or distressed and needs human empathy.
- The AI cannot find a confident answer in this knowledge base.

------------------------------------------------------------------------

End of Knowledge Base
