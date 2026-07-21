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
  
  // Search for turkey and whatsapp
  const turkeyData = prices['turkey'] || {};
  const whatsappData = turkeyData['whatsapp'] || {};
  console.log("5sim Turkey WhatsApp Data:", whatsappData);
  
  // Also print russia whatsapp
  console.log("5sim Russia WhatsApp Data:", prices['russia']?.['whatsapp']);
}

main().catch(console.error).finally(() => prisma.$disconnect());
