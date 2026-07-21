import { ECCEngine } from '../lib/ecc';
import prisma from '../lib/db';

async function main() {
  const rate = await ECCEngine.getUsdToTryRate();
  console.log("USD to TRY rate from ECCEngine:", rate);

  const rawRes = await fetch('https://open.er-api.com/v6/latest/USD');
  const rawData = await rawRes.json();
  console.log("Raw rate from API:", rawData.rates.TRY);

  const bufferSetting = await prisma.systemSetting.findUnique({
    where: { key: 'USD_EXCHANGE_BUFFER' }
  });
  console.log("USD_EXCHANGE_BUFFER setting in DB:", bufferSetting);

  const fallbackSetting = await prisma.systemSetting.findUnique({
    where: { key: 'USD_FALLBACK_RATE' }
  });
  console.log("USD_FALLBACK_RATE setting in DB:", fallbackSetting);
}

main().catch(console.error).finally(() => prisma.$disconnect());
