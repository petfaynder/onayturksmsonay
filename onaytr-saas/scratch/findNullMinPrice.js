async function main() {
  const res = await fetch('http://localhost:3000/api/pricing');
  const data = await res.json();
  const nullApps = data.apps.filter(a => a.minPrice === null);
  console.log(`Total apps with minPrice null: ${nullApps.length}`);
  console.log("Null apps example:", nullApps.slice(0, 10));
}
main().catch(console.error);
