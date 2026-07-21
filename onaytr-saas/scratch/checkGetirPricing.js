const prismaClient = require('@prisma/client');
const prisma = new prismaClient.PrismaClient();

async function main() {
  // Let's check all services containing "getir"
  const services = await prisma.service.findMany({
    where: {
      name: { contains: 'getir' }
    }
  });
  console.log("Services:", services.map(s => ({ id: s.id, name: s.name, isActive: s.isActive })));
  
  // Let's fetch the /api/pricing response format
  // We can simulate the API endpoint logic from app/api/pricing/route.ts
  const activeServices = await prisma.service.findMany({
    where: { isActive: true }
  });
  console.log("Total active services in DB:", activeServices.length);
  const getirActive = activeServices.find(s => s.name.toLowerCase().includes('getir'));
  console.log("Getir in active services:", getirActive);
}

main().catch(console.error).finally(() => prisma.$disconnect());
