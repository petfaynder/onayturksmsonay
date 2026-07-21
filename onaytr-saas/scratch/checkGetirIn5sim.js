const prismaClient = require('@prisma/client');
const prisma = new prismaClient.PrismaClient();

async function main() {
  const provider = await prisma.apiProvider.findFirst({
    where: { name: '5sim', isActive: true }
  });
  
  if (!provider) {
    console.log("No active provider");
    return;
  }
  
  const res = await fetch('https://5sim.net/v1/guest/prices', {
    headers: { 'Authorization': `Bearer ${provider.apiKey}` }
  });
  const data = await res.json();
  
  // Search for 'getir' in all countries/products
  let totalGetirCount = 0;
  for (const [country, products] of Object.entries(data)) {
    if (products.getir) {
      for (const [operator, opData] of Object.entries(products.getir)) {
        if (opData.count > 0) {
          totalGetirCount += opData.count;
        }
      }
    }
  }
  console.log("Total 5sim stock for 'getir':", totalGetirCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
