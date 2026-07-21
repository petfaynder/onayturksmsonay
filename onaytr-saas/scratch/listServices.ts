import { PrismaClient } from '@prisma/client';
import { countryToIsoMap } from '../lib/utils/icons';

const prisma = new PrismaClient();

async function main() {
  const targets = ['trendyol', 'yemeksepeti', 'getir', 'sahibinden', 'letgo', 'papara', 'bigo', 'azar', '1xbet', '1win', 'migros', 'hepsiburada', 'n11', 'tosla', 'yandex'];
  const matched = await prisma.service.findMany({
    where: {
      OR: targets.map(t => ({ name: { contains: t } }))
    }
  });
  console.log("MATCHED TARGETS:", matched.map(m => ({ name: m.name, code: m.providerCode })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
