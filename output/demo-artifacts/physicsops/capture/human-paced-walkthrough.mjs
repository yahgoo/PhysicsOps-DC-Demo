// Human-paced, unedited walkthrough recording (review evidence, not a test run).
// Usage: node human-paced-walkthrough.mjs [baseURL]
import { chromium } from '@playwright/test';
import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] ?? 'http://localhost:4173';
const outDir = join(root, 'walkthrough');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: outDir, size: { width: 1440, height: 900 } } });
const page = await ctx.newPage();
const t0 = Date.now();
const marks = [];
const mark = (label) => marks.push({ t: +((Date.now() - t0) / 1000).toFixed(1), label });
const pause = (s) => page.waitForTimeout(s * 1000);
const click = async (locator) => {
  const box = await locator.boundingBox();
  if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 25 });
  await pause(0.6);
  await locator.click();
};

await page.goto(base);
await page.getByText('6 / 6 normal').waitFor();
mark('Overview: 6 / 6 normal, synthetic-data disclosure');
await pause(6);

await click(page.getByRole('button', { name: 'Start investigation' }));
mark('Start investigation: remaining four days reveal');
await page.getByRole('tab', { name: /Observations/ }).waitFor({ timeout: 20000 });
await page.getByText('5 / 6 normal').waitFor();
mark('Observations: approach +1.35 K, power +4.8%, flow +0.1%');
await pause(10);
for (const tab of ['Power', 'Flow', 'COP', 'approach']) {
  const t = page.getByRole('tab', { name: new RegExp(tab, 'i') }).first();
  if (await t.count()) {
    await click(t);
    mark(`Chart channel: ${tab}`);
    await pause(4);
  }
}

await click(page.getByRole('button', { name: 'Review competing explanations' }));
await page.getByText('Leading hypothesis — requires verification').waitFor();
mark('Hypotheses: three competing explanations');
await pause(10);

await click(page.getByRole('button', { name: /^Condenser heat-transfer degradation/ }));
mark('Evidence: 4 supporting · 0 weakening · 1 missing');
await pause(6);
await click(page.getByRole('button', { name: /Condenser approach elevated/ }));
mark('Evidence detail: approach calculation');
await pause(8);

await click(page.getByRole('button', { name: 'View engineering finding' }));
await page.getByRole('article', { name: 'Engineering finding' }).waitFor();
mark('Finding: observed values, leading hypothesis, alternatives');
await pause(10);
const finding = page.getByRole('article', { name: 'Engineering finding' });
const fbox = await finding.boundingBox();
if (fbox) {
  await page.mouse.move(fbox.x + fbox.width / 2, fbox.y + fbox.height / 2, { steps: 20 });
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 120); await pause(0.25); }
}
mark('Finding: scrolled to limitations');
await pause(8);

await click(page.getByRole('button', { name: 'Explore what-if deterioration' }));
mark('What-if: 10% further UA reduction selected');
await pause(4);
await click(page.getByRole('button', { name: 'Run what-if investigation' }));
await page.getByText(/Sensitivity analysis — not a calibrated forecast/).first().waitFor();
mark('What-if result: power +1.7%, approach +0.50 K, COP -1.7%');
await pause(12);

await click(page.getByRole('button', { name: 'Schedule inspection — demo' }));
mark('Inspection dialog (demo)');
await pause(6);
await click(page.getByRole('button', { name: 'Create demo inspection request' }));
await page.getByText('Demo inspection request created. No request was sent to a maintenance system.').waitFor();
mark('Inspection confirmation: nothing sent');
await pause(6);

const video = page.video();
await ctx.close();
await browser.close();
const final = join(outDir, 'physicsops-human-paced-walkthrough-unedited.webm');
renameSync(await video.path(), final);
writeFileSync(join(outDir, 'walkthrough-marks.json'), JSON.stringify(marks, null, 2) + '\n');
console.log(final);
console.log(JSON.stringify(marks));
