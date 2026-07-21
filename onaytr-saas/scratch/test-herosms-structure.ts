import prisma from '../lib/db';

async function main() {
  const herosmsDb = await prisma.apiProvider.findFirst({
    where: { name: 'herosms' }
  });

  if (!herosmsDb?.apiKey) {
    console.log("No key found");
    return;
  }

  // getPrices with NO country filter - what does the full response look like?
  const url = `https://hero-sms.com/stubs/handler_api.php?api_key=${herosmsDb.apiKey}&action=getPrices`;
  console.log("Fetching ALL HeroSMS prices (no filter)...");
  const res = await fetch(url);
  const text = await res.text();
  const data = JSON.parse(text);

  // Check structure: is it { countryId: { serviceCode: { cost, count, ... } } } ?
  const topKeys = Object.keys(data);
  console.log("Top-level keys (first 10):", topKeys.slice(0, 10));
  console.log("Is a numeric ID?", !isNaN(Number(topKeys[0])));

  // Show the structure for country "15" (Poland)
  const poland = data["15"];
  if (poland) {
    const services = Object.keys(poland);
    console.log(`\nPoland (15) has ${services.length} services`);
    console.log("Sample services:", services.slice(0, 10));
    // Show WhatsApp (wa)
    console.log("Poland 'wa' (WhatsApp):", poland["wa"]);
    // Show a few more
    console.log("Poland 'tg' (Telegram):", poland["tg"]);
    console.log("Poland 'ig' (Instagram):", poland["ig"]);
  } else {
    console.log("Poland (15) not found in response");
    console.log("All country IDs:", topKeys.join(", "));
  }

  // Also check France - ID 78
  const france = data["78"];
  if (france) {
    console.log("\nFrance (78) 'wa' (WhatsApp):", france["wa"]);
    console.log("France (78) 'tg' (Telegram):", france["tg"]);
  }

  // Check if there's also an operator breakdown structure
  const firstKey = topKeys[0];
  const firstCountry = data[firstKey];
  const firstService = Object.keys(firstCountry)[0];
  console.log(`\nStructure of data["${firstKey}"]["${firstService}"]:`);
  console.log(JSON.stringify(firstCountry[firstService], null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
