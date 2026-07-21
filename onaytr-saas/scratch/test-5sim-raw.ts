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
  console.log("Fetching 5sim prices...");
  const start = Date.now();
  try {
    const prices = await provider.getPrices();
    console.log(`Fetched 5sim prices in ${Date.now() - start}ms`);
    console.log("Sample keys of response:", Object.keys(prices).slice(0, 10));
  } catch (err: any) {
    console.error("Failed to fetch 5sim prices:", err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
