const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const statuses = ['NEW', 'OPEN', 'PROCESSING', 'RESOLVED', 'CLOSED'];
const categories = ['GENERAL_QUESTION', 'TECHNICAL_QUESTION', 'REFUND_REQUEST'];

const agents = [
  { name: 'Arjun Sharma', email: 'arjun.sharma@helpdesk.com' },
  { name: 'Priya Nair', email: 'priya.nair@helpdesk.com' },
  { name: 'Rahul Verma', email: 'rahul.verma@helpdesk.com' },
  { name: 'Sneha Iyer', email: 'sneha.iyer@helpdesk.com' },
  { name: 'Karan Mehta', email: 'karan.mehta@helpdesk.com' },
  { name: 'Divya Pillai', email: 'divya.pillai@helpdesk.com' },
  { name: 'Rohan Das', email: 'rohan.das@helpdesk.com' },
];

const admins = [
  { name: 'Neha Kapoor', email: 'neha.kapoor@helpdesk.com' },
  { name: 'Vikram Singh', email: 'vikram.singh@helpdesk.com' },
];

const ticketTemplates = [
  { subject: 'Unable to download my invoice', body: 'Hi, I need my invoice for last month but the download button does nothing. Please help.\n\nThanks,\nCustomer', category: 'GENERAL_QUESTION', fromName: 'Alice Johnson', fromEmail: 'alice.johnson@example.com' },
  { subject: 'Password reset not working', body: 'I requested a password reset 3 times but never got the email. My account is locked now.\n\nRegards,\nBob', category: 'TECHNICAL_QUESTION', fromName: 'Bob Williams', fromEmail: 'bob.williams@example.com' },
  { subject: 'Charged twice this month', body: 'My credit card was billed twice for $29.99 on the 1st and 3rd. Please refund the duplicate.\n\nOrder: #ORD-99123', category: 'REFUND_REQUEST', fromName: 'Carol Davis', fromEmail: 'carol.davis@example.com' },
  { subject: 'App crashes on startup', body: 'Every time I open the app on my iPhone it crashes immediately. I have iOS 17 and tried reinstalling.\n\nPlease fix this urgently.', category: 'TECHNICAL_QUESTION', fromName: 'David Lee', fromEmail: 'david.lee@example.com' },
  { subject: 'How to export data to CSV', body: 'Is there a way to export all my data to CSV? I need it for our quarterly report.\n\nThanks', category: 'GENERAL_QUESTION', fromName: 'Emma Wilson', fromEmail: 'emma.wilson@example.com' },
  { subject: 'Cancel my subscription', body: 'I would like to cancel my annual subscription effective immediately and get a pro-rated refund for remaining months.\n\nAccount: frank@email.com', category: 'REFUND_REQUEST', fromName: 'Frank Brown', fromEmail: 'frank.brown@example.com' },
  { subject: 'API key not working after renewal', body: 'My API key stopped working after I renewed my subscription. Getting 401 unauthorized on all endpoints.\n\nKey ID: ak_live_xxxxx', category: 'TECHNICAL_QUESTION', fromName: 'Grace Chen', fromEmail: 'grace.chen@techcorp.com' },
  { subject: 'Need to update billing address', body: 'We moved offices and need to update our billing address for invoicing purposes. New address: 123 New Street, Mumbai 400001.', category: 'GENERAL_QUESTION', fromName: 'Henry Patel', fromEmail: 'henry.patel@business.com' },
  { subject: 'Duplicate transaction refund', body: 'Was charged $99 twice on March 15. Transaction IDs: TXN-4421 and TXN-4422. Please refund one.', category: 'REFUND_REQUEST', fromName: 'Iris Kumar', fromEmail: 'iris.kumar@gmail.com' },
  { subject: 'Dashboard not loading data', body: 'The analytics dashboard shows no data since yesterday. All charts are empty. Was there an outage?\n\nUsing Chrome on Windows 11.', category: 'TECHNICAL_QUESTION', fromName: 'Jack Martinez', fromEmail: 'jack.martinez@company.com' },
  { subject: 'SSO login broken for our team', body: 'Our entire team is unable to login via SSO since this morning. Getting "SAML assertion failed" error. We are on Enterprise plan.', category: 'TECHNICAL_QUESTION', fromName: 'Karen Thompson', fromEmail: 'karen.thompson@enterprise.com' },
  { subject: 'Request for custom plan', body: 'We have a team of 50 and none of your plans fit. Can we get a custom quote?\n\nBest,\nLiam', category: 'GENERAL_QUESTION', fromName: 'Liam Anderson', fromEmail: 'liam.anderson@startup.io' },
  { subject: 'Wrong amount charged', body: 'You charged me $49 but my plan is $29/month. Please correct and refund the difference of $20.', category: 'REFUND_REQUEST', fromName: 'Mia Roberts', fromEmail: 'mia.roberts@gmail.com' },
  { subject: 'Integration with Slack not working', body: 'Set up the Slack integration following your docs but notifications are not coming through. Webhook URL is configured correctly.', category: 'TECHNICAL_QUESTION', fromName: 'Noah Jackson', fromEmail: 'noah.jackson@slackuser.com' },
  { subject: 'Request for bulk discount', body: 'We plan to onboard 200 users. What discount can you offer for annual billing?\n\nRegards,\nOlivia', category: 'GENERAL_QUESTION', fromName: 'Olivia Scott', fromEmail: 'olivia.scott@bigcorp.com' },
  { subject: 'Two-factor authentication issue', body: 'Cannot set up 2FA. The QR code scan works but the OTP codes are always invalid. Tried Google Authenticator and Authy.', category: 'TECHNICAL_QUESTION', fromName: 'Paul Harris', fromEmail: 'paul.harris@secure.com' },
  { subject: 'Refund for accidental upgrade', body: 'I accidentally clicked upgrade to Enterprise plan instead of Team. I need a refund immediately — this was not intentional.', category: 'REFUND_REQUEST', fromName: 'Quinn White', fromEmail: 'quinn.white@mistake.com' },
  { subject: 'How to add custom domain', body: 'We want to use support.ourcompany.com instead of the default URL. How do we configure a custom domain?', category: 'GENERAL_QUESTION', fromName: 'Rachel Green', fromEmail: 'rachel.green@ourcompany.com' },
  { subject: 'Email notifications delayed', body: 'Email notifications are arriving 2-3 hours late. This is causing us to miss urgent customer messages.', category: 'TECHNICAL_QUESTION', fromName: 'Sam Turner', fromEmail: 'sam.turner@business.net' },
  { subject: 'Need VAT invoice for EU compliance', body: 'Our EU team requires VAT invoices for all transactions. Can you reissue last 6 months invoices with VAT details?', category: 'GENERAL_QUESTION', fromName: 'Tina Mueller', fromEmail: 'tina.mueller@eucompany.de' },
  { subject: 'Mobile app login loop', body: 'The mobile app keeps logging me out and when I log back in, it redirects to login again. Infinite loop.', category: 'TECHNICAL_QUESTION', fromName: 'Uma Singh', fromEmail: 'uma.singh@mobile.com' },
  { subject: 'Subscription paused without notice', body: 'My subscription was paused without any notification. I have active customers and this is unacceptable. Please restore immediately.', category: 'GENERAL_QUESTION', fromName: 'Victor Rao', fromEmail: 'victor.rao@angrycustomer.com' },
  { subject: 'Webhook failing intermittently', body: 'Our webhook endpoint receives events maybe 60% of the time. The rest are silently dropped. No errors in our logs.', category: 'TECHNICAL_QUESTION', fromName: 'Wendy Clark', fromEmail: 'wendy.clark@devteam.io' },
  { subject: 'Trial expired too early', body: 'My 14-day trial expired after only 10 days. I signed up on the 1st and it ended on the 11th. Please extend it.', category: 'REFUND_REQUEST', fromName: 'Xander Lewis', fromEmail: 'xander.lewis@trialuser.com' },
  { subject: 'Cannot change account email', body: 'I want to change my account email from old@email.com to new@email.com but the verification email never arrives.', category: 'TECHNICAL_QUESTION', fromName: 'Yasmin Ahmed', fromEmail: 'yasmin.ahmed@email.com' },
  { subject: 'Billing cycle question', body: 'When does my billing cycle reset? I upgraded mid-month and want to know when the next full charge will be.', category: 'GENERAL_QUESTION', fromName: 'Zack Brown', fromEmail: 'zack.brown@curious.com' },
  { subject: 'Data export failed', body: 'Tried to export 2 years of data but the export fails after a few minutes with a timeout error.', category: 'TECHNICAL_QUESTION', fromName: 'Amy Chen', fromEmail: 'amy.chen@datauser.com' },
  { subject: 'Request to downgrade plan', body: 'We are a smaller team now and want to downgrade from Business to Starter. Will we lose any data?', category: 'GENERAL_QUESTION', fromName: 'Ben Taylor', fromEmail: 'ben.taylor@smallteam.com' },
  { subject: 'Payment method update failing', body: 'Trying to add a new credit card but keep getting "Card declined" even though the card works on other sites.', category: 'TECHNICAL_QUESTION', fromName: 'Cleo Park', fromEmail: 'cleo.park@payment.com' },
  { subject: 'Refund request - service downtime', body: 'Your service was down for 6 hours on April 3rd which caused us significant losses. Requesting a refund for that period.', category: 'REFUND_REQUEST', fromName: 'Derek Nolan', fromEmail: 'derek.nolan@affecteduser.com' },
  { subject: 'How to set up auto-responders', body: 'Can we configure automatic responses for tickets received outside business hours? If so, how?', category: 'GENERAL_QUESTION', fromName: 'Elena Ford', fromEmail: 'elena.ford@business.com' },
  { subject: 'Report generation is slow', body: 'Generating monthly reports takes over 20 minutes. It used to be instant. Did something change recently?', category: 'TECHNICAL_QUESTION', fromName: 'Felix Wong', fromEmail: 'felix.wong@slowreport.com' },
  { subject: 'Accidental account deletion', body: 'I accidentally deleted a sub-account. Is there any way to recover it? It had important customer data.', category: 'GENERAL_QUESTION', fromName: 'Gina Ross', fromEmail: 'gina.ross@accident.com' },
  { subject: 'Invoice in wrong currency', body: 'All my invoices are in USD but I pay in GBP. The exchange rate used seems wrong too. Please reissue in GBP.', category: 'REFUND_REQUEST', fromName: 'Harry James', fromEmail: 'harry.james@uk.com' },
  { subject: 'Integration broken after update', body: 'After your update on May 10th our Zapier integration completely broke. All zaps are failing. Please roll back or fix.', category: 'TECHNICAL_QUESTION', fromName: 'Ivy Stone', fromEmail: 'ivy.stone@zapuser.com' },
  { subject: 'Need training for new staff', body: 'We onboarded 5 new support agents. Do you offer onboarding training sessions or video tutorials?', category: 'GENERAL_QUESTION', fromName: 'Jake Hill', fromEmail: 'jake.hill@newteam.com' },
  { subject: 'Search not returning results', body: 'The search feature returns no results even for terms I know exist in tickets. Feels like indexing is broken.', category: 'TECHNICAL_QUESTION', fromName: 'Kate Morgan', fromEmail: 'kate.morgan@searchfail.com' },
  { subject: 'Pro-rated refund request', body: 'Cancelling after 5 days of a 30-day cycle. Requesting a pro-rated refund for the unused 25 days.', category: 'REFUND_REQUEST', fromName: 'Leo Bennett', fromEmail: 'leo.bennett@prorata.com' },
  { subject: 'Cannot attach files to tickets', body: 'When I try to attach a PDF to a ticket reply, I get an error saying file type not supported. PDFs should be supported.', category: 'TECHNICAL_QUESTION', fromName: 'Maya Cox', fromEmail: 'maya.cox@attachment.com' },
  { subject: 'Request for API documentation', body: 'Your API docs page returns a 404. Where can I find the full API reference? I need the webhooks spec urgently.', category: 'GENERAL_QUESTION', fromName: 'Nathan Reed', fromEmail: 'nathan.reed@developer.io' },
  { subject: 'Overcharged for additional seats', body: 'Added 2 seats but was charged for 5. Please review and refund the difference for 3 extra seats.', category: 'REFUND_REQUEST', fromName: 'Olivia Hunt', fromEmail: 'olivia.hunt@overcharged.com' },
  { subject: 'Performance issues on large datasets', body: 'With over 10,000 tickets the interface is very sluggish. Filtering and sorting takes 10+ seconds.', category: 'TECHNICAL_QUESTION', fromName: 'Peter Shaw', fromEmail: 'peter.shaw@bigdata.com' },
  { subject: 'Question about GDPR compliance', body: 'We are based in Germany. Does your platform comply with GDPR? Where is data stored? We need a DPA agreement.', category: 'GENERAL_QUESTION', fromName: 'Quinn Fischer', fromEmail: 'quinn.fischer@gdpr.de' },
  { subject: 'Report shows incorrect metrics', body: 'The resolution time in reports does not match what I calculate manually. Off by about 20%. Bug?', category: 'TECHNICAL_QUESTION', fromName: 'Rosa Lane', fromEmail: 'rosa.lane@metrics.com' },
  { subject: 'Refund for unused annual plan', body: 'Bought annual plan 2 weeks ago but business needs changed. Requesting refund for remaining 11.5 months.', category: 'REFUND_REQUEST', fromName: 'Steve Grant', fromEmail: 'steve.grant@annual.com' },
  { subject: 'Feature request: dark mode', body: 'Any plans for a dark mode? Working late nights and the bright interface is straining my eyes.', category: 'GENERAL_QUESTION', fromName: 'Tara Fox', fromEmail: 'tara.fox@darkmode.com' },
  { subject: 'Bulk ticket import not working', body: 'Trying to import 500 tickets from CSV but the import fails at row 47 every time with no clear error message.', category: 'TECHNICAL_QUESTION', fromName: 'Ulrich Braun', fromEmail: 'ulrich.braun@import.de' },
  { subject: 'Unexpected charge after free trial', body: 'Was charged $49 right after my trial ended without any warning email. I want to cancel and get a full refund.', category: 'REFUND_REQUEST', fromName: 'Vera Mills', fromEmail: 'vera.mills@surprise.com' },
  { subject: 'How to merge duplicate tickets', body: 'We often get the same issue reported multiple times. Is there a way to merge duplicate tickets?', category: 'GENERAL_QUESTION', fromName: 'Will Stone', fromEmail: 'will.stone@merge.com' },
  { subject: 'Tags not saving on tickets', body: 'When I add tags to a ticket and reload the page, the tags are gone. They are not persisting.', category: 'TECHNICAL_QUESTION', fromName: 'Xena Brooks', fromEmail: 'xena.brooks@tags.com' },
];

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 12) + 8);
  d.setMinutes(Math.floor(Math.random() * 60));
  return d;
}

