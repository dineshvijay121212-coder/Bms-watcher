const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_DATE = '20260110';

const REQUESTED_URL =
  `https://in.bookmyshow.com/cinemas/salem/` +
  `spr-cinecastle-4krgb-64ch-dolby-atmos-salem/` +
  `buytickets/SPRS/${TARGET_DATE}`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Go to requested date
  await page.goto(REQUESTED_URL, { waitUntil: 'domcontentloaded' });

  let finalStatus = 'LIVE'; // assume live, disprove if redirected

  try {
    // Wait until URL changes away from target date
    await page.waitForURL(
      url => !url.pathname.endsWith(TARGET_DATE),
      { timeout: 10000 } // 10s is safe for slow networks
    );

    // If we reach here → URL CHANGED → date is NOT live
    finalStatus = 'WAIT';

  } catch (e) {
    // Timeout means URL never changed → date stayed valid
    finalStatus = 'LIVE';
  }

  // DEBUG (helps you trust it)
  const finalUrl = page.url();
  console.log('FINAL URL:', finalUrl);
  console.log('STATUS:', finalStatus);

  fs.writeFileSync('status.txt', finalStatus);

  await browser.close();
})();
