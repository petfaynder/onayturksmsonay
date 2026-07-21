const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const country = await prisma.country.findFirst();
  console.log("Country Model sample:", country);
}

main().catch(console.error).finally(() => prisma.$disconnect());
