import prisma from '../lib/db';

async function main() {
  const herosmsDb = await prisma.apiProvider.findFirst({
    where: { name: 'herosms' }
  });

  if (!herosmsDb || !herosmsDb.apiKey) {
    console.log("No key found");
    return;
  }

  const url = `https://hero-sms.com/stubs/handler_api.php?api_key=${herosmsDb.apiKey}&action=getPrices`;
  console.log("Fetching raw URL:", url);
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log("HTTP status:", res.status);
    console.log("Raw response (first 2000 chars):");
    console.log(text.slice(0, 2000));
  } catch (err: any) {
    console.error("Fetch failed:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
