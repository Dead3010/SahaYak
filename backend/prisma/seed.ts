import { PrismaClient, Role, TicketStatus, TicketCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@helpdesk.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'System Admin';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: { email: adminEmail, password: hashed, name: adminName, role: Role.ADMIN },
    });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }

  // Seed an agent user
  const agentEmail = 'agent@helpdesk.com';
  const existingAgent = await prisma.user.findUnique({ where: { email: agentEmail } });
  if (!existingAgent) {
    const hashed = await bcrypt.hash('Agent@123456', 12);
    await prisma.user.create({
      data: { email: agentEmail, password: hashed, name: 'Sarah Chen', role: Role.AGENT },
    });
    console.log('Agent created: agent@helpdesk.com / Agent@123456');
  }

  const kbCount = await prisma.knowledgeBase.count();
  if (kbCount === 0) {
    await prisma.knowledgeBase.createMany({
      data: [
        {
          title: 'How to reset your password',
          content:
            'To reset your password, visit the login page and click "Forgot Password". Enter your email address and we will send you a reset link within 5 minutes. Check your spam folder if you do not receive it. The link expires after 24 hours.',
          category: 'GENERAL_QUESTION',
        },
        {
          title: 'Refund policy',
          content:
            'We offer a 30-day money-back guarantee on all plans. To request a refund, contact our support team with your order number and reason for the refund. Refunds are processed within 5-7 business days to your original payment method.',
          category: 'REFUND_REQUEST',
        },
        {
          title: 'Troubleshooting login issues',
          content:
            'If you cannot log in, first ensure you are using the correct email address. Clear your browser cache and cookies, then try again. If you use SSO, check with your IT administrator. If the issue persists, contact support with your browser version and operating system.',
          category: 'TECHNICAL_QUESTION',
        },
        {
          title: 'How to upgrade your plan',
          content:
            'To upgrade your plan, go to Account Settings > Billing > Change Plan. Select your desired plan and confirm. The price difference is prorated for the remainder of your billing cycle. Changes take effect immediately.',
          category: 'GENERAL_QUESTION',
        },
        {
          title: 'API rate limits and errors',
          content:
            'Our API enforces rate limits of 1000 requests per minute per account. If you receive a 429 error, implement exponential backoff in your code. For 500 errors, retry up to 3 times before escalating. API documentation is available at /docs/api.',
          category: 'TECHNICAL_QUESTION',
        },
        {
          title: 'Cancellation and data retention',
          content:
            'You can cancel your subscription at any time from Account Settings > Billing > Cancel Subscription. Your data is retained for 30 days after cancellation, after which it is permanently deleted. Export your data before cancelling.',
          category: 'REFUND_REQUEST',
        },
      ],
    });
    console.log('Knowledge base seeded.');
  }

  const ticketCount = await prisma.ticket.count();
  if (ticketCount === 0) {
    const agent = await prisma.user.findUnique({ where: { email: agentEmail } });
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });

    const tickets: Array<{
      subject: string;
      body: string;
      fromEmail: string;
      fromName: string;
      status: TicketStatus;
      category: TicketCategory;
      aiClassified: boolean;
      summary?: string;
      suggestedReply?: string;
      assignedToId?: string;
      createdAt: Date;
      replies: Array<{ body: string; isAI: boolean; sentViaEmail: boolean; authorId?: string; createdAt: Date }>;
    }> = [
      {
        subject: 'Cannot log in to my account after password change',
        body: "Hi,\n\nI changed my password yesterday and now I can't log in at all. I've tried resetting it again but the reset email never arrives. I checked my spam folder too.\n\nThis is very urgent as I have a deadline today and need to access my files.\n\nPlease help!\n\nBest,\nJames",
        fromEmail: 'james.miller@acme.com',
        fromName: 'James Miller',
        status: 'OPEN',
        category: 'TECHNICAL_QUESTION',
        aiClassified: true,
        summary:
          'User cannot log in after a password change. Password reset emails are not being received (checked spam). Urgent due to a work deadline.',
        suggestedReply:
          "Hi James,\n\nI'm sorry to hear you're having trouble logging in. Let me help you get back in right away.\n\nFirst, please try the following:\n1. Clear your browser cache and cookies, then try logging in again.\n2. Try a different browser or incognito/private window.\n3. If the reset email still doesn't arrive, check that you're entering the same email address you used to sign up.\n\nIf none of these work, please reply with your account email address and I'll manually trigger a password reset and investigate why the emails aren't delivering.\n\nBest regards,\nSupport Team",
        assignedToId: agent?.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        replies: [
          {
            body: "Hi James,\n\nI'm sorry to hear you're having trouble logging in. Let me help you get back in right away.\n\nI've manually triggered a password reset for your account — please check your inbox in the next 5 minutes. If you still don't see it, let me know and I'll investigate further.\n\nBest,\nSarah",
            isAI: false,
            sentViaEmail: true,
            authorId: agent?.id,
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          },
        ],
      },
      {
        subject: 'Refund request - charged twice for subscription',
        body: "Hello,\n\nI was charged twice for my monthly subscription this billing cycle. My bank statement shows two charges of $49.99 on June 15th from your company.\n\nOrder numbers: #ORD-88821 and #ORD-88834\n\nPlease refund the duplicate charge as soon as possible.\n\nThank you,\nPriya Sharma",
        fromEmail: 'priya.sharma@gmail.com',
        fromName: 'Priya Sharma',
        status: 'RESOLVED',
        category: 'REFUND_REQUEST',
        aiClassified: true,
        summary:
          'Customer was charged twice ($49.99 x2) on June 15th. Provides two order numbers (#ORD-88821 and #ORD-88834) and requests a refund for the duplicate charge.',
        assignedToId: admin?.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        replies: [
          {
            body: "Hi Priya,\n\nThank you for bringing this to our attention. I've reviewed your account and confirmed the duplicate charge. A full refund of $49.99 has been issued to your original payment method and should appear within 5–7 business days.\n\nI sincerely apologise for the inconvenience. We've also flagged this for our billing team to prevent it from happening again.\n\nPlease don't hesitate to reach out if you need anything else.\n\nBest,\nAdmin Team",
            isAI: false,
            sentViaEmail: true,
            authorId: admin?.id,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        subject: 'API returning 429 errors intermittently',
        body: "Hi Support,\n\nWe've been integrating your API into our production system and are seeing intermittent 429 errors even though we believe we're well within the rate limits (around 200 req/min).\n\nWe're using the /v2/data endpoint with API key auth. The errors seem to happen in bursts, usually between 2–4 PM UTC.\n\nCould you check if there's a per-endpoint limit or if something else is going on?\n\nThanks,\nDev Team at TechCorp",
        fromEmail: 'devops@techcorp.io',
        fromName: 'TechCorp Dev Team',
        status: 'OPEN',
        category: 'TECHNICAL_QUESTION',
        aiClassified: true,
        summary:
          "Team receiving intermittent 429 errors on /v2/data endpoint (~200 req/min, well within global limits). Errors cluster between 2–4 PM UTC. Suspect per-endpoint rate limiting.",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        replies: [],
      },
      {
        subject: 'How do I add team members to my account?',
        body: "Hello,\n\nI've just upgraded to the Team plan and want to invite my colleagues. I looked in Account Settings but couldn't find an 'Invite' option.\n\nCould you point me in the right direction?\n\nThanks,\nLucy",
        fromEmail: 'lucy.green@startupxyz.com',
        fromName: 'Lucy Green',
        status: 'RESOLVED',
        category: 'GENERAL_QUESTION',
        aiClassified: false,
        summary: 'User on Team plan cannot find the invite/team member option in Account Settings.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        replies: [
          {
            body: "Hi Lucy,\n\nGreat news — adding team members is easy! Here's how:\n\n1. Go to **Account Settings** → **Team**\n2. Click **Invite Members**\n3. Enter your colleagues' email addresses and select their roles\n4. Hit **Send Invites**\n\nThey'll receive an email to set up their accounts. Let me know if you run into any issues!\n\nBest,\nSupport Team",
            isAI: false,
            sentViaEmail: true,
            authorId: agent?.id,
            createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
          },
        ],
      },
      {
        subject: 'Request to cancel subscription and get pro-rated refund',
        body: "Hi,\n\nI'd like to cancel my annual subscription. I signed up 3 months ago but the product isn't a good fit for our use case unfortunately.\n\nI understand you have a 30-day refund policy, but given the circumstances I was hoping for a pro-rated refund for the remaining 9 months. My account email is roberto@designstudio.co.\n\nPlease let me know what's possible.\n\nRoberto",
        fromEmail: 'roberto@designstudio.co',
        fromName: 'Roberto Alves',
        status: 'OPEN',
        category: 'REFUND_REQUEST',
        aiClassified: true,
        summary:
          'Customer wants to cancel annual subscription (3 months in) and is requesting a pro-rated refund for the remaining 9 months, acknowledging this falls outside the standard 30-day window.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        replies: [],
      },
      {
        subject: 'Dashboard charts not loading — blank screen',
        body: "Hello,\n\nSince this morning the analytics dashboard shows blank charts. The rest of the app seems fine. I've tried Chrome and Firefox, and cleared my cache.\n\nI'm on the Business plan. Is there an outage?\n\nRegards,\nAnna K.",
        fromEmail: 'anna.kowalski@enterprise.pl',
        fromName: 'Anna Kowalski',
        status: 'CLOSED',
        category: 'TECHNICAL_QUESTION',
        aiClassified: true,
        summary:
          'Analytics dashboard charts are not rendering (blank) since this morning. Issue persists across Chrome and Firefox after cache clear. No other app issues reported.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        replies: [
          {
            body: "Hi Anna,\n\nThank you for reporting this. We identified a brief outage in our analytics service this morning between 8:00–10:30 AM UTC. This has now been fully resolved.\n\nYour dashboard charts should be loading correctly. Please refresh the page and let us know if you're still seeing the issue.\n\nApologies for any disruption!\n\nBest,\nSupport Team",
            isAI: false,
            sentViaEmail: true,
            authorId: admin?.id,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          },
          {
            body: 'Hi, thanks for the quick response. Charts are loading fine now. Great support!',
            isAI: false,
            sentViaEmail: false,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        subject: 'Need invoice for last 3 months for accounting',
        body: "Hi,\n\nOur accounting department needs PDF invoices for April, May, and June. I can see the charges in the billing section but can't find how to download the invoices.\n\nAccount: finance@globallogistics.com\n\nThanks,\nMike",
        fromEmail: 'mike.tanaka@globallogistics.com',
        fromName: 'Mike Tanaka',
        status: 'OPEN',
        category: 'GENERAL_QUESTION',
        aiClassified: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
        replies: [],
      },
      {
        subject: 'Single sign-on (SSO) setup with Okta',
        body: "Hello,\n\nWe're trying to configure SSO with Okta for our organisation but the SAML configuration is failing. We get: 'Invalid assertion signature'.\n\nWe followed the setup guide but are stuck. Could you share the correct metadata XML URL or a detailed Okta setup guide?\n\nCompany: Nexus Financial\nPlan: Enterprise\n\nThanks,\nIT Admin",
        fromEmail: 'it-admin@nexusfinancial.com',
        fromName: 'Nexus Financial IT',
        status: 'OPEN',
        category: 'TECHNICAL_QUESTION',
        aiClassified: true,
        summary:
          "Enterprise customer failing to configure Okta SSO/SAML — receiving 'Invalid assertion signature' error. Following existing guide but stuck. Needs metadata XML URL or detailed Okta guide.",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        replies: [],
      },
    ];

    for (const ticketData of tickets) {
      const { replies, ...ticketFields } = ticketData;
      await prisma.ticket.create({
        data: {
          ...ticketFields,
          replies: {
            create: replies.map((r) => ({
              body: r.body,
              isAI: r.isAI,
              sentViaEmail: r.sentViaEmail,
              authorId: r.authorId,
              createdAt: r.createdAt,
            })),
          },
        },
      });
    }

    console.log(`Seeded ${tickets.length} example tickets.`);
  } else {
    console.log(`Tickets already exist (${ticketCount}), skipping.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
