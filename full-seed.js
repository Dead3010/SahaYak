const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Seed agent user
  const agentEmail = 'agent@helpdesk.com';
  const existingAgent = await prisma.user.findUnique({ where: { email: agentEmail } });
  let agent = existingAgent;
  if (!existingAgent) {
    const hashed = await bcrypt.hash('Agent@123456', 12);
    agent = await prisma.user.create({
      data: { email: agentEmail, password: hashed, name: 'Sarah Chen', role: 'AGENT' },
    });
    console.log('Agent created:', agentEmail);
  } else {
    console.log('Agent already exists');
  }

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  // Seed knowledge base
  const kbCount = await prisma.knowledgeBase.count();
  if (kbCount === 0) {
    await prisma.knowledgeBase.createMany({
      data: [
        { title: 'How to reset your password', content: 'To reset your password, visit the login page and click "Forgot Password". Enter your email address and we will send you a reset link within 5 minutes. Check your spam folder if you do not receive it. The link expires after 24 hours.', category: 'GENERAL_QUESTION' },
        { title: 'Refund policy', content: 'We offer a 30-day money-back guarantee on all plans. To request a refund, contact our support team with your order number and reason for the refund. Refunds are processed within 5-7 business days to your original payment method.', category: 'REFUND_REQUEST' },
        { title: 'Troubleshooting login issues', content: 'If you cannot log in, first ensure you are using the correct email address. Clear your browser cache and cookies, then try again. If you use SSO, check with your IT administrator. If the issue persists, contact support with your browser version and operating system.', category: 'TECHNICAL_QUESTION' },
        { title: 'How to upgrade your plan', content: 'To upgrade your plan, go to Account Settings > Billing > Change Plan. Select your desired plan and confirm. The price difference is prorated for the remainder of your billing cycle. Changes take effect immediately.', category: 'GENERAL_QUESTION' },
        { title: 'API rate limits and errors', content: 'Our API enforces rate limits of 1000 requests per minute per account. If you receive a 429 error, implement exponential backoff in your code. For 500 errors, retry up to 3 times before escalating.', category: 'TECHNICAL_QUESTION' },
        { title: 'Cancellation and data retention', content: 'You can cancel your subscription at any time from Account Settings > Billing > Cancel Subscription. Your data is retained for 30 days after cancellation, after which it is permanently deleted. Export your data before cancelling.', category: 'REFUND_REQUEST' },
      ],
    });
    console.log('Knowledge base seeded.');
  }

  // Seed tickets
  const ticketCount = await prisma.ticket.count();
  if (ticketCount === 0) {
    const tickets = [
      { subject: 'Cannot log in to my account after password change', body: "Hi,\n\nI changed my password yesterday and now I can't log in at all. I've tried resetting it again but the reset email never arrives. I checked my spam folder too.\n\nThis is very urgent as I have a deadline today.\n\nBest,\nJames", fromEmail: 'james.miller@acme.com', fromName: 'James Miller', status: 'OPEN', category: 'TECHNICAL_QUESTION', aiClassified: true, summary: 'User cannot log in after a password change. Password reset emails not received. Urgent.', assignedToId: agent ? agent.id : null, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), replies: [{ body: "Hi James,\n\nI've manually triggered a password reset — please check your inbox in the next 5 minutes.\n\nBest,\nSarah", isAI: false, sentViaEmail: true, authorId: agent ? agent.id : null, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }] },
      { subject: 'Refund request - charged twice for subscription', body: "Hello,\n\nI was charged twice for my monthly subscription. My bank shows two charges of $49.99 on June 15th.\n\nOrder numbers: #ORD-88821 and #ORD-88834\n\nPlease refund the duplicate charge.\n\nThank you,\nPriya Sharma", fromEmail: 'priya.sharma@gmail.com', fromName: 'Priya Sharma', status: 'RESOLVED', category: 'REFUND_REQUEST', aiClassified: true, summary: 'Customer charged twice ($49.99 x2) on June 15th. Two order numbers provided. Requesting refund.', assignedToId: admin ? admin.id : null, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), replies: [{ body: "Hi Priya,\n\nI've confirmed the duplicate charge. A full refund of $49.99 has been issued and should appear within 5-7 business days.\n\nBest,\nAdmin Team", isAI: false, sentViaEmail: true, authorId: admin ? admin.id : null, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }] },
      { subject: 'API returning 429 errors intermittently', body: "Hi Support,\n\nWe are seeing intermittent 429 errors even though we believe we are well within the rate limits (~200 req/min).\n\nErrors happen in bursts between 2-4 PM UTC.\n\nThanks,\nDev Team at TechCorp", fromEmail: 'devops@techcorp.io', fromName: 'TechCorp Dev Team', status: 'OPEN', category: 'TECHNICAL_QUESTION', aiClassified: true, summary: 'Team receiving intermittent 429 errors on /v2/data endpoint. Errors cluster between 2-4 PM UTC.', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), replies: [] },
      { subject: 'How do I add team members to my account?', body: "Hello,\n\nI just upgraded to the Team plan and want to invite my colleagues. I looked in Account Settings but couldn't find an Invite option.\n\nThanks,\nLucy", fromEmail: 'lucy.green@startupxyz.com', fromName: 'Lucy Green', status: 'RESOLVED', category: 'GENERAL_QUESTION', aiClassified: false, summary: 'User on Team plan cannot find the invite option in Account Settings.', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), replies: [{ body: "Hi Lucy,\n\nGo to Account Settings > Team > Invite Members. Enter emails and hit Send Invites.\n\nBest,\nSupport Team", isAI: false, sentViaEmail: true, authorId: agent ? agent.id : null, createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000) }] },
      { subject: 'Request to cancel subscription and get pro-rated refund', body: "Hi,\n\nI'd like to cancel my annual subscription. I signed up 3 months ago but the product isn't a good fit.\n\nI was hoping for a pro-rated refund for the remaining 9 months.\n\nRoberto", fromEmail: 'roberto@designstudio.co', fromName: 'Roberto Alves', status: 'NEW', category: 'REFUND_REQUEST', aiClassified: true, summary: 'Customer wants to cancel annual subscription (3 months in) and requesting pro-rated refund for remaining 9 months.', createdAt: new Date(Date.now() - 30 * 60 * 1000), replies: [] },
      { subject: 'Dashboard charts not loading', body: "Hello,\n\nSince this morning the analytics dashboard shows blank charts. I've tried Chrome and Firefox.\n\nRegards,\nAnna K.", fromEmail: 'anna.kowalski@enterprise.pl', fromName: 'Anna Kowalski', status: 'CLOSED', category: 'TECHNICAL_QUESTION', aiClassified: true, summary: 'Analytics dashboard charts blank since this morning. Persists across browsers.', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), replies: [{ body: "Hi Anna,\n\nWe identified a brief outage in our analytics service this morning. This has been fully resolved. Please refresh the page.\n\nBest,\nSupport Team", isAI: false, sentViaEmail: true, authorId: admin ? admin.id : null, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000) }] },
      { subject: 'Need invoice for last 3 months', body: "Hi,\n\nOur accounting department needs PDF invoices for April, May, and June. I can see the charges but can't find how to download the invoices.\n\nThanks,\nMike", fromEmail: 'mike.tanaka@globallogistics.com', fromName: 'Mike Tanaka', status: 'NEW', category: 'GENERAL_QUESTION', aiClassified: false, createdAt: new Date(Date.now() - 45 * 60 * 1000), replies: [] },
      { subject: 'SSO setup with Okta failing', body: "Hello,\n\nWe are configuring SSO with Okta but getting: 'Invalid assertion signature'.\n\nPlan: Enterprise\n\nThanks,\nIT Admin at Nexus Financial", fromEmail: 'it-admin@nexusfinancial.com', fromName: 'Nexus Financial IT', status: 'OPEN', category: 'TECHNICAL_QUESTION', aiClassified: true, summary: "Enterprise customer failing to configure Okta SSO/SAML — 'Invalid assertion signature' error.", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), replies: [] },
    ];

    for (const { replies, ...fields } of tickets) {
      await prisma.ticket.create({
        data: { ...fields, replies: { create: replies } },
      });
    }
    console.log('Seeded', tickets.length, 'tickets.');
  } else {
    console.log('Tickets already exist, skipping.');
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
