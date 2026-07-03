import { execSync } from 'child_process';
import path from 'path';

export default async function globalSetup() {
  const backendDir = path.resolve(__dirname, '../../backend');

  console.log('Running migrations on test database...');
  execSync('npm run test:db:migrate', {
    cwd: backendDir,
    stdio: 'inherit',
  });

  console.log('Seeding test users...');
  // Use a Node.js inline script with dotenv so that DATABASE_URL from .env.test is loaded.
  // bcryptjs is a CJS package available in the backend node_modules.
  execSync(
    `node -e "
require('dotenv').config({ path: '.env.test' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function seed() {
  const hash = await bcrypt.hash('TestPass123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: { email: 'admin@test.com', name: 'Test Admin', password: hash, role: 'ADMIN' }
  });
  await prisma.user.upsert({
    where: { email: 'agent@test.com' },
    update: {},
    create: { email: 'agent@test.com', name: 'Test Agent', password: hash, role: 'AGENT' }
  });
  await prisma.\$disconnect();
  console.log('Test users seeded: admin@test.com, agent@test.com');
}
seed().catch(e => { console.error(e); process.exit(1); });
"`,
    {
      cwd: backendDir,
      stdio: 'inherit',
      env: { ...process.env },
    }
  );
}
