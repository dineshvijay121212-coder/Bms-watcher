const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_DATE = '20260110';
const URL =
  'https://in.bookmyshow.com/cinemas/salem/' +
  'spr-cinecastle-4krgb-64ch-dolby-atmos-salem/' +
  `buytickets/SPRS/${TARGET_DATE}`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: 'networkidle' });

  const finalUrl = page.url();

  const status = finalUrl.endsWith(TARGET_DATE) ? 'LIVE' : 'WAIT';

  fs.writeFileSync('status.txt', status);

  await browser.close();
})();
