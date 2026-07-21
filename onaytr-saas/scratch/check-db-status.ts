import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const serviceCount = await prisma.service.count();
  const activeServiceCount = await prisma.service.count({ where: { isActive: true } });
  
  const countryCount = await prisma.country.count();
  const activeCountryCount = await prisma.country.count({ where: { isActive: true } });
  
  const providers = await prisma.apiProvider.findMany();
  
  console.log({
    serviceCount,
    activeServiceCount,
    countryCount,
    activeCountryCount,
    providers: providers.map(p => ({ name: p.name, isActive: p.isActive, hasKey: !!p.apiKey, balance: p.balance }))
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
