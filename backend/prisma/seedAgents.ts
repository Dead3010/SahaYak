import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const AGENTS_PER_TEAM = 2;
const DEFAULT_PASSWORD = 'Agent@123456';

const AGENT_NAMES = [
  'Alex Kumar',     'Priya Singh',   'Rahul Sharma',   'Anjali Mehta',
  'Dev Patel',      'Neha Gupta',    'Arjun Nair',     'Kavya Reddy',
  'Vikram Joshi',   'Shreya Iyer',   'Amit Verma',     'Pooja Thakur',
  'Rohan Das',      'Sunita Rao',    'Kiran Malhotra', 'Deepa Pillai',
  'Sanjay Bhat',    'Maya Kulkarni', 'Nikhil Saxena',  'Riya Chopra',
  'Aditya Mishra',  'Divya Nair',    'Sameer Khan',    'Tanvi Shah',
  'Rajesh Tiwari',  'Ananya Bose',   'Suresh Yadav',   'Meera Agarwal',
  'Vivek Chatterjee', 'Ishita Roy',
];

const categorySlug = (cat: string) => {
  if (cat === 'GENERAL_QUESTION') return 'general';
  if (cat === 'TECHNICAL_QUESTION') return 'technical';
  return 'refund';
};

async function main() {
  const teams = await prisma.team.findMany({ include: { members: true } });

  if (teams.length === 0) {
    console.log('No teams found. Create teams first from the app.');
    return;
  }

  console.log(`Found ${teams.length} teams. Ensuring ${AGENTS_PER_TEAM} agents per team...\n`);

  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  let nameIndex = 0;
  let created = 0;

  for (const team of teams) {
    const existingAgents = team.members.filter((m) => m.role === Role.AGENT);
    const needed = Math.max(0, AGENTS_PER_TEAM - existingAgents.length);

    if (needed === 0) {
      console.log(`[SKIP] "${team.name}" — already has ${existingAgents.length} agent(s)`);
      continue;
    }

    const productSlug = team.product.toLowerCase();
    const catSlug = categorySlug(team.category);

    for (let i = existingAgents.length + 1; i <= AGENTS_PER_TEAM; i++) {
      const email = `agent.${productSlug}.${catSlug}.${i}@helpdesk.com`;
      const name = AGENT_NAMES[nameIndex % AGENT_NAMES.length];
      nameIndex++;

      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) {
        if (!exists.teamId) {
          await prisma.user.update({ where: { id: exists.id }, data: { teamId: team.id } });
          console.log(`[ASSIGN] ${name} (${email}) → "${team.name}"`);
        } else {
          console.log(`[EXISTS] ${email} already in a team — skipping`);
        }
        continue;
      }

      await prisma.user.create({
        data: { email, password: hashed, name, role: Role.AGENT, teamId: team.id },
      });
      console.log(`[CREATE] ${name} (${email}) → "${team.name}"`);
      created++;
    }
  }

  console.log(`\nDone! Created ${created} new agent(s). Password for all: ${DEFAULT_PASSWORD}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
