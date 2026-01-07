const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_DATE = '20260110';

const REQUESTED_URL =
  'https://in.bookmyshow.com/cinemas/salem/' +
  'spr-cinecastle-4krgb-64ch-dolby-atmos-salem/' +
  `buytickets/SPRS/${TARGET_DATE}`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Step 1: Go to requested date
  await page.goto(REQUESTED_URL, { waitUntil: 'domcontentloaded' });

  // Step 2: WAIT for JS redirect (this is the key)
  await page.waitForTimeout(5000);

  // Step 3: Read final browser URL (address bar truth)
  const finalUrl = page.url();

  const status = finalUrl.endsWith(TARGET_DATE)
    ? 'LIVE'
    : 'WAIT';

  fs.writeFileSync('status.txt', status);

  await browser.close();
})();
