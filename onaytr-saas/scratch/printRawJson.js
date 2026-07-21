async function main() {
  const res = await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/master/data/simple-icons.json');
  const text = await res.text();
  console.log("Raw text length:", text.length);
  console.log("First 2000 characters:");
  console.log(text.substring(0, 2000));
}
main();
