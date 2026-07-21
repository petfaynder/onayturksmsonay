import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.apiProvider.findFirst({
    where: { name: 'herosms' }
  });

  if (!existing) {
    const herosms = await prisma.apiProvider.create({
      data: {
        name: 'herosms',
        apiKey: '',
        isActive: true,
        priority: 2, // 5sim is priority 1, herosms is priority 2
        balance: 0.0
      }
    });
    console.log("HeroSMS provider seeded successfully:", herosms);
  } else {
    console.log("HeroSMS provider already exists in DB");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
