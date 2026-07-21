async function main() {
  const res = await fetch('http://localhost:3000/api/pricing');
  console.log("Pricing API Status:", res.status);
  const data = await res.json();
  console.log("Total apps returned:", data.apps?.length);
  if (data.apps) {
    const getir = data.apps.find(a => a.name.includes('getir'));
    console.log("Getir in apps:", getir);
  }
}
main().catch(console.error);
