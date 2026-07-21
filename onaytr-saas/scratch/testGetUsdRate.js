const { ECCEngine } = require('../lib/ecc');

async function main() {
  console.log("Calling getUsdToTryRate()...");
  const rate = await ECCEngine.getUsdToTryRate();
  console.log("Returned Rate:", rate, "Type:", typeof rate);
}

main().catch(console.error);
