import { simpleIconsMap } from '../lib/utils/icons';

async function main() {
  console.log("Checking all mapped icons against jsDelivr CDN...");
  const entries = Object.entries(simpleIconsMap);
  for (const [key, slug] of entries) {
    const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;
    try {
      const res = await fetch(url);
      console.log(`Key: '${key}' -> Slug: '${slug}' -> URL Status: ${res.status}`);
    } catch (e: any) {
      console.log(`Key: '${key}' -> Slug: '${slug}' -> Error: ${e.message}`);
    }
  }
}

main().catch(console.error);
