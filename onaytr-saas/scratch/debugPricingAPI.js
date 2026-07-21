const prismaClient = require('@prisma/client');
const prisma = new prismaClient.PrismaClient();

async function main() {
  console.log("Debugging Pricing API logic...");
  
  // 1. Get Provider
  const provider = await prisma.apiProvider.findFirst({
    where: { name: '5sim', isActive: true }
  });

  if (!provider) {
    console.error("ERROR: No active API Provider found in DB!");
    return;
  }
  
  console.log("Provider ID:", provider.id);
  console.log("API Key:", provider.apiKey ? `${provider.apiKey.substring(0, 10)}...` : 'null');
  
  // 2. Fetch prices from 5sim
  const url = 'https://5sim.net/v1/guest/prices';
  console.log("Fetching from 5sim guest prices API:", url);
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Accept': 'application/json'
      }
    });
    console.log("5sim Response Status:", res.status);
    if (!res.ok) {
      const text = await res.text();
      console.error(`5sim API returned error status ${res.status}: ${text}`);
      return;
    }
    const data = await res.json();
    console.log("5sim returned data. Keys count:", Object.keys(data).length);
  } catch (e) {
    console.error("5sim fetch exception:", e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
