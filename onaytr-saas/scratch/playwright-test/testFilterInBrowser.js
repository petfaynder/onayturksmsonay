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
  await page.waitForTimeout(5000);
  
  const debugData = await page.evaluate(() => {
    const appGrid = document.querySelector('.grid-cols-2');
    if (!appGrid) return 'app grid not found';
    const key = Object.keys(appGrid).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
    if (!key) return 'fiber key not found';
    
    let fiber = appGrid[key];
    while (fiber) {
      if (fiber.memoizedState && fiber.memoizedState.memoizedState) {
        let stateNode = fiber.memoizedState;
        while (stateNode) {
          if (stateNode.memoizedState && stateNode.memoizedState.apps) {
            const pricingData = stateNode.memoizedState;
            const selectedApp = 'whatsapp';
            
            const countryCallingCodes = {
              usa: '+1', canada: '+1', russia: '+7', kazakhstan: '+7',
              egypt: '+20', southafrica: '+27', greece: '+30', netherlands: '+31',
              belgium: '+32', france: '+33', spain: '+34', hungary: '+36',
              italy: '+39', romania: '+40', switzerland: '+41', austria: '+43',
              england: '+44', unitedkingdom: '+44', denmark: '+45', sweden: '+46',
              norway: '+47', poland: '+48', germany: '+49', peru: '+51',
              mexico: '+52', cuba: '+53', argentina: '+54', brazil: '+55',
              chile: '+56', colombia: '+57', venezuela: '+58', malaysia: '+60',
              australia: '+61', indonesia: '+62', philippines: '+63', newzealand: '+64',
              singapore: '+65', thailand: '+66', japan: '+81', vietnam: '+84',
              china: '+86', turkey: '+90', india: '+91', pakistan: '+92',
              afghanistan: '+93', srilanka: '+94', myanmar: '+95', iran: '+98',
              morocco: '+212', algeria: '+213', tunisia: '+216', libya: '+218',
              senegal: '+221', ivorycoast: '+225', ghana: '+233', nigeria: '+234',
              kenya: '+254', israel: '+972', saudiarabia: '+966', iraq: '+964',
              unitedarabemirates: '+971', jordan: '+962', syria: '+963', lebanon: '+961',
              kuwait: '+965', saudi: '+966', yemen: '+967', oman: '+968',
              palestine: '+970', qatar: '+974', bahrain: '+973', mongolia: '+976',
              nepal: '+977', tajikistan: '+992', turkmenistan: '+993', azerbaijan: '+994',
              georgia: '+995', kyrgyzstan: '+996', uzbekistan: '+998'
            };

            const availableCountriesForApp = selectedApp && pricingData.detailedPricing 
              ? Object.keys(pricingData.detailedPricing).filter(country => pricingData.detailedPricing[country][selectedApp])
              : [];

            const filteredCountries = pricingData.countries.filter((c) => {
              const callingCode = countryCallingCodes[c.code.toLowerCase().replace(/[^a-z0-9]/g, '')] || '';
              const matchesSearch = c.name.toLowerCase().includes('') || 
                                    callingCode.includes('') ||
                                    (''.replace('+', '').length > 0 && callingCode.includes(''));
              return availableCountriesForApp.includes(c.code) && matchesSearch;
            });

            return {
              availableCountries: availableCountriesForApp,
              filteredCountries: filteredCountries.map(c => c.code)
            };
          }
          stateNode = stateNode.next;
        }
      }
      fiber = fiber.return;
    }
    return 'state not found';
  });
  
  console.log("Filtered Countries in Browser:", debugData);
  await browser.close();
}

main().catch(console.error);
