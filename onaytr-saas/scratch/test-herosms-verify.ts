import prisma from '../lib/db';
import { SYSTEM_TO_HEROSMS_COUNTRY, SYSTEM_TO_HEROSMS_SERVICE } from '../lib/utils/mappings';

async function main() {
  const herosmsDb = await prisma.apiProvider.findFirst({
    where: { name: 'herosms' }
  });

  if (!herosmsDb?.apiKey) {
    console.log("No key found");
    return;
  }

  console.log("Fetching ALL HeroSMS prices...");
  const url = `https://hero-sms.com/stubs/handler_api.php?api_key=${herosmsDb.apiKey}&action=getPrices`;
  const res = await fetch(url);
  const text = await res.text();
  const rawPrices = JSON.parse(text);

  // Check France specifically (should be ID 78)
  const franceId = SYSTEM_TO_HEROSMS_COUNTRY['france'];
  const whatsappCode = SYSTEM_TO_HEROSMS_SERVICE['whatsapp'];
  const telegramCode = SYSTEM_TO_HEROSMS_SERVICE['telegram'];

  console.log(`\nMapped France ID: ${franceId}, WhatsApp code: ${whatsappCode}, Telegram code: ${telegramCode}`);
  
  const franceData = rawPrices[franceId];
  if (franceData) {
    console.log(`France (${franceId}) WhatsApp (${whatsappCode}):`, franceData[whatsappCode]);
    console.log(`France (${franceId}) Telegram (${telegramCode}):`, franceData[telegramCode]);
    console.log(`France (${franceId}) Instagram (ig):`, franceData['ig']);
  } else {
    console.log(`France ID ${franceId} not found in response!`);
    // Show what IDs exist
    console.log("All available country IDs:", Object.keys(rawPrices).join(", "));
  }

  // Check known IDs directly
  console.log("\n--- Direct ID Checks ---");
  // France is 78 in sms-activate standard
  const direct78 = rawPrices["78"];
  console.log("Direct ID 78 (France):", direct78 ? `Has ${Object.keys(direct78).length} services` : "NOT FOUND");
  if (direct78) {
    console.log("  wa:", direct78["wa"]);
  }

  // Also check Turkey (62) and see what prices we're actually fetching
  const turkeyId = SYSTEM_TO_HEROSMS_COUNTRY['turkey'];
  console.log(`\nMapped Turkey ID: ${turkeyId}`);
  const turkeyDirect = rawPrices[turkeyId];
  if (turkeyDirect) {
    console.log(`Turkey ID ${turkeyId} wa:`, turkeyDirect["wa"]);
    console.log(`Turkey ID ${turkeyId} tg:`, turkeyDirect["tg"]);
    console.log(`Turkey ID ${turkeyId} ig:`, turkeyDirect["ig"]);
  } else {
    console.log(`Turkey ID ${turkeyId} NOT FOUND`);
    // try 62 directly
    const turkey62 = rawPrices["62"];
    console.log("Direct ID 62 (Turkey):", turkey62 ? `Has ${Object.keys(turkey62).length} services` : "NOT FOUND");
    if (turkey62) {
      console.log("  wa:", turkey62["wa"]);
    }
  }

  // Print our full mappings for major countries
  const majorCountries = ['turkey', 'france', 'germany', 'russia', 'usa', 'england', 'poland', 'ukraine', 'india'];
  console.log("\n--- Country ID Mappings Verification ---");
  for (const country of majorCountries) {
    const heroId = SYSTEM_TO_HEROSMS_COUNTRY[country];
    const exists = heroId !== undefined && rawPrices[heroId] !== undefined;
    const serviceCount = exists ? Object.keys(rawPrices[heroId]).length : 0;
    console.log(`${country} -> heroId: ${heroId} -> exists: ${exists} (${serviceCount} services)`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
