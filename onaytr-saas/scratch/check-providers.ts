import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const providers = await prisma.apiProvider.findMany();
  console.log("Providers in DB:", providers);
}

main().catch(console.error).finally(() => prisma.$disconnect());
