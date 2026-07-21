import prisma from '../lib/db';

async function main() {
  const herosmsDb = await prisma.apiProvider.findFirst({
    where: { name: 'herosms' }
  });

  if (!herosmsDb || !herosmsDb.apiKey) {
    console.log("No key found");
    return;
  }

  const url = `https://hero-sms.com/stubs/handler_api.php?api_key=${herosmsDb.apiKey}&action=getPrices&country=62`;
  console.log("Fetching Turkey prices from HeroSMS...");
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Turkey (62) raw prices:", JSON.stringify(data["62"], null, 2));
  } catch (err: any) {
    console.error("Fetch failed:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
