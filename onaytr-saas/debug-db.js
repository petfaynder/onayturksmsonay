const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const activeCountries = await prisma.country.findMany({ where: { isActive: true } });
  const activeServices = await prisma.service.findMany({ where: { isActive: true } });
  
  console.log("Active Countries:");
  activeCountries.forEach(c => console.log(c.providerCode));
  
  console.log("\nActive Services:");
  activeServices.forEach(s => console.log(s.providerCode));
}

main().catch(console.error).finally(() => prisma.$disconnect());
