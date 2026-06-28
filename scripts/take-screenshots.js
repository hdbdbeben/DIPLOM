const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'screenshots');
const BASE_URL = 'http://localhost:5173';

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Login
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[placeholder="Введите логин"]', 'admin');
  await page.fill('input[placeholder="Введите пароль"]', 'admin');
  await page.click('button:has-text("Войти")');
  await page.waitForURL('**/statements');
  await page.waitForTimeout(1000);

  const pages = [
    { url: '/statements', name: '02_statements' },
    { url: '/payments', name: '03_payments' },
    { url: '/directories', name: '04_directories' },
    { url: '/reports', name: '05_reports' },
    { url: '/errors', name: '06_errors' },
    { url: '/1c', name: '07_1c_integration' },
    { url: '/admin', name: '08_admin' },
    { url: '/logs', name: '09_logs' },
    { url: '/payments/new', name: '10_payment_create' },
  ];

  for (const p of pages) {
    await page.goto(`${BASE_URL}${p.url}`);
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    // If redirected to login, re-login
    if (currentUrl.includes('/login')) {
      await page.fill('input[placeholder="Введите логин"]', 'admin');
      await page.fill('input[placeholder="Введите пароль"]', 'admin');
      await page.click('button:has-text("Войти")');
      await page.waitForURL('**/statements');
      await page.goto(`${BASE_URL}${p.url}`);
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${p.name}.png`),
      fullPage: true,
    });
    console.log(`${p.name}: ${page.url()}`);
  }

  await browser.close();
  console.log('All screenshots captured.');
}

takeScreenshots().catch(console.error);
