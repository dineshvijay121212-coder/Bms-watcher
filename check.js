const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_DATE = '20260110'; // YYYYMMDD

const URL =
  `https://in.bookmyshow.com/cinemas/salem/` +
  `spr-cinecastle-4krgb-64ch-dolby-atmos-salem/` +
  `buytickets/SPRS/${TARGET_DATE}`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: 'networkidle' });

  // Give SPA time to settle
  await page.waitForTimeout(5000);

  // Find the ACTIVE date pill (this is the source of truth)
  const activeDate = await page.evaluate(() => {
    const active =
      document.querySelector('[aria-selected="true"]') ||
      document.querySelector('.active') ||
      document.querySelector('[class*="selected"]');

    if (!active) return null;

    // Try to extract date text
    return active.textContent?.trim() || null;
  });

  console.log('ACTIVE DATE TEXT:', activeDate);

  // If the active date still represents TARGET_DATE → LIVE
  const status =
    activeDate && activeDate.includes('10')
      ? 'LIVE'
      : 'WAIT';

  fs.writeFileSync('status.txt', status);

  console.log('STATUS:', status);

  await browser.close();
})();
