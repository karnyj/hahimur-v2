import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, args: ['--disable-blink-features=AutomationControlled'] });
const page = await browser.newPage();

try {
  console.log('Navigating to app with random fill...');
  await page.goto('http://localhost:5174/?fill=random', { waitUntil: 'domcontentloaded' });
  
  // Wait a moment for React to render
  await page.waitForTimeout(2000);
  
  // Scroll to bottom to ensure finals section is visible
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  // Wait for banner or timeout
  const bannerPromise = page.waitForSelector('.champion-banner', { timeout: 5000 });
  let bannerFound = false;
  try {
    await bannerPromise;
    bannerFound = true;
  } catch (e) {
    console.log('Banner selector not found');
  }
  
  console.log(`\n✅ Champion banner found: ${bannerFound}`);
  
  if (bannerFound) {
    // Get banner content
    const label = await page.textContent('.champion-banner__label');
    const name = await page.textContent('.champion-banner__name');
    const trophy = await page.textContent('.champion-banner__trophy');
    
    console.log(`Trophy: ${trophy}`);
    console.log(`Label: ${label}`);
    console.log(`Team name (Hebrew): ${name}`);
    
    // Check flag exists and has proper styling
    const flagExists = await page.$('.champion-banner__flag') !== null;
    console.log(`Flag element exists: ${flagExists}`);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/banner-test.png' });
    console.log('\n📸 Screenshot saved to /tmp/banner-test.png');
  }
  
  // Check if any console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Browser error: ${msg.text()}`);
    }
  });
  
  await page.close();
  await browser.close();
  process.exit(0);
} catch (err) {
  console.error('Test error:', err.message);
  await browser.close();
  process.exit(1);
}
