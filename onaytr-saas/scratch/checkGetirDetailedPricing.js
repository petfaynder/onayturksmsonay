async function main() {
  const res = await fetch('http://localhost:3000/api/pricing');
  const data = await res.json();
  
  // Find all countries where 'getir' exists in detailedPricing
  const countries = [];
  for (const [country, services] of Object.entries(data.detailedPricing)) {
    if (services.getir) {
      countries.push({
        country,
        getir: services.getir
      });
    }
  }
  
  console.log(`Getir exists in ${countries.length} countries in detailedPricing.`);
  if (countries.length > 0) {
    console.log("Example country detail:", countries[0]);
  }
}
main().catch(console.error);
