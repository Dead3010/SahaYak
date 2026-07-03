const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hashed = await bcrypt.hash('yash3010', 12);
  const user = await prisma.user.upsert({
    where: { email: 'Mishraji@helpdesk.com' },
    update: {},
    create: { email: 'Mishraji@helpdesk.com', password: hashed, name: 'Enjay', role: 'ADMIN' }
  });
  console.log('Admin ready:', user.email);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
