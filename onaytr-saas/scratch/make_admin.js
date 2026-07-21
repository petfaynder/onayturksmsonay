const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'test12345@onaytr.com';
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  });
  console.log(`Updated user ${user.email} role to ${user.role}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
