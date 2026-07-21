import prisma from '../lib/db';
import { GET } from '../app/api/pricing/route';

async function main() {
  console.log("Calling pricing API GET handler...");
  const response = await GET();
  const data = await response.json();
  
  const detailedPricing = data.detailedPricing || {};
  let heroCount = 0;
  let fiveSimCount = 0;
  let samplePrices: any[] = [];
  
  for (const [countryCode, services] of Object.entries(detailedPricing)) {
    for (const [serviceCode, details] of Object.entries(services as any)) {
      const ops = (details as any).operators;
      if (ops) {
        for (const [opName, opDetails] of Object.entries(ops)) {
          const provider = (opDetails as any).provider;
          if (provider === 'herosms') {
            heroCount++;
          } else if (provider === '5sim') {
            fiveSimCount++;
          }
          samplePrices.push({
            countryCode,
            serviceCode,
            provider,
            price: (opDetails as any).priceTry,
            costUsd: (opDetails as any).costUsd,
            count: (opDetails as any).count
          });
        }
      }
    }
  }

  console.log(`Total active items in catalog: ${samplePrices.length}`);
  console.log(`- 5Sim items: ${fiveSimCount}`);
  console.log(`- HeroSMS items: ${heroCount}`);
  console.log("\nSample items (first 15):");
  console.table(samplePrices.slice(0, 15));

  // Let's find some HeroSMS items specifically to check their pricing
  const heroSamples = samplePrices.filter(p => p.provider === 'herosms');
  console.log(`\nSample HeroSMS items (first 15):`);
  console.table(heroSamples.slice(0, 15));
}

main().catch(console.error);
