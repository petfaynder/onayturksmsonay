async function main() {
  const res = await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/master/data/simple-icons.json');
  const text = await res.text();
  console.log("Is 'Adobe' in the raw text?", text.includes('Adobe'));
  console.log("Is 'Amazon' in the raw text?", text.includes('Amazon'));
  
  const data = JSON.parse(text);
  console.log("Is 'Adobe' in any title?", data.some(i => i.title === 'Adobe'));
  console.log("Is 'Amazon' in any title?", data.some(i => i.title === 'Amazon'));
  
  // Print some items that contain 'Ado' or 'Ama'
  const matches = data.filter(i => i.title.toLowerCase().startsWith('ad') || i.title.toLowerCase().startsWith('am'));
  console.log("Matches:", matches.map(i => i.title));
}
main();
