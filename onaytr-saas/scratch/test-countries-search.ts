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
    console.log("Country 170 details:", data["170"]);
    
    // Find Turkey (383 in mapping? Or does SMS-Activate use something else?)
    // Let's search all keys for "Turkey" or "Turkey" in eng or rus
    for (const [id, details] of Object.entries(data)) {
      const d = details as any;
      if (d.eng?.toLowerCase().includes("turkey") || d.rus?.toLowerCase().includes("турция")) {
        console.log(`Turkey found with ID: ${id}`, d);
      }
      if (d.eng?.toLowerCase().includes("russia") || d.rus?.toLowerCase().includes("россия")) {
        console.log(`Russia found with ID: ${id}`, d);
      }
    }
  } catch (err: any) {
    console.error("Fetch failed:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
