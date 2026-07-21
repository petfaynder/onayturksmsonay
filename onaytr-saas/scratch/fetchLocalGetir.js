async function main() {
  const res = await fetch('http://localhost:3000/services/getir.svg');
  console.log("Status:", res.status);
  console.log("Content-Type:", res.headers.get('content-type'));
  const text = await res.text();
  console.log("Content start:", text.substring(0, 100));
}
main();
