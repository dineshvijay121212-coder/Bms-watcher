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

  // Go to requested date
  await page.goto(REQUESTED_URL, { waitUntil: 'domcontentloaded' });

  try {
    // IMPORTANT:
    // Wait until either:
    // - URL changes away from target date (JS redirect)
    // - OR timeout expires (means date stayed valid)
    await page.waitForURL(
      url => !url.pathname.endsWith(TARGET_DATE),
      { timeout: 8000 }
    );

    // If we reach here → URL changed → NOT LIVE
    fs.writeFileSync('status.txt', 'WAIT');

  } catch (e) {
    // Timeout means URL NEVER changed → date is LIVE
    fs.writeFileSync('status.txt', 'LIVE');
  }

  await browser.close();
})();
