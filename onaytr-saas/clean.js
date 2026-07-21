const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.apiProvider.deleteMany();
  console.log("Deleted all api providers.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
