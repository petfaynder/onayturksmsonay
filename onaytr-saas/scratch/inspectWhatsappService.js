const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const service = await prisma.service.findFirst({
    where: { name: { contains: 'whatsapp' } }
  });
  console.log("WhatsApp Service in DB:", service);
}

main().catch(console.error).finally(() => prisma.$disconnect());
