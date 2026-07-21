const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany();
  console.log("Services list:", services.map(s => ({ name: s.name, providerCode: s.providerCode })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
