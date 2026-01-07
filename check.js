const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_DATE = '20260110';

const URL =
  `https://in.bookmyshow.com/cinemas/salem/` +
  `spr-cinecastle-4krgb-64ch-dolby-atmos-salem/` +
  `buytickets/SPRS/${TARGET_DATE}`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: 'networkidle' });

  // Give SPA enough time to do replaceState()
  await page.waitForTimeout(7000);

  // Read the REAL address bar value
  const actualHref = await page.evaluate(() => window.location.href);

  console.log('REQUESTED URL:', URL);
  console.log('ADDRESS BAR URL:', actualHref);

  const status = actualHref.endsWith(TARGET_DATE) ? 'LIVE' : 'WAIT';

  fs.writeFileSync('status.txt', status);
  console.log('STATUS:', status);

  await browser.close();
})();
