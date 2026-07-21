async function main() {
  const res = await fetch('http://localhost:3000/api/pricing');
  const data = await res.json();
  const getir = data.apps.find(a => a.name === 'getir');
  console.log("Getir object:", getir);
}
main().catch(console.error);
