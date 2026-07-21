const prismaClient = require('@prisma/client');
const prisma = new prismaClient.PrismaClient();

async function main() {
  const provider = await prisma.apiProvider.findFirst({
    where: { name: '5sim', isActive: true }
  });
  
  const res = await fetch('https://5sim.net/v1/guest/prices', {
    headers: { 'Authorization': `Bearer ${provider.apiKey}` }
  });
  const data = await res.json();
  
  const activeCountries = await prisma.country.findMany({ where: { isActive: true } });
  const activeCountryCodes = new Set(activeCountries.map(c => c.providerCode));
  console.log("Total active countries in DB:", activeCountries.length);
  
  let matchCount = 0;
  for (const [country, products] of Object.entries(data)) {
    if (products.getir) {
      let count = 0;
      for (const opData of Object.values(products.getir)) {
        if (opData.count > 0) count += opData.count;
      }
      
      if (count > 0) {
        const isActive = activeCountryCodes.has(country);
        console.log(`Country: ${country} -> Stock: ${count} -> Active in DB: ${isActive}`);
        if (isActive) matchCount++;
      }
    }
  }
  console.log("Countries with Getir stock active in DB:", matchCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
