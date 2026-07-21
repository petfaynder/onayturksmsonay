async function main() {
  const res = await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/master/data/simple-icons.json');
  const data = await res.json();
  const simpleIconsSet = new Set();
  for (const icon of data) {
    const slug = icon.slug || icon.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    simpleIconsSet.add(slug.toLowerCase().trim());
    simpleIconsSet.add(icon.title.toLowerCase().trim());
  }
  console.log("Has 'adobe'?", simpleIconsSet.has('adobe'));
  console.log("Has 'amazon'?", simpleIconsSet.has('amazon'));
  
  // Print some keys starting with 'ad' or 'am'
  const keys = Array.from(simpleIconsSet);
  console.log("Keys starting with adobe:", keys.filter(k => k.includes('adobe')));
  console.log("Keys starting with amazon:", keys.filter(k => k.includes('amazon')));
}
main();
