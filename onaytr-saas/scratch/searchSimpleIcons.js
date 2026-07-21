async function main() {
  const res = await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/master/data/simple-icons.json');
  const data = await res.json();
  console.log("Total icons:", data.length);
  
  // Find all titles containing 'Ado'
  const ado = data.filter(i => i.title.toLowerCase().includes('ado'));
  console.log("Titles containing 'ado':", ado.map(i => i.title));
  
  // Find all titles containing 'Ama'
  const ama = data.filter(i => i.title.toLowerCase().includes('ama'));
  console.log("Titles containing 'ama':", ama.map(i => i.title));
}

main();
