const prismaClient = require('@prisma/client');
const prisma = new prismaClient.PrismaClient();
const { FiveSimProvider } = require('../lib/providers/5sim');

async function main() {
  const provider = await prisma.apiProvider.findFirst({
    where: { name: '5sim', isActive: true }
  });

  const fiveSim = new FiveSimProvider(provider.apiKey);
  console.log("Measuring 5sim getPrices() duration...");
  const start = Date.now();
  try {
    const rawPrices = await fiveSim.getPrices();
    const duration = Date.now() - start;
    console.log(`Success! Duration: ${duration}ms. Keys count: ${Object.keys(rawPrices).length}`);
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`Failed after ${duration}ms:`, err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
