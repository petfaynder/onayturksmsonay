const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const provider = await prisma.apiProvider.findFirst({
    where: { name: '5sim', isActive: true }
  });

  if (!provider) {
    console.log("No 5sim provider found");
    return;
  }

  console.log("Found provider:", provider.name);
  
  try {
    const res = await fetch('https://5sim.net/v1/guest/prices?category=hosting', {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Accept': 'application/json'
      }
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Keys returned:", Object.keys(data).slice(0, 10));
    // Print a sample country and product
    const sampleCountry = Object.keys(data)[0];
    if (sampleCountry) {
      console.log(`Sample country (${sampleCountry}) products:`, Object.keys(data[sampleCountry]).slice(0, 5));
      const sampleProduct = Object.keys(data[sampleCountry])[0];
      if (sampleProduct) {
        console.log(`Sample product (${sampleProduct}) data:`, data[sampleCountry][sampleProduct]);
      }
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

main().finally(() => prisma.$disconnect());
