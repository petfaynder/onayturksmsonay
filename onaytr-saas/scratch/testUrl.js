async function main() {
  const urls = [
    'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/data/simple-icons.json',
    'https://raw.githubusercontent.com/simple-icons/simple-icons/master/data/simple-icons.json',
    'https://cdn.jsdelivr.net/npm/simple-icons@latest/data/simple-icons.json'
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`URL: ${url} -> Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`Length: ${text.length}`);
      }
    } catch (e) {
      console.log(`URL: ${url} -> Error: ${e.message}`);
    }
  }
}
main();
