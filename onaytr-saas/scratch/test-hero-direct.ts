import prisma from '../lib/db';
import { HeroSmsProvider } from '../lib/providers/herosms';

async function main() {
  const herosmsDb = await prisma.apiProvider.findFirst({
    where: { name: 'herosms' }
  });

  if (!herosmsDb) {
    console.log("No herosms provider found");
    return;
  }

  console.log("HeroSMS DB entry found:");
  console.log(`- ID: ${herosmsDb.id}`);
  console.log(`- API Key length: ${herosmsDb.apiKey.length}`);
  console.log(`- API Key value: "${herosmsDb.apiKey}"`);
  console.log(`- IsActive: ${herosmsDb.isActive}`);
  
  if (!herosmsDb.apiKey) {
    console.log("API Key is empty, skipping live fetch");
    return;
  }

  console.log("Calling getBalance()...");
  try {
    const provider = new HeroSmsProvider(herosmsDb.apiKey);
    const balance = await provider.getBalance();
    console.log("Balance result:", balance);
  } catch (err: any) {
    console.error("getBalance failed:", err.message);
  }

  console.log("Calling getPrices(0, 'wa')...");
  try {
    const provider = new HeroSmsProvider(herosmsDb.apiKey);
    const prices = await provider.getPrices(0, 'wa');
    console.log("Prices for country 0, service wa (sample keys):", Object.keys(prices).slice(0, 10));
    console.log("Sample details:", JSON.stringify(prices, null, 2).slice(0, 500));
  } catch (err: any) {
    console.error("getPrices failed:", err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
