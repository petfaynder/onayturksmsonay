async function main() {
  const res = await fetch('http://localhost:3000/api/pricing/rent');
  console.log("Rent Pricing API Status:", res.status);
  const data = await res.json();
  console.log("Total rent apps returned:", data.apps?.length);
}
main().catch(console.error);
