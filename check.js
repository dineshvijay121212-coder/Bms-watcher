const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_DATE = '20260110'; // YYYYMMDD
const TARGET_DAY = '10';        // day of month (string)

const URL =
  `https://in.bookmyshow.com/cinemas/salem/` +
  `spr-cinecastle-4krgb-64ch-dolby-atmos-salem/` +
  `buytickets/SPRS/${TARGET_DATE}`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000); // allow SPA hydration

  const result = await page.evaluate(() => {
    // Date pills are anchor elements in the date strip
    const pills = Array.from(document.querySelectorAll('a[href*="/buytickets/"]'));

    const visiblePills = pills.filter(p => {
      const rect = p.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    // Active date = pill that is NOT disabled / clickable
    const active = visiblePills.find(p => {
      const style = window.getComputedStyle(p);
      return style.pointerEvents === 'none' || p.getAttribute('aria-disabled') === 'true';
    });

    return {
      activeText: active ? active.textContent.trim() : null,
      allDates: visiblePills.map(p => p.textContent.trim())
    };
  });

  console.log('ALL DATES:', result.allDates);
  console.log('ACTIVE DATE TEXT:', result.activeText);

  let status = 'WAIT';

  if (result.activeText && result.activeText.includes(TARGET_DAY)) {
    status = 'LIVE';
  }

  fs.writeFileSync('status.txt', status);
  console.log('STATUS:', status);

  await browser.close();
})();
