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
    console.log("Searching for Russia/Russian/Россия/России in HeroSMS...");
    for (const [id, details] of Object.entries(data)) {
      const d = details as any;
      const eng = d.eng?.toLowerCase() || '';
      const rus = d.rus?.toLowerCase() || '';
      if (eng.includes("rus") || eng.includes("fed") || rus.includes("рос") || rus.includes("русс")) {
        console.log(`Match found: ${id} -> ${d.eng} (${d.rus})`);
      }
    }
  } catch (err: any) {
    console.error("Fetch failed:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
