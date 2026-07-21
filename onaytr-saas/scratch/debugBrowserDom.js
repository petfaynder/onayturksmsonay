const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[placeholder="ornek@mail.com"]', 'akartolga0@gmail.com');
  await page.fill('input[placeholder="••••••••"]', 'Ta170104894*');
  await page.click('button:has-text("Giriş Yap")');
  await page.waitForTimeout(4000);
  
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(6000);
  
  const col3Html = await page.evaluate(() => {
    const col3 = document.querySelector('.w-full.lg\\:w-1\\/3');
    return col3 ? col3.outerHTML : 'Col 3 not found';
  });
  
  console.log("Column 3 HTML:\n", col3Html);
  
  await browser.close();
}

main().catch(console.error);
