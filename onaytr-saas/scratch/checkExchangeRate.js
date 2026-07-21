async function main() {
  const res = await fetch('http://localhost:3000/api/pricing');
  const data = await res.json();
  console.log("Exchange Rate:", data.exchangeRate);
  console.log("First 5 apps:", data.apps.slice(0, 5));
}
main().catch(console.error);
