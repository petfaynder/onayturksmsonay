import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const popularServices = [
  { code: 'whatsapp', name: 'WhatsApp', sortOrder: -100 },
  { code: 'telegram', name: 'Telegram', sortOrder: -99 },
  { code: 'google', name: 'Google', sortOrder: -98 },
  { code: 'youtube', name: 'YouTube', sortOrder: -97 },
  { code: 'instagram', name: 'Instagram', sortOrder: -96 },
  { code: 'facebook', name: 'Facebook', sortOrder: -95 },
  { code: 'tiktok', name: 'TikTok', sortOrder: -94 },
  { code: 'tinder', name: 'Tinder', sortOrder: -93 },
  { code: 'steam', name: 'Steam', sortOrder: -92 },
  { code: 'netflix', name: 'Netflix', sortOrder: -91 },
  { code: 'spotify', name: 'Spotify', sortOrder: -90 },
  { code: 'discord', name: 'Discord', sortOrder: -89 },
  { code: 'viber', name: 'Viber', sortOrder: -88 },
  { code: 'vkontakte', name: 'VKontakte', sortOrder: -87 },
  { code: 'twitter', name: 'Twitter (X)', sortOrder: -86 }
];

async function main() {
  console.log("Updating popular service sort orders...");
  for (const item of popularServices) {
    const updated = await prisma.service.updateMany({
      where: {
        OR: [
          { providerCode: item.code },
          { name: { contains: item.code } }
        ]
      },
      data: {
        sortOrder: item.sortOrder,
        isActive: true // Make sure they are active
      }
    });
    console.log(`Updated ${item.name} (${item.code}): matched ${updated.count} entries.`);
  }
  console.log("Popular services sort orders updated successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
