import { FiveSimProvider } from '../lib/providers/5sim';
import prisma from '../lib/db';

async function main() {
  const fiveSimDb = await prisma.apiProvider.findFirst({
    where: { name: '5sim' }
  });

  if (!fiveSimDb) {
    console.log("No 5sim db entry");
    return;
  }

  const provider = new FiveSimProvider(fiveSimDb.apiKey);
  const prices = await provider.getPrices();
  
  const afg = prices['afghanistan'] || {};
  const afgKeys = Object.keys(afg);
  console.log("Afghanistan services keys length:", afgKeys.length);
  console.log("Sample services:", afgKeys.slice(0, 10));
  
  // Print details for first service in afghanistan
  if (afgKeys.length > 0) {
    console.log(`Details for afghanistan['${afgKeys[0]}']:`, afg[afgKeys[0]]);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