async function main() {
  const password = await bcrypt.hash('Agent@123456', 12);

  // Seed 7 agents
  const agentUsers = [];
  for (const a of agents) {
    const user = await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: { email: a.email, password, name: a.name, role: 'AGENT' },
    });
    agentUsers.push(user);
    console.log(`Agent ready: ${a.email}`);
  }

  // Seed 2 admins
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  for (const a of admins) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: { email: a.email, password: adminPassword, name: a.name, role: 'ADMIN' },
    });
    console.log(`Admin ready: ${a.email}`);
  }

  // Seed 100 tickets
  let created = 0;
  for (let i = 0; i < 100; i++) {
    const template = ticketTemplates[i % ticketTemplates.length];
    const status = statuses[i % statuses.length];
    const category = template.category;
    const agent = agentUsers[i % agentUsers.length];
    const createdAt = randomDate(60);

    const replies = [];

    if (status === 'PROCESSING' || status === 'RESOLVED' || status === 'CLOSED') {
      replies.push({
        body: `Hi ${template.fromName.split(' ')[0]},\n\nThank you for reaching out. We have received your request and are looking into it. We will get back to you within 24 hours.\n\nBest regards,\n${agent.name}`,
        isAI: false,
        sentViaEmail: true,
        authorId: agent.id,
        createdAt: new Date(createdAt.getTime() + 30 * 60 * 1000),
      });
    }

    if (status === 'RESOLVED' || status === 'CLOSED') {
      replies.push({
        body: `Hi ${template.fromName.split(' ')[0]},\n\nWe have resolved your issue. Please let us know if you need any further assistance.\n\nBest regards,\n${agent.name}`,
        isAI: false,
        sentViaEmail: true,
        authorId: agent.id,
        createdAt: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
      });
    }

    if (status === 'CLOSED') {
      replies.push({
        body: 'Thank you, issue is resolved!',
        isAI: false,
        sentViaEmail: false,
        createdAt: new Date(createdAt.getTime() + 4 * 60 * 60 * 1000),
      });
    }

    await prisma.ticket.create({
      data: {
        subject: template.subject,
        body: template.body,
        fromEmail: template.fromEmail,
        fromName: template.fromName,
        status,
        category,
        aiClassified: i % 3 !== 0,
        source: i % 4 === 0 ? 'EMAIL' : 'MANUAL',
        assignedToId: status !== 'NEW' ? agent.id : undefined,
        createdAt,
        replies: { create: replies },
      },
    });
    created++;
  }

  console.log(`\nDone! Created ${created} tickets, ${agents.length} agents, ${admins.length} admins.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
