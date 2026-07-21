import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

try {
  const user = await p.user.findFirst();
  console.log('✅ DB OK, first user:', user ? user.email : 'none (empty table)');
} catch (e) {
  console.error('❌ DB ERROR:', e.message);
} finally {
  await p.$disconnect();
}
