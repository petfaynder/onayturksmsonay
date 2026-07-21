const prismaClient = require('@prisma/client');
const prisma = new prismaClient.PrismaClient();

async function main() {
  const provider = await prisma.apiProvider.findFirst({
    where: { name: '5sim', isActive: true }
  });
  
  const res = await fetch('https://5sim.net/v1/guest/prices', {
    headers: { 'Authorization': `Bearer ${provider.apiKey}` }
  });
  const rawPrices = await res.json();
  
  const globalMargin = 50; // default
  const activeCountries = await prisma.country.findMany({ where: { isActive: true } });
  const activeServices = await prisma.service.findMany({ where: { isActive: true } });
  
  const activeCountryMap = new Map(activeCountries.map(c => [c.providerCode, c]));
  const activeServiceMap = new Map(activeServices.map(s => [s.providerCode, s]));
  
  const exchangeRate = 46.98;
  
  const appsMap = new Map();
  
  for (const [country, products] of Object.entries(rawPrices)) {
    const dbCountry = activeCountryMap.get(country);
    if (!dbCountry) continue;
    
    for (const [product, operators] of Object.entries(products)) {
      if (product !== 'getir') continue; // only check getir
      
      const dbService = activeServiceMap.get(product);
      if (!dbService) continue;
      
      let productMinPrice = Infinity;
      let productTotalCount = 0;
      
      for (const [operator, data] of Object.entries(operators)) {
        if (data.count > 0) {
          const marginToUse = dbService.globalMargin ?? dbCountry.globalMargin ?? globalMargin;
          const costTry = data.cost * exchangeRate;
          const sellTry = costTry * (1 + (marginToUse / 100));
          const finalPrice = Number(sellTry.toFixed(2));
          
          if (finalPrice < productMinPrice) productMinPrice = finalPrice;
          productTotalCount += data.count;
        }
      }
      
      if (productTotalCount > 0) {
        const existingApp = appsMap.get(product) || { count: 0, minPrice: Infinity };
        const newMinPrice = Math.min(existingApp.minPrice, productMinPrice);
        
        console.log(`Country: ${country} -> productMinPrice: ${productMinPrice} -> newMinPrice: ${newMinPrice}`);
        
        appsMap.set(product, {
          count: existingApp.count + productTotalCount,
          minPrice: newMinPrice
        });
      }
    }
  }
  
  console.log("Final Getir in appsMap:", appsMap.get('getir'));
}

main().catch(console.error).finally(() => prisma.$disconnect());
