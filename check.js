const { chromium, devices } = require('playwright');
const fs = require('fs');

const TARGET_DATE = '20260110';

const URL =
  `https://in.bookmyshow.com/cinemas/salem/` +
  `spr-cinecastle-4krgb-64ch-dolby-atmos-salem/` +
  `buytickets/SPRS/${TARGET_DATE}`;

(async () => {
  const browser = await chromium.launch({ headless: true });

  // 🔥 Force MOBILE layout (this is the key)
  const context = await browser.newContext({
    ...devices['Pixel 5'],
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata'
  });

  const page = await context.newPage();

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(6000);

  // Scroll to force lazy-loaded showtimes
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });

  await page.waitForTimeout(3000);

  const hasShows = await page.evaluate(() => {
    // Mobile showtime buttons always contain "AM / PM"
    return [...document.querySelectorAll('a, button')].some(el =>
      /\b(AM|PM)\b/.test(el.textContent)
    );
  });

  console.log('HAS SHOWS:', hasShows);

  const status = hasShows ? 'LIVE' : 'WAIT';
  fs.writeFileSync('status.txt', status);
  console.log('STATUS:', status);

  await browser.close();
})();
