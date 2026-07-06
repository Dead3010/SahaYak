const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const priorities = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
const statuses   = ['NEW', 'OPEN', 'PROCESSING', 'RESOLVED', 'CLOSED'];

// 50 realistic tickets — variety of subjects, categories, priorities
const tickets = [
  // URGENT
  { subject: 'Legal threat — unauthorized charge on my card', body: 'You have charged my card without authorisation. I am filing a chargeback and consulting my lawyer if this is not resolved within 24 hours.\n\nTransaction ID: TXN-88321', category: 'REFUND_REQUEST', fromName: 'Rohan Mehta', fromEmail: 'rohan.mehta@gmail.com', priority: 'URGENT' },
  { subject: 'Complete outage — cannot access account at all', body: 'Our entire team is locked out. We are losing revenue every minute. Please escalate immediately. This is business critical.\n\nCompany: TechVentures Pvt Ltd', category: 'TECHNICAL_QUESTION', fromName: 'Anjali Sharma', fromEmail: 'anjali@techventures.in', priority: 'URGENT' },
  { subject: 'Security breach — suspicious login from unknown location', body: 'I received an alert about a login from Russia. I did not do this. My account may be compromised. Please lock it immediately and investigate.', category: 'TECHNICAL_QUESTION', fromName: 'Priya Nair', fromEmail: 'priya.nair@secure.com', priority: 'URGENT' },
  { subject: 'Chargeback dispute — fraudulent transaction', body: 'I have been charged ₹14,999 which I never authorised. I have already raised a dispute with my bank. Please refund immediately or I will escalate.\n\nOrder: #ORD-55210', category: 'REFUND_REQUEST', fromName: 'Vikram Bose', fromEmail: 'vikram.bose@angry.com', priority: 'URGENT' },
  { subject: 'Cannot access product — subscription active but blocked', body: 'I am paying for the Business plan but get a "subscription expired" error. I have a deadline in 2 hours. This is unacceptable.', category: 'TECHNICAL_QUESTION', fromName: 'Sneha Reddy', fromEmail: 'sneha.reddy@deadline.com', priority: 'URGENT' },
  { subject: 'Threatening to report to consumer court', body: 'This is the 4th time I am following up on my refund. If not processed today I will file a consumer court complaint and post on social media.', category: 'REFUND_REQUEST', fromName: 'Arjun Kapoor', fromEmail: 'arjun.kapoor@upset.com', priority: 'URGENT' },
  { subject: 'Data loss — all tickets deleted after update', body: 'After your update yesterday all our historical tickets are gone. 2 years of customer data lost. Please restore immediately from backups.', category: 'TECHNICAL_QUESTION', fromName: 'Neha Pillai', fromEmail: 'neha.pillai@dataloss.com', priority: 'URGENT' },
  { subject: 'Account hacked — password changed without my consent', body: 'Someone changed my password and email. I am completely locked out. My business data is at risk. Need immediate help.', category: 'TECHNICAL_QUESTION', fromName: 'Rahul Das', fromEmail: 'rahul.das@hacked.com', priority: 'URGENT' },

  // HIGH
  { subject: 'Charged double for this month', body: 'My card was billed ₹2,999 twice on 1st July. Transaction IDs: TXN-4421 and TXN-4422. Please refund the duplicate charge.\n\nRegards,\nKiran', category: 'REFUND_REQUEST', fromName: 'Kiran Desai', fromEmail: 'kiran.desai@gmail.com', priority: 'HIGH' },
  { subject: 'Account locked — need urgent access', body: 'My account got locked after too many login attempts. I have a client presentation in 3 hours and need access to my dashboard now.', category: 'TECHNICAL_QUESTION', fromName: 'Divya Menon', fromEmail: 'divya.menon@presentation.com', priority: 'HIGH' },
  { subject: 'Wrong plan charged — expected ₹999 got charged ₹4,999', body: 'I selected the Starter plan but was charged for the Enterprise plan. This is a billing error. Please correct and refund ₹4,000.', category: 'REFUND_REQUEST', fromName: 'Aakash Joshi', fromEmail: 'aakash.joshi@wrongplan.com', priority: 'HIGH' },
  { subject: 'API authentication failing — production is down', body: 'All API calls started returning 401 Unauthorized since 9 AM. Our production integration is broken. Key has not changed.\n\nKey: ak_live_xxxxx', category: 'TECHNICAL_QUESTION', fromName: 'Riya Shah', fromEmail: 'riya.shah@proddown.io', priority: 'HIGH' },
  { subject: 'Refund request — cancelled within 24 hours', body: 'I signed up yesterday by mistake and want to cancel immediately. Per your policy I should get a full refund for cancellation within 24 hours.', category: 'REFUND_REQUEST', fromName: 'Manish Gupta', fromEmail: 'manish.gupta@cancel.com', priority: 'HIGH' },
  { subject: 'SSO broken — entire company cannot log in', body: 'Our SSO stopped working after your update last night. All 30 employees are blocked. Getting SAML assertion error. We are on Enterprise plan.', category: 'TECHNICAL_QUESTION', fromName: 'Pooja Iyer', fromEmail: 'pooja.iyer@enterprise.com', priority: 'HIGH' },
  { subject: 'Webhook not triggering — payments not processing', body: 'Our payment webhook has not fired since yesterday. Orders are not being fulfilled as a result. Revenue impact is growing.', category: 'TECHNICAL_QUESTION', fromName: 'Suresh Rao', fromEmail: 'suresh.rao@payments.com', priority: 'HIGH' },
  { subject: 'Pro-rated refund for downgrade', body: 'Downgraded from Business (₹4,999/mo) to Starter (₹999/mo) on 10th July. Please refund the pro-rated difference for the remaining days.', category: 'REFUND_REQUEST', fromName: 'Anita Kulkarni', fromEmail: 'anita.kulkarni@downgrade.com', priority: 'HIGH' },
  { subject: 'Cannot process payments — billing module error', body: 'The billing section throws a 500 error when I try to update my payment method. Cannot renew my subscription. Please fix urgently.', category: 'TECHNICAL_QUESTION', fromName: 'Deepak Verma', fromEmail: 'deepak.verma@billing.com', priority: 'HIGH' },
  { subject: 'Refund for accidental annual upgrade', body: 'I meant to renew monthly but accidentally clicked annual and got charged ₹35,988. I want to switch back to monthly and get a refund.', category: 'REFUND_REQUEST', fromName: 'Shreya Bansal', fromEmail: 'shreya.bansal@accident.com', priority: 'HIGH' },
  { subject: 'Email integration broken — tickets not being created', body: 'Emails to our support address stopped creating tickets 2 days ago. We are missing customer requests. This is a critical workflow.', category: 'TECHNICAL_QUESTION', fromName: 'Nikhil Pandey', fromEmail: 'nikhil.pandey@workflow.com', priority: 'HIGH' },
  { subject: 'Overcharged for extra seats', body: 'Added 2 seats but was billed for 7. Overcharged by 5 seats × ₹999 = ₹4,995. Please review billing and refund the difference.', category: 'REFUND_REQUEST', fromName: 'Kavya Nair', fromEmail: 'kavya.nair@seats.com', priority: 'HIGH' },
  { subject: 'Service downtime caused business loss — need compensation', body: 'Your platform was down for 4 hours on July 3rd. During this time we could not handle customer queries. Requesting a refund for that period.', category: 'REFUND_REQUEST', fromName: 'Tarun Malhotra', fromEmail: 'tarun.malhotra@downtime.com', priority: 'HIGH' },

  // MEDIUM
  { subject: 'How do I export my data to CSV?', body: 'I need to export all ticket data to CSV for our quarterly review. Is there a built-in export feature or do I need to use the API?\n\nThanks', category: 'GENERAL_QUESTION', fromName: 'Amit Patel', fromEmail: 'amit.patel@export.com', priority: 'MEDIUM' },
  { subject: 'Dashboard charts showing wrong data', body: 'The analytics dashboard shows 143 open tickets but the ticket list only shows 89. The numbers do not match. Is this a display bug?', category: 'TECHNICAL_QUESTION', fromName: 'Swati Jain', fromEmail: 'swati.jain@charts.com', priority: 'MEDIUM' },
  { subject: 'Password reset email not arriving', body: 'I requested a password reset 3 times over the last hour but no email has come. Checked spam folder too. Please help me regain access.', category: 'TECHNICAL_QUESTION', fromName: 'Rohit Kumar', fromEmail: 'rohit.kumar@access.com', priority: 'MEDIUM' },
  { subject: 'Request for custom enterprise pricing', body: 'We have a team of 75 agents and none of your standard plans work for us. Can we discuss a custom pricing arrangement?\n\nBest,\nMohit', category: 'GENERAL_QUESTION', fromName: 'Mohit Saxena', fromEmail: 'mohit.saxena@enterprise.com', priority: 'MEDIUM' },
  { subject: 'Slack notifications not working', body: 'Set up the Slack integration following your docs step by step but no notifications are coming through to our channel. Webhook URL is configured.', category: 'TECHNICAL_QUESTION', fromName: 'Pallavi Singh', fromEmail: 'pallavi.singh@slack.com', priority: 'MEDIUM' },
  { subject: 'Can we use a custom domain for the support portal?', body: 'We want to use support.ourcompany.com instead of the default helpdesk URL. How do we set this up? Is there a CNAME record we need to add?', category: 'GENERAL_QUESTION', fromName: 'Gaurav Tiwari', fromEmail: 'gaurav.tiwari@cname.com', priority: 'MEDIUM' },
  { subject: 'Email notifications arriving very late', body: 'We are getting email notifications 2-3 hours after the event. This is making us slow to respond to urgent tickets. Can you investigate?', category: 'TECHNICAL_QUESTION', fromName: 'Rekha Sharma', fromEmail: 'rekha.sharma@delay.com', priority: 'MEDIUM' },
  { subject: 'Report generation taking too long', body: 'Monthly reports used to generate in under a minute. Now they take 15-20 minutes. Has something changed in the backend?', category: 'TECHNICAL_QUESTION', fromName: 'Vishal Agarwal', fromEmail: 'vishal.agarwal@slowreport.com', priority: 'MEDIUM' },
  { subject: 'How to set up auto-replies for off-hours', body: 'We want to automatically reply to customers who email after 6 PM with a message saying we will respond next business day. How do we configure this?', category: 'GENERAL_QUESTION', fromName: 'Meena Rao', fromEmail: 'meena.rao@autorespond.com', priority: 'MEDIUM' },
  { subject: 'Two-factor authentication codes not working', body: 'Set up 2FA with Google Authenticator but the codes are always rejected. Tried Authy too — same problem. Using iPhone 14 with correct time sync.', category: 'TECHNICAL_QUESTION', fromName: 'Sanjay Bhatt', fromEmail: 'sanjay.bhatt@2fa.com', priority: 'MEDIUM' },
  { subject: 'Cannot attach PDF files to ticket replies', body: 'Getting "unsupported file type" when attaching PDFs to replies. PDFs are under 5MB so it is not a size issue. Other file types work fine.', category: 'TECHNICAL_QUESTION', fromName: 'Leela Krishnan', fromEmail: 'leela.krishnan@pdf.com', priority: 'MEDIUM' },
  { subject: 'Does your platform comply with GDPR?', body: 'Our company is EU-based. We need to confirm GDPR compliance, data residency location, and get a DPA (Data Processing Agreement) signed.', category: 'GENERAL_QUESTION', fromName: 'Hans Mueller', fromEmail: 'hans.mueller@eu.de', priority: 'MEDIUM' },
  { subject: 'Search not returning correct results', body: 'When I search for a customer email I know exists, the search returns no results. The same search in the database finds records. Indexing issue?', category: 'TECHNICAL_QUESTION', fromName: 'Puja Das', fromEmail: 'puja.das@search.com', priority: 'MEDIUM' },
  { subject: 'Need VAT invoices for last 6 months', body: 'Our finance team requires VAT invoices for all transactions from January to June. Can you reissue these with proper VAT details included?', category: 'GENERAL_QUESTION', fromName: 'Farhan Khan', fromEmail: 'farhan.khan@vat.com', priority: 'MEDIUM' },
  { subject: 'Bulk CSV import failing at row 47', body: 'Trying to import 500 historical tickets from CSV but it fails at row 47 every time. No error message is shown. The CSV format matches your template exactly.', category: 'TECHNICAL_QUESTION', fromName: 'Preethi Raj', fromEmail: 'preethi.raj@import.com', priority: 'MEDIUM' },

  // LOW
  { subject: 'Feature request — dark mode', body: 'Would love a dark mode option. Working late nights and the bright white interface is straining my eyes. Many of my colleagues feel the same.\n\nThanks for considering!', category: 'GENERAL_QUESTION', fromName: 'Arun Nambiar', fromEmail: 'arun.nambiar@darkmode.com', priority: 'LOW' },
  { subject: 'How to merge duplicate tickets?', body: 'When the same customer emails twice about the same issue we end up with duplicate tickets. Is there a merge feature? If not, would love to see it added.', category: 'GENERAL_QUESTION', fromName: 'Shilpa Goel', fromEmail: 'shilpa.goel@merge.com', priority: 'LOW' },
  { subject: 'When does my billing cycle reset?', body: 'I upgraded my plan mid-month. Just curious — when does the new billing cycle start? Will I be charged a partial amount this month?\n\nThanks', category: 'GENERAL_QUESTION', fromName: 'Ravi Chandran', fromEmail: 'ravi.chandran@billing.com', priority: 'LOW' },
  { subject: 'Request for onboarding resources for new agents', body: 'We just hired 4 new support agents. Do you have any onboarding tutorials, video guides, or a knowledge base we can share with them to get started quickly?', category: 'GENERAL_QUESTION', fromName: 'Asha Iyer', fromEmail: 'asha.iyer@onboard.com', priority: 'LOW' },
  { subject: 'Curious about your roadmap', body: 'Love the product! Just wondering if there is a public roadmap somewhere. Specifically interested in mobile app improvements and better reporting.\n\nKeep up the great work!', category: 'GENERAL_QUESTION', fromName: 'Dev Menon', fromEmail: 'dev.menon@curious.com', priority: 'LOW' },
  { subject: 'Minor typo in email template', body: 'Noticed a small typo in the auto-reply email template. It says "We have recieved" instead of "We have received". Just a heads up!\n\nCheers', category: 'GENERAL_QUESTION', fromName: 'Nandini Bhat', fromEmail: 'nandini.bhat@typo.com', priority: 'LOW' },
  { subject: 'How to update our company logo?', body: 'We recently rebranded and want to update the logo that appears in the customer portal and email templates. Where is this setting located?', category: 'GENERAL_QUESTION', fromName: 'Kartik Ahuja', fromEmail: 'kartik.ahuja@branding.com', priority: 'LOW' },
  { subject: 'General question about API rate limits', body: 'What are the API rate limits for the Business plan? We are building an integration and want to make sure we stay within limits.\n\nThanks!', category: 'GENERAL_QUESTION', fromName: 'Tanya Mishra', fromEmail: 'tanya.mishra@api.com', priority: 'LOW' },
  { subject: 'Can we add custom fields to tickets?', body: 'We would like to track some extra information on tickets like customer tier and product version. Is it possible to add custom fields?\n\nRegards', category: 'GENERAL_QUESTION', fromName: 'Harsh Srivastava', fromEmail: 'harsh.srivastava@custom.com', priority: 'LOW' },
  { subject: 'Is there a mobile app available?', body: 'Our agents often need to respond to tickets on the go. Is there an iOS or Android app? Or at least a mobile-optimised web version?\n\nThanks', category: 'GENERAL_QUESTION', fromName: 'Simran Kaur', fromEmail: 'simran.kaur@mobile.com', priority: 'LOW' },
];

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 10) + 8);
  d.setMinutes(Math.floor(Math.random() * 60));
  return d;
}

