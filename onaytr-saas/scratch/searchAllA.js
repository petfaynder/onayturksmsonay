async function main() {
  const res = await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/master/data/simple-icons.json');
  const data = await res.json();
  const aIcons = data.filter(i => i.title.toLowerCase().startsWith('a'));
  console.log("Total starting with A:", aIcons.length);
  console.log("All A titles:", aIcons.map(i => i.title));
}
main();
