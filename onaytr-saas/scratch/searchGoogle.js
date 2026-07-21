async function main() {
  const res = await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/master/data/simple-icons.json');
  const data = await res.json();
  const google = data.find(i => i.title === 'Google');
  console.log("Found Google:", google);
  
  const adobe = data.find(i => i.title === 'Adobe');
  console.log("Found Adobe:", adobe);

  const amazon = data.find(i => i.title === 'Amazon');
  console.log("Found Amazon:", amazon);
}
main();
