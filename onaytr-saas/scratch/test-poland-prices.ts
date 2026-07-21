import prisma from '../lib/db';

async function main() {
  const herosmsDb = await prisma.apiProvider.findFirst({
    where: { name: 'herosms' }
  });

  if (!herosmsDb || !herosmsDb.apiKey) {
    console.log("No key found");
    return;
  }

  // Poland is ID 15 in SMS-Activate/HeroSMS
  const url = `https://hero-sms.com/stubs/handler_api.php?api_key=${herosmsDb.apiKey}&action=getPrices&country=15`;
  console.log("Fetching Poland prices from HeroSMS...");
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Poland (15) WhatsApp (wa) raw pricing:", JSON.stringify(data["15"]?.["wa"], null, 2));
  } catch (err: any) {
    console.error("Fetch failed:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
