import prisma from '../lib/db';
import path from 'path';
import fs from 'fs';
import https from 'https';

// Same as icons.ts simpleIconsMap
const simpleIconsMap: Record<string, string> = {
  'whatsapp': 'whatsapp',
  'telegram': 'telegram',
  'google': 'google',
  'gmail': 'gmail',
  'youtube': 'youtube',
  'facebook': 'facebook',
  'instagram': 'instagram',
  'twitter': 'x',
  'tiktok': 'tiktok',
  'tinder': 'tinder',
  'amazon': 'amazon',
  'apple': 'apple',
  'steam': 'steam',
  'netflix': 'netflix',
  'spotify': 'spotify',
  'discord': 'discord',
  'viber': 'viber',
  'vkontakte': 'vk',
  'microsoft': 'microsoft',
  'yahoo': 'yahoo',
  'wechat': 'wechat',
  'line': 'line',
  'signal': 'signal',
  'snapchat': 'snapchat',
  'reddit': 'reddit',
  'linkedin': 'linkedin',
  'airbnb': 'airbnb',
  'uber': 'uber',
  'zoom': 'zoom',
  'ebay': 'ebay',
  'paypal': 'paypal',
  'stripe': 'stripe',
  'slack': 'slack',
  'github': 'github',
  'gitlab': 'gitlab',
  'alibaba': 'alibabacom',
  'booking': 'bookingcom',
  'weibo': 'sinaweibo',
  'hbomax': 'max',
  'mercado': 'mercadolibre',
  'twitch': 'twitch'
};

const servicesDir = path.join(process.cwd(), 'public', 'services');

function hasLocalLogo(name: string): boolean {
  const cleanName = name.toLowerCase().trim();
  return fs.existsSync(path.join(servicesDir, `${cleanName}.svg`));
}

function hasSimpleIcon(name: string): string | null {
  const cleanName = name.toLowerCase().trim();
  return simpleIconsMap[cleanName] || null;
}

async function checkIconUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

async function main() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });

  console.log(`\nTotal active services: ${services.length}\n`);

  const hasLocal: string[] = [];
  const hasSimpleIcons: string[] = [];
  const missing: string[] = [];

  for (const service of services) {
    const name = service.providerCode;
    if (hasLocalLogo(name)) {
      hasLocal.push(name);
    } else if (hasSimpleIcon(name)) {
      hasSimpleIcons.push(name);
    } else {
      missing.push(name);
    }
  }

  console.log(`✅ LOCAL SVG (public/services/): ${hasLocal.length}`);
  console.log(hasLocal.map(n => `  - ${n}`).join('\n'));

  console.log(`\n🔵 SIMPLE ICONS CDN (mapped): ${hasSimpleIcons.length}`);
  console.log(hasSimpleIcons.map(n => `  - ${n} → ${simpleIconsMap[n]}`).join('\n'));

  console.log(`\n❌ NO LOGO (fallback initials only): ${missing.length}`);
  console.log(missing.map(n => `  - ${n}`).join('\n'));

  // For missing ones, check if simple-icons CDN has them by the name directly
  console.log('\n🔍 Checking if CDN has icon by exact name for missing services...');
  const foundOnCdn: string[] = [];
  const trulyMissing: string[] = [];

  for (const name of missing) {
    const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${name}.svg`;
    const exists = await checkIconUrl(url);
    if (exists) {
      foundOnCdn.push(name);
    } else {
      trulyMissing.push(name);
    }
  }

  console.log(`\n✅ Found on CDN by exact name (add to simpleIconsMap): ${foundOnCdn.length}`);
  console.log(foundOnCdn.map(n => `  '${n}': '${n}'`).join('\n'));

  console.log(`\n❌ Truly missing (need manual SVG): ${trulyMissing.length}`);
  console.log(trulyMissing.map(n => `  - ${n}`).join('\n'));
}

main().catch(console.error).finally(() => prisma.$disconnect());
