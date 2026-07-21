import { PrismaClient } from '@prisma/client';
import { simpleIconsMap } from '../lib/utils/icons';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching Simple Icons data...");
  let simpleIconsSet = new Set<string>();
  
  try {
    let res = await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/master/data/simple-icons.json');
    if (!res.ok) {
      res = await fetch('https://cdn.jsdelivr.net/npm/simple-icons@latest/data/simple-icons.json');
    }
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json() as any;
    
    // The JSON structure is: { "icons": [ { "title": "...", "slug": "..." }, ... ] }
    console.log("KEYS:", Object.keys(data));
    if (Array.isArray(data)) {
      console.log("DATA IS ARRAY. Length:", data.length);
      for (const icon of data) {
        const slug = icon.slug || icon.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        simpleIconsSet.add(slug.toLowerCase().trim());
        simpleIconsSet.add(icon.title.toLowerCase().trim());
      }
    } else if (data && data.icons) {
      console.log("DATA.ICONS is array. Length:", data.icons.length);
      for (const icon of data.icons) {
        const slug = icon.slug || icon.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        simpleIconsSet.add(slug.toLowerCase().trim());
        simpleIconsSet.add(icon.title.toLowerCase().trim());
      }
    }
  } catch (error: any) {
    console.error("Failed to fetch from GitHub, using fallback list or direct check.", error.message);
  }

  // Get all active services from our DB
  const activeServices = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });

  console.log(`\nActive services in our DB: ${activeServices.length}`);

  const hasLogo: any[] = [];
  const missingLogo: any[] = [];

  for (const service of activeServices) {
    const cleanName = service.name.toLowerCase().trim();
    const cleanCode = service.providerCode.toLowerCase().trim();
    
    // Check if we mapped it explicitly in simpleIconsMap
    const mappedSlug = simpleIconsMap[cleanName] || simpleIconsMap[cleanCode];
    
    let isMatched = false;
    let matchedSlug = "";

    if (mappedSlug) {
      isMatched = simpleIconsSet.has(mappedSlug.toLowerCase().trim());
      matchedSlug = mappedSlug;
    }

    if (!isMatched) {
      // Try direct cleanName match
      if (simpleIconsSet.has(cleanName)) {
        isMatched = true;
        matchedSlug = cleanName;
      } else if (simpleIconsSet.has(cleanCode)) {
        isMatched = true;
        matchedSlug = cleanCode;
      }
    }

    if (isMatched) {
      hasLogo.push({ name: service.name, code: service.providerCode, slug: matchedSlug });
    } else {
      missingLogo.push({ name: service.name, code: service.providerCode });
    }
  }

  console.log(`Services with logos: ${hasLogo.length}`);
  console.log(`Services missing logos: ${missingLogo.length}`);

  // Write a clean markdown file to artifacts
  const fs = require('fs');
  const path = require('path');
  const artifactPath = 'C:/Users/Tolga/.gemini/antigravity-ide/brain/97b870f7-4b10-4974-9418-2787d47f288a/missing_logos_analysis.md';
  
  let mdContent = `# Logo Analiz Raporu\n\n`;
  mdContent += `Veritabanındaki aktif servislerin resmi **Simple Icons** marka kütüphanesi ile karşılaştırmalı analizi:\n\n`;
  mdContent += `* **Toplam Aktif Servis:** ${activeServices.length}\n`;
  mdContent += `* **Logosu Eşleşen Servisler:** ${hasLogo.length}\n`;
  mdContent += `* **Logosu Olmayan (Fallback Kullanan) Servisler:** ${missingLogo.length}\n\n`;
  
  mdContent += `## 🚀 Logosu Eşleşen Aktif Servisler (İlk 100 Örnek)\n`;
  mdContent += `| Servis Adı | Sağlayıcı Kodu | Simple Icons Slug |\n`;
  mdContent += `| :--- | :--- | :--- |\n`;
  for (const s of hasLogo.slice(0, 100)) {
    mdContent += `| ${s.name} | ${s.code} | \`${s.slug}\` |\n`;
  }
  if (hasLogo.length > 100) mdContent += `| *ve diğer ${hasLogo.length - 100} servis...* | | |\n`;

  mdContent += `\n## ⚠️ Logosu Olmayan (Daire İçi Harf Kullanan) Servisler\n`;
  mdContent += `Toplam **${missingLogo.length}** servis Simple Icons kütüphanesinde bulunmamaktadır. Bu servisler genellikle bölgesel bahis siteleri, niş forumlar ve küçük mobil uygulamalardır (örn: \`115com\`, \`1win\`, \`yemeksepeti\` vb.).\n\n`;
  mdContent += `| Servis Adı | Sağlayıcı Kodu |\n`;
  mdContent += `| :--- | :--- |\n`;
  for (const s of missingLogo) {
    mdContent += `| ${s.name} | ${s.code} |\n`;
  }

  fs.writeFileSync(artifactPath, mdContent, 'utf8');
  console.log("Analysis report saved to missing_logos_analysis.md successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
