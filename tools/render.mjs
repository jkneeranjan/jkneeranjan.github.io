// Renders the generated assets: Open Graph card, PNG icons and the CV PDF.
//
//   python3 -m http.server 8765 &        # from the repo root
//   node tools/render.mjs                # needs Playwright (npm i -D playwright, or PLAYWRIGHT_MODULE=/path/to/node_modules/playwright)
//
// Pages are loaded over http so relative fonts and images resolve exactly as on GitHub Pages.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.BASE_URL || 'http://localhost:8765';
const out = (p) => path.join(root, p);

const browser = await chromium.launch();
try {
  // Open Graph card, 1200x630
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await og.goto(`${base}/tools/og.html`, { waitUntil: 'networkidle' });
  await og.evaluate(() => document.fonts.ready);
  await og.locator('.card').screenshot({ path: out('assets/img/og.png') });

  // PNG icons from the SVG favicon: the small favicon keeps its rounded corners,
  // the touch/manifest icons are opaque and full bleed (iOS adds its own mask).
  for (const [size, file, transparent] of [[32, 'favicon-32.png', true], [180, 'apple-touch-icon.png', false], [192, 'icon-192.png', false], [512, 'icon-512.png', false]]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(
      `<html><body style="margin:0;background:${transparent ? 'transparent' : '#146c43'}">` +
      `<img src="${base}/favicon.svg" style="width:${size}px;height:${size}px;display:block"></body></html>`
    );
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: out(file), omitBackground: transparent });
    await page.close();
  }

  // CV PDF (A4)
  const cv = await browser.newPage();
  await cv.goto(`${base}/cv/`, { waitUntil: 'networkidle' });
  await cv.evaluate(() => document.fonts.ready);
  await cv.emulateMedia({ media: 'print' });
  await cv.pdf({
    path: out('cv/Neeranjan-JK-CV.pdf'),
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
    outline: true,
  });
  console.log('Rendered og.png, icons and cv/Neeranjan-JK-CV.pdf');
} finally {
  await browser.close();
}
