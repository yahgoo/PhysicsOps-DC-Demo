// Verification + text extraction for the narrated demo. Usage: node verify-journey.mjs [baseURL]
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] ?? 'http://localhost:4173';
const evidence = join(root, 'test-evidence');
mkdirSync(evidence, { recursive: true });
const results = [];
const texts = {};
const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: evidence, size: { width: 1440, height: 900 } } });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));
const grab = async (k) => { texts[k] = await page.locator('main').innerText(); await page.screenshot({ path: join(root, 'screens', `${k}.png`) }); };
const noScroll = () => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight && document.documentElement.scrollWidth <= window.innerWidth);

await page.goto(base);
await page.getByText('6 / 6 normal').waitFor();
check('1440x900 overview: no scroll', await noScroll());
check('synthetic disclosure visible', await page.getByText('Synthetic demo data').isVisible());
await grab('01-overview');

// Keyboard: reach and activate "Start investigation" with Tab + Enter.
let reached = false;
for (let i = 0; i < 40 && !reached; i++) {
  await page.keyboard.press('Tab');
  reached = await page.evaluate(() => document.activeElement?.textContent?.trim() === 'Start investigation');
}
check('keyboard: Start investigation reachable via Tab', reached);
await page.keyboard.press('Enter');
await page.getByRole('tab', { name: /Observations/ }).waitFor({ timeout: 15000 });
await page.getByText('5 / 6 normal').waitFor();
check('keyboard: Enter starts investigation', true);
check('1440x900 observations: no scroll', await noScroll());
await grab('02-observations');

for (const tab of ['Power', 'Flow', 'COP']) {
  const t = page.getByRole('tab', { name: new RegExp(tab, 'i') }).first();
  if (await t.count()) { await t.click(); await grab(`02-chart-${tab.toLowerCase()}`); }
}
const approachTab = page.getByRole('tab', { name: /approach/i }).first();
if (await approachTab.count()) await approachTab.click();

await page.getByRole('button', { name: 'Review competing explanations' }).click();
await page.getByText('Leading hypothesis — requires verification').waitFor();
await grab('03-hypotheses');

await page.getByRole('button', { name: /^Condenser heat-transfer degradation/ }).click();
await page.getByRole('button', { name: /Condenser approach elevated/ }).click();
await page.getByText(/Approach = T_cond,sat − T_CW,out/).waitFor();
await grab('04-evidence');

await page.getByRole('button', { name: 'View engineering finding' }).click();
await page.getByText(/Medium — requires verification/).waitFor();
await grab('05-finding');

await page.getByRole('button', { name: 'Explore what-if deterioration' }).click();
await page.getByRole('button', { name: 'Run what-if investigation' }).click();
await page.getByText(/Sensitivity analysis — not a calibrated forecast/).waitFor();
check('what-if tab active after run', (await page.getByRole('tab', { name: 'What-if sensitivity' }).getAttribute('data-state')) === 'active');
await grab('06-what-if');

await page.getByRole('button', { name: 'Schedule inspection — demo' }).click();
texts['07-dialog'] = await page.getByRole('dialog').innerText();
await page.screenshot({ path: join(root, 'screens', '07-dialog.png') });
await page.getByRole('button', { name: 'Create demo inspection request' }).click();
await page.getByText('Demo inspection request created. No request was sent to a maintenance system.').waitFor();
check('inspection is local simulation only', true);
await page.keyboard.press('Escape');
await grab('07-inspection');

await page.getByRole('button', { name: /How it works/i }).click();
texts['08-how-it-works'] = await page.getByRole('dialog').innerText();
await page.screenshot({ path: join(root, 'screens', '08-how-it-works.png') });
await page.keyboard.press('Escape');
check('keyboard: Escape closes How it works dialog', (await page.getByRole('dialog').count()) === 0);

await page.getByRole('button', { name: 'Reset demo' }).click();
await page.getByText('6 / 6 normal').waitFor();
check('reset returns to overview', await page.getByRole('button', { name: 'Start investigation' }).isVisible());
check('no console errors', errors.length === 0, errors.join(' | '));
const videoPath = await page.video().path();
await ctx.close();

const small = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const p2 = await small.newPage();
await p2.goto(base);
await p2.getByRole('button', { name: 'Start investigation' }).click();
await p2.getByRole('tab', { name: /Observations/ }).waitFor({ timeout: 15000 });
check('1280x720: no horizontal overflow', !(await p2.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)));
check('1280x720: vertical scroll', true, (await p2.evaluate(() => document.documentElement.scrollHeight > window.innerHeight)) ? 'page scrolls vertically' : 'no vertical scroll');
await p2.screenshot({ path: join(root, 'screens', '09-1280x720.png') });
await small.close();
await browser.close();

writeFileSync(join(evidence, 'results.json'), JSON.stringify({ base, videoPath, results }, null, 2));
writeFileSync(join(root, 'capture', 'ui-text.json'), JSON.stringify(texts, null, 2));
console.log(JSON.stringify({ videoPath, results }, null, 2));
