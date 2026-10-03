// Supplemental human-paced, unedited capture (review footage, separate run from the walkthrough).
// Covers: remaining evidence items (S4), finding limitations close-up (S5), what-if assumptions (S6),
// How it works dialog (S5/S8). Also writes 2x-DPR stills for readable holds.
// Usage: node supplemental-captures.mjs [baseURL]
import { chromium } from '@playwright/test';
import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] ?? 'http://localhost:4173';
const outDir = join(root, 'supplemental');
const stillDir = join(outDir, 'stills');
mkdirSync(stillDir, { recursive: true });

const EVIDENCE = [
  /Compressor power rises in line/,
  /Measured condenser-water flow comparatively stable/,
  /Pattern persists and grows over time/,
  /No independent condensing-pressure/,
];

async function journey(page, { pause, click, mark, still }) {
  await page.goto(base);
  await page.getByText('6 / 6 normal').waitFor();
  await click(page.getByRole('button', { name: 'Start investigation' }));
  await page.getByText('5 / 6 normal').waitFor({ timeout: 20000 });
  await click(page.getByRole('button', { name: 'Review competing explanations' }));
  await page.getByText('Leading hypothesis — requires verification').waitFor();
  await click(page.getByRole('button', { name: /^Condenser heat-transfer degradation/ }));
  mark('S4: evidence list, all items closed');
  await pause(3);
  for (const name of EVIDENCE) {
    await click(page.getByRole('button', { name }));
    mark(`S4: evidence item opened: ${name.source}`);
    await pause(4);
  }
  await still('s4-evidence-all-open', page.getByRole('list', { name: 'Evidence' }));

  await click(page.getByRole('button', { name: 'View engineering finding' }));
  const finding = page.getByRole('article', { name: 'Engineering finding' });
  await finding.waitFor();
  const lim = finding.locator('div', { has: page.getByRole('heading', { name: 'Limitations', exact: true }) }).last();
  await lim.scrollIntoViewIfNeeded();
  mark('S5: finding limitations (five items)');
  await pause(15);
  await still('s5-finding-limitations', lim);

  await click(page.getByRole('button', { name: 'Explore what-if deterioration' }));
  await click(page.getByRole('button', { name: 'Run what-if investigation' }));
  await page.getByText(/Sensitivity analysis — not a calibrated forecast/).first().waitFor();
  mark('S6: what-if result at 10%');
  await pause(3);
  await click(page.getByText('Model assumptions and limitations'));
  const details = page.locator('details', { hasText: 'Model assumptions and limitations' });
  await details.scrollIntoViewIfNeeded();
  mark('S6: model assumptions and limitations expanded (timing statement)');
  await pause(12);
  await still('s6-what-if-assumptions', page.locator('div[aria-live="polite"]'));

  await click(page.getByRole('button', { name: 'How it works' }));
  const dialog = page.getByRole('dialog', { name: 'How it works' });
  await dialog.waitFor();
  mark('S5/S8: How it works dialog open');
  await pause(3);
  for (const [heading, label, secs] of [
    ['Hypotheses and evidence', 'S5: "Evidence strength is a qualitative label, not a probability."', 10],
    ['What this demo does not do', 'S8: "What this demo does not do"', 10],
  ]) {
    const block = dialog.locator('section', { has: page.getByRole('heading', { name: heading }) });
    const box = await dialog.boundingBox();
    if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 20 });
    for (let i = 0; i < 20; i++) {
      const b = await block.boundingBox();
      if (!b || b.y + b.height < 850) break;
      await page.mouse.wheel(0, 100);
      await pause(0.25);
    }
    mark(label);
    await pause(secs);
    await still(`s${heading.startsWith('What') ? '8-how-it-works-does-not-do' : '5-how-it-works-not-a-probability'}`, block);
  }
}

const browser = await chromium.launch();

// Pass 1: unedited 1440x900 recording.
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: outDir, size: { width: 1440, height: 900 } } });
const page = await ctx.newPage();
const t0 = Date.now();
const marks = [];
const pause = (s) => page.waitForTimeout(s * 1000);
await journey(page, {
  pause,
  mark: (label) => marks.push({ t: +((Date.now() - t0) / 1000).toFixed(1), label }),
  click: async (locator) => {
    const box = await locator.boundingBox();
    if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 25 });
    await pause(0.6);
    await locator.click();
  },
  still: async () => {},
});
const video = page.video();
await ctx.close();
const final = join(outDir, 'physicsops-supplemental-captures-unedited.webm');
renameSync(await video.path(), final);
writeFileSync(join(outDir, 'supplemental-marks.json'), JSON.stringify(marks, null, 2) + '\n');

// Pass 2: 2x-DPR stills of the same states for readable holds (no video).
const sctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const sp = await sctx.newPage();
await journey(sp, {
  pause: async () => {},
  mark: () => {},
  click: (l) => l.click(),
  still: async (name, locator) => {
    await sp.waitForTimeout(300);
    await locator.screenshot({ path: join(stillDir, `${name}@2x.png`) });
    await sp.screenshot({ path: join(stillDir, `${name}-full@2x.png`) });
  },
});
await sctx.close();
await browser.close();
console.log(final);
console.log(JSON.stringify(marks));
