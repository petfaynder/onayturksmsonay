const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Go to login page
  await page.goto('http://localhost:3000/auth/login');
  
  // Login
  await page.fill('input[placeholder="ornek@mail.com"]', 'akartolga0@gmail.com');
  await page.fill('input[placeholder="••••••••"]', 'Ta170104894*');
  await page.click('button:has-text("Giriş Yap")');
  
  // Wait for navigation
  await page.waitForTimeout(3000);
  
  // Navigate to dashboard
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(2000);
  
  // Search for '1win'
  await page.fill('input[placeholder*="Uygulama Ara"]', '1win');
  await page.waitForTimeout(1000);
  
  // Take screenshot with search
  await page.screenshot({ path: 'C:/Users/Tolga/.gemini/antigravity-ide/brain/97b870f7-4b10-4974-9418-2787d47f288a/search_fallback_gradient.png' });
  console.log("Screenshot search_fallback_gradient.png saved!");
  
  // Clear search
  await page.fill('input[placeholder*="Uygulama Ara"]', '');
  await page.waitForTimeout(1000);
  
  // Take screenshot after clear
  await page.screenshot({ path: 'C:/Users/Tolga/.gemini/antigravity-ide/brain/97b870f7-4b10-4974-9418-2787d47f288a/search_cleared_logos_retained.png' });
  console.log("Screenshot search_cleared_logos_retained.png saved!");
  
  await browser.close();
}

main().catch(console.error);
