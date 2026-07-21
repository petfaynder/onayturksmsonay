async function main() {
  const res = await fetch('http://localhost:3000/api/pricing');
  const data = await res.json();
  const whatsappPricing = data.detailedPricing['england']?.['whatsapp'];
  console.log("England WhatsApp Pricing:", whatsappPricing);
}
main().catch(console.error);
