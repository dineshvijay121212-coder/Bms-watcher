const { chromium } = require('playwright');

const TARGET_DATE = '10'; // day number, not YYYYMMDD
const URL = 'https://in.bookmyshow.com/cinemas/salem/spr-cinecastle-4krgb-64ch-dolby-atmos-salem/buytickets/SPRS';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: 'networkidle' });

  // wait for date strip
  await page.waitForSelector('[data-date]');

  const status = await page.evaluate((TARGET_DATE) => {
    const dates = [...document.querySelectorAll('[data-date]')];

    const target = dates.find(d =>
      d.innerText.trim() === TARGET_DATE
    );

    if (!target) return 'WAIT';

    const disabled =
      target.getAttribute('aria-disabled') === 'true' ||
      target.className.toLowerCase().includes('disabled');

    return disabled ? 'WAIT' : 'LIVE';
  }, TARGET_DATE);

  console.log('STATUS:', status);

  await browser.close();
})();
