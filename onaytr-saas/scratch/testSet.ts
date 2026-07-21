import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const res = await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/master/data/simple-icons.json');
  const data = await res.json() as any[];
  console.log("TOTAL ICONS:", data.length);
  
  const aIcons = data.filter(i => i.title.toLowerCase().startsWith('a'));
  console.log("A ICONS (30-100):", aIcons.slice(30, 100).map(i => i.title));
}

main().catch(console.error).finally(() => prisma.$disconnect());