async function main() {
  // 1. Delete all existing tickets (replies cascade via schema)
  const deleted = await prisma.ticket.deleteMany({});
  console.log(`Deleted ${deleted.count} existing tickets.`);

  // 2. Find agent users to assign some tickets to
  const agents = await prisma.user.findMany({ where: { role: 'AGENT' } });

  // 3. Create 50 new tickets
  let created = 0;
  for (let i = 0; i < tickets.length; i++) {
    const t = tickets[i];
    const status = statuses[i % statuses.length];
    const agent = agents.length > 0 ? agents[i % agents.length] : null;
    const createdAt = randomDate(45);

    const replies = [];

    if (status === 'PROCESSING' || status === 'RESOLVED' || status === 'CLOSED') {
      if (agent) {
        replies.push({
          body: `Hi ${t.fromName.split(' ')[0]},\n\nThank you for reaching out. We have received your request and are looking into it right away. We will get back to you within 24 hours.\n\nBest regards,\n${agent.name}`,
          isAI: false,
          sentViaEmail: true,
          authorId: agent.id,
          createdAt: new Date(createdAt.getTime() + 30 * 60 * 1000),
        });
      }
    }

    if (status === 'RESOLVED' || status === 'CLOSED') {
      if (agent) {
        replies.push({
          body: `Hi ${t.fromName.split(' ')[0]},\n\nWe have looked into your issue and resolved it. Please do not hesitate to reach out if you need anything else.\n\nBest regards,\n${agent.name}`,
          isAI: false,
          sentViaEmail: true,
          authorId: agent.id,
          createdAt: new Date(createdAt.getTime() + 3 * 60 * 60 * 1000),
        });
      }
    }

    await prisma.ticket.create({
      data: {
        subject: t.subject,
        body: t.body,
        fromEmail: t.fromEmail,
        fromName: t.fromName,
        status,
        category: t.category,
        priority: t.priority,
        aiClassified: i % 3 !== 0,
        source: i % 5 === 0 ? 'EMAIL' : 'MANUAL',
        assignedToId: status !== 'NEW' && agent ? agent.id : undefined,
        createdAt,
        replies: { create: replies },
      },
    });
    created++;
    process.stdout.write(`\rCreated ${created}/50 tickets...`);
  }

  console.log(`\n\nDone! Created ${created} tickets.`);
  console.log(`  URGENT: ${tickets.filter(t => t.priority === 'URGENT').length}`);
  console.log(`  HIGH:   ${tickets.filter(t => t.priority === 'HIGH').length}`);
  console.log(`  MEDIUM: ${tickets.filter(t => t.priority === 'MEDIUM').length}`);
  console.log(`  LOW:    ${tickets.filter(t => t.priority === 'LOW').length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
