async function main() {
  const res = await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/master/data/simple-icons.json');
  const data = await res.json();
  const aIcons = data.filter(i => i.title.toLowerCase().startsWith('a'));
  
  const adobeIndex = aIcons.findIndex(i => i.title.toLowerCase().includes('adobe'));
  console.log("Adobe Index in A:", adobeIndex);
  if (adobeIndex !== -1) console.log("Adobe Item:", aIcons[adobeIndex]);
  
  const amazonIndex = aIcons.findIndex(i => i.title.toLowerCase().includes('amazon'));
  console.log("Amazon Index in A:", amazonIndex);
  if (amazonIndex !== -1) console.log("Amazon Item:", aIcons[amazonIndex]);
}
main();
