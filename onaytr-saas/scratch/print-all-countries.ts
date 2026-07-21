import prisma from '../lib/db';

async function main() {
  const herosmsDb = await prisma.apiProvider.findFirst({
    where: { name: 'herosms' }
  });

  if (!herosmsDb || !herosmsDb.apiKey) {
    console.log("No key found");
    return;
  }

  const url = `https://hero-sms.com/stubs/handler_api.php?api_key=${herosmsDb.apiKey}&action=getCountries`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("All HeroSMS Countries (ID -> eng):");
    const sorted = Object.entries(data).sort((a,b) => parseInt(a[0]) - parseInt(b[0]));
    for (const [id, details] of sorted) {
      const d = details as any;
      console.log(`${id}: ${d.eng} (${d.rus})`);
    }
  } catch (err: any) {
    console.error("Fetch failed:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
