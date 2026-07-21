const prismaClient = require('@prisma/client');
const prisma = new prismaClient.PrismaClient();

async function main() {
  const settings = await prisma.settings.findFirst();
  console.log("Settings globalMargin:", settings?.globalMargin);
}

main().catch(console.error).finally(() => prisma.$disconnect());
