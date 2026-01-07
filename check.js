const { chromium } = require('playwright');

const TARGET_DAY = '08'; // day only: 08, 10, 20
const URL = 'https://in.bookmyshow.com/cinemas/salem/spr-cinecastle-4krgb-64ch-dolby-atmos-salem/buytickets/SPRS';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  // wait for ANY date strip item
  await page.waitForSelector('li, button, a', { timeout: 20000 });

  const result = await page.evaluate((TARGET_DAY) => {
    const nodes = Array.from(
      document.querySelectorAll('li, button, a')
    ).filter(el =>
      el.innerText &&
      el.innerText.trim() === TARGET_DAY
    );

    if (nodes.length === 0) {
      return { status: 'WAIT', reason: 'DATE_NOT_RENDERED' };
    }

    const el = nodes[0];

    const disabled =
      el.className.toLowerCase().includes('disable') ||
      el.getAttribute('aria-disabled') === 'true';

    return {
      status: disabled ? 'WAIT' : 'LIVE',
      class: el.className || null
    };
  }, TARGET_DAY);

  console.log('RESULT:', result);

  await browser.close();
})();
