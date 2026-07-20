// Deletes all tickets/replies and creates fresh product-specific tickets
// Run: node reset-and-seed-tickets.js

require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const statuses   = ['NEW', 'OPEN', 'PROCESSING', 'RESOLVED', 'CLOSED'];

const tickets = [
  // ─── SahaYak ───────────────────────────────────────────────────────────────
  {
    product: 'SAHAYAK',
    subject: 'AI suggestions not showing in my dashboard',
    body: 'Hi,\n\nI upgraded to the Pro plan last week but the AI suggestion panel on my dashboard is completely blank. All my teammates can see theirs fine.\n\nPlease help!\n\nRegards,\nRohit Mehta',
    category: 'TECHNICAL_QUESTION', priority: 'HIGH', status: 'OPEN',
    fromName: 'Rohit Mehta', fromEmail: 'rohit.mehta@company.in',
  },
  {
    product: 'SAHAYAK',
    subject: 'How do I connect my WhatsApp Business account?',
    body: 'Hello,\n\nI want to integrate my WhatsApp Business number with SahaYak so customers can raise tickets directly from WhatsApp. Can you guide me through the setup?\n\nThanks,\nPriya Nair',
    category: 'GENERAL_QUESTION', priority: 'MEDIUM', status: 'NEW',
    fromName: 'Priya Nair', fromEmail: 'priya.nair@startup.io',
  },
  {
    product: 'SAHAYAK',
    subject: 'Charged for Pro plan but still on Free',
    body: 'Hello Support,\n\nI was charged ₹2,999 for the SahaYak Pro plan on 15th July but my account still shows Free tier. Please either activate Pro or refund the amount.\n\nTransaction ID: TXN-SA-8821\n\nRegards,\nAmit Shah',
    category: 'REFUND_REQUEST', priority: 'URGENT', status: 'PROCESSING',
    fromName: 'Amit Shah', fromEmail: 'amit.shah@biz.com',
  },
  {
    product: 'SAHAYAK',
    subject: 'Auto-resolve feature sending wrong replies',
    body: 'The AI auto-resolve is sending generic replies that don\'t match the customer\'s question at all. For example, a customer asked about billing and got a reply about technical setup.\n\nThis is damaging our brand. Please fix urgently.',
    category: 'TECHNICAL_QUESTION', priority: 'URGENT', status: 'OPEN',
    fromName: 'Kavya Reddy', fromEmail: 'kavya.reddy@agency.com',
  },
  {
    product: 'SAHAYAK',
    subject: 'Need to add 10 more agent seats',
    body: 'Hi,\n\nOur team is growing and we need to add 10 more agent seats to our current SahaYak plan. What are the pricing options? Can we get a volume discount?\n\nBest,\nSandeep Kumar',
    category: 'GENERAL_QUESTION', priority: 'LOW', status: 'RESOLVED',
    fromName: 'Sandeep Kumar', fromEmail: 'sandeep.kumar@enterprise.in',
  },
  {
    product: 'SAHAYAK',
    subject: 'Email tickets not being pulled from Gmail',
    body: 'We set up Gmail integration 2 days ago but no email tickets are being created. We have verified the App Password and IMAP is enabled.\n\nGmail: support@ourcompany.com',
    category: 'TECHNICAL_QUESTION', priority: 'HIGH', status: 'NEW',
    fromName: 'Neha Joshi', fromEmail: 'neha.joshi@ourcompany.com',
  },

  // ─── Sangam ────────────────────────────────────────────────────────────────
  {
    product: 'SANGAM',
    subject: 'Video calls are dropping after 10 minutes',
    body: 'Hi Sangam Support,\n\nEvery video call on Sangam drops exactly around the 10-minute mark. Both parties get disconnected simultaneously. This is happening consistently for the last 3 days.\n\nBrowser: Chrome 126\nOS: Windows 11',
    category: 'TECHNICAL_QUESTION', priority: 'HIGH', status: 'OPEN',
    fromName: 'Arjun Sharma', fromEmail: 'arjun.sharma@remote.co',
  },
  {
    product: 'SANGAM',
    subject: 'How to schedule a recurring team meeting?',
    body: 'Hello,\n\nIs there a way to schedule a recurring weekly meeting in Sangam? I can only see one-time meeting options. Our team has a Monday standup every week.\n\nThank you,\nDivya Pillai',
    category: 'GENERAL_QUESTION', priority: 'LOW', status: 'RESOLVED',
    fromName: 'Divya Pillai', fromEmail: 'divya.pillai@team.io',
  },
  {
    product: 'SANGAM',
    subject: 'Refund request for unused annual plan',
    body: 'We purchased an annual Sangam Team plan in January but our company has switched to another tool. We have only used it for 2 months. Requesting a refund for the remaining 10 months.\n\nAccount: sangam-team-442\nAmount paid: ₹18,000',
    category: 'REFUND_REQUEST', priority: 'HIGH', status: 'PROCESSING',
    fromName: 'Rohan Das', fromEmail: 'rohan.das@pivot.in',
  },
  {
    product: 'SANGAM',
    subject: 'Screen share not working on Mac',
    body: 'Screen sharing is completely broken on Mac. I click "Share Screen", grant permissions, but the other participants see only a black screen. Tried restarting, reinstalling — nothing works.\n\nMac M2, macOS Sonoma 14.4',
    category: 'TECHNICAL_QUESTION', priority: 'MEDIUM', status: 'NEW',
    fromName: 'Meera Krishnan', fromEmail: 'meera.k@design.studio',
  },
  {
    product: 'SANGAM',
    subject: 'Meeting recordings not available after session ends',
    body: 'We recorded a 2-hour client presentation yesterday but the recording is not showing in our dashboard. The recording indicator was on during the meeting. This is critical — our client needs this recording.\n\nMeeting ID: SGM-20260718-4421',
    category: 'TECHNICAL_QUESTION', priority: 'URGENT', status: 'OPEN',
    fromName: 'Vikram Singhania', fromEmail: 'vikram.s@consultancy.com',
  },
  {
    product: 'SANGAM',
    subject: 'Can Sangam support 500 participants?',
    body: 'We are planning a company-wide all-hands for 500 employees. Does Sangam support this? What plan do we need and what is the pricing?\n\nBest,\nHR Team',
    category: 'GENERAL_QUESTION', priority: 'MEDIUM', status: 'NEW',
    fromName: 'Sunita Agarwal', fromEmail: 'sunita.hr@bigcompany.co.in',
  },

  // ─── Sanchay ───────────────────────────────────────────────────────────────
  {
    product: 'SANCHAY',
    subject: 'SIP transactions showing wrong NAV',
    body: 'Hi,\n\nThe NAV shown for my SIP transactions in Sanchay is different from what is published on AMFI website. The difference is ₹2-3 per unit which matters at scale.\n\nFund: HDFC Mid Cap Opportunities\nDate: 18 July 2026',
    category: 'TECHNICAL_QUESTION', priority: 'HIGH', status: 'OPEN',
    fromName: 'Rakesh Gupta', fromEmail: 'rakesh.gupta@investor.in',
  },
  {
    product: 'SANCHAY',
    subject: 'How to link my Zerodha account with Sanchay?',
    body: 'Hello,\n\nI want to import my existing Zerodha portfolio into Sanchay for tracking. Is there an integration available? If yes, what data will be synced?\n\nThanks,\nAnanya Bose',
    category: 'GENERAL_QUESTION', priority: 'LOW', status: 'RESOLVED',
    fromName: 'Ananya Bose', fromEmail: 'ananya.bose@finance.me',
  },
  {
    product: 'SANCHAY',
    subject: 'Charged twice for Sanchay Premium',
    body: 'My bank statement shows two deductions of ₹999 on 1st July for Sanchay Premium. I should have been charged only once. Please refund the duplicate payment.\n\nAccount: ankit.verma@gmail.com\nBank ref: HDFC-2026070122341',
    category: 'REFUND_REQUEST', priority: 'HIGH', status: 'NEW',
    fromName: 'Ankit Verma', fromEmail: 'ankit.verma@gmail.com',
  },
  {
    product: 'SANCHAY',
    subject: 'Tax P&L report showing incorrect STCG/LTCG',
    body: 'The tax P&L report for FY 2025-26 is showing incorrect Short-Term Capital Gains figures. The STCG amount shown is ₹45,000 but my actual gains are negative (loss of ₹12,000). This is urgent as I need this for ITR filing.\n\nPlease fix immediately.',
    category: 'TECHNICAL_QUESTION', priority: 'URGENT', status: 'PROCESSING',
    fromName: 'Sundar Iyer', fromEmail: 'sundar.iyer@ca.in',
  },
  {
    product: 'SANCHAY',
    subject: 'Can I track US stocks on Sanchay?',
    body: 'Hi team,\n\nDo you support tracking of US-listed stocks like Apple, Tesla etc.? I invest through Vested and want to track everything in one place.\n\nAlso, would the currency conversion be automatic?\n\nThanks',
    category: 'GENERAL_QUESTION', priority: 'LOW', status: 'NEW',
    fromName: 'Farhan Khan', fromEmail: 'farhan.khan@globalinvestor.com',
  },
  {
    product: 'SANCHAY',
    subject: 'Portfolio sync stuck on "Loading" for 2 days',
    body: 'My portfolio hasn\'t synced since 16th July. The page shows "Syncing..." forever. I have tried logging out and back in, clearing cache, different browsers — nothing works. I cannot see my current holdings.\n\nUser ID: SCH-USER-9921',
    category: 'TECHNICAL_QUESTION', priority: 'HIGH', status: 'OPEN',
    fromName: 'Pooja Mathur', fromEmail: 'pooja.mathur@wealth.in',
  },

  // ─── Sugam ─────────────────────────────────────────────────────────────────
  {
    product: 'SUGAM',
    subject: 'GST invoice generation failing',
    body: 'Hi,\n\nWe are unable to generate GST invoices on Sugam since this morning. Clicking "Generate Invoice" shows a spinner and then throws a generic error. We have 50+ invoices pending for the month end.\n\nBusiness GSTIN: 27AABCU9603R1Z1',
    category: 'TECHNICAL_QUESTION', priority: 'URGENT', status: 'OPEN',
    fromName: 'Chirag Shah', fromEmail: 'chirag.shah@tradehouse.co.in',
  },
  {
    product: 'SUGAM',
    subject: 'How to add multiple GST rates to a single invoice?',
    body: 'Hello,\n\nIs it possible to add line items with different GST rates (5%, 12%, 18%) in a single invoice on Sugam? Currently when I try to add a second rate it replaces the first one.\n\nPlease guide.',
    category: 'GENERAL_QUESTION', priority: 'MEDIUM', status: 'RESOLVED',
    fromName: 'Ritu Agarwal', fromEmail: 'ritu.agarwal@shop.in',
  },
  {
    product: 'SUGAM',
    subject: 'Refund for 6 months prepaid subscription',
    body: 'We are shutting down our business and need to cancel our Sugam subscription. We prepaid for 6 months (₹5,994) but have only used 1 month. Requesting refund for remaining 5 months.\n\nAccount ID: SUGAM-BIZ-3312',
    category: 'REFUND_REQUEST', priority: 'HIGH', status: 'NEW',
    fromName: 'Deepak Pandey', fromEmail: 'deepak.pandey@closedbiz.in',
  },
  {
    product: 'SUGAM',
    subject: 'e-Invoice not getting registered on IRP',
    body: 'We are generating invoices on Sugam but they are not getting IRN (Invoice Reference Number) from the IRP portal. This is mandatory for us as our turnover exceeds ₹10 Cr. Getting error: "GSTIN not found in IRP database".',
    category: 'TECHNICAL_QUESTION', priority: 'URGENT', status: 'PROCESSING',
    fromName: 'Manish Jain', fromEmail: 'manish.jain@largefirm.in',
  },
  {
    product: 'SUGAM',
    subject: 'Can Sugam export data to Tally?',
    body: 'Hello,\n\nOur accountant uses Tally for bookkeeping. Is there a way to export Sugam invoice data to Tally format (XML or CSV)? This would save us a lot of manual data entry.\n\nThanks,\nAccountant at Verma Traders',
    category: 'GENERAL_QUESTION', priority: 'LOW', status: 'NEW',
    fromName: 'Sanjay Verma', fromEmail: 'sanjay.verma@vermatraders.in',
  },
  {
    product: 'SUGAM',
    subject: 'Customer GSTIN validation always failing',
    body: 'Whenever we try to add a new customer with their GSTIN, Sugam shows "Invalid GSTIN" even though we have verified it on the GST portal. This is happening for multiple customers. Are your GSTIN validation APIs down?\n\nExample GSTIN: 06BZAHM6385P6Z2',
    category: 'TECHNICAL_QUESTION', priority: 'HIGH', status: 'NEW',
    fromName: 'Kavitha Menon', fromEmail: 'kavitha.m@billing.co.in',
  },

  // ─── Synapse ────────────────────────────────────────────────────────────────
  {
    product: 'SYNAPSE',
    subject: 'Model training job stuck at 0% for 6 hours',
    body: 'Hi Synapse team,\n\nI started a fine-tuning job on a 7B parameter model at 10 AM and it has been showing 0% progress for 6 hours now. The job status shows "Running" but nothing is happening. GPU credits are being consumed.\n\nJob ID: SYN-JOB-8841\nModel: Llama-3-7B',
    category: 'TECHNICAL_QUESTION', priority: 'URGENT', status: 'OPEN',
    fromName: 'Aditya Rao', fromEmail: 'aditya.rao@ailab.io',
  },
  {
    product: 'SYNAPSE',
    subject: 'What is the rate limit for the inference API?',
    body: 'Hello,\n\nWe are building a production app on top of Synapse inference API. What are the rate limits per minute/hour for the Pro plan? We expect around 500 requests/minute at peak.\n\nAlso, is there an enterprise tier with higher limits?\n\nBest,\nDev Team',
    category: 'GENERAL_QUESTION', priority: 'MEDIUM', status: 'RESOLVED',
    fromName: 'Ishaan Malhotra', fromEmail: 'ishaan.m@devstudio.io',
  },
  {
    product: 'SYNAPSE',
    subject: 'Refund for failed GPU job that was billed',
    body: 'A GPU training job failed after 2 minutes due to an OOM error on your infrastructure, but I was still billed for 2 hours of A100 compute (₹4,200). Since the failure was on your end, I should not be charged. Please refund.\n\nJob ID: SYN-JOB-7723\nDate: 17 July 2026',
    category: 'REFUND_REQUEST', priority: 'HIGH', status: 'PROCESSING',
    fromName: 'Tanvir Ahmed', fromEmail: 'tanvir.ahmed@mlops.in',
  },
  {
    product: 'SYNAPSE',
    subject: 'API returning 500 errors intermittently',
    body: 'Our production app is getting 500 Internal Server Error from the Synapse inference endpoint about 5-8% of the time. No pattern to when it happens. Our fallback handles it but this is affecting user experience.\n\nEndpoint: /v1/inference/complete\nModel: synapse-7b-chat',
    category: 'TECHNICAL_QUESTION', priority: 'HIGH', status: 'OPEN',
    fromName: 'Preethi Srinivasan', fromEmail: 'preethi.s@prodapp.com',
  },
  {
    product: 'SYNAPSE',
    subject: 'How to use custom datasets for RAG pipeline?',
    body: 'Hi,\n\nI want to set up a RAG pipeline on Synapse using our internal company documents (PDFs). Can you guide me on:\n1. How to upload and index documents\n2. Supported file formats\n3. Embedding model options\n\nThank you!',
    category: 'GENERAL_QUESTION', priority: 'LOW', status: 'NEW',
    fromName: 'Rajan Nambiar', fromEmail: 'rajan.n@dataengineer.io',
  },
  {
    product: 'SYNAPSE',
    subject: 'Model outputs are hallucinating factual data',
    body: 'The fine-tuned model we deployed on Synapse is confidently generating wrong information about our product. We fine-tuned it on our documentation but it is mixing it with fictional data. This is going live to customers — critical issue.\n\nDeployment ID: SYN-DEPLOY-2291',
    category: 'TECHNICAL_QUESTION', priority: 'URGENT', status: 'NEW',
    fromName: 'Nisha Kapoor', fromEmail: 'nisha.kapoor@aiproduct.co',
  },
];

async function main() {
  console.log('🗑️  Deleting all replies and tickets...');
  await prisma.reply.deleteMany({});
  await prisma.ticket.deleteMany({});
  console.log('✅ All tickets deleted.\n');

  console.log(`🌱 Creating ${tickets.length} product-specific tickets...\n`);

  for (const t of tickets) {
    const ticket = await prisma.ticket.create({
      data: {
        subject:    t.subject,
        body:       t.body,
        category:   t.category,
        priority:   t.priority,
        status:     t.status,
        product:    t.product,
        fromName:   t.fromName,
        fromEmail:  t.fromEmail,
        source:     'EMAIL',
        aiClassified: true,
      },
    });
    console.log(`  ✓ [${t.product}] ${t.subject.slice(0, 60)}`);
  }

  const total = await prisma.ticket.count();
  console.log(`\n✅ Done! ${total} tickets created.`);
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
