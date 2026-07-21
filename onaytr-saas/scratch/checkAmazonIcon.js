async function main() {
  const urls = [
    'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazon.svg',
    'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobe.svg',
    'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/telegram.svg',
    'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/whatsapp.svg'
  ];
  for (const url of urls) {
    const res = await fetch(url);
    console.log(`URL: ${url} -> Status: ${res.status}`);
  }
}
main();
