import { expect, test } from '@playwright/test';

const shots = process.env.SCREENSHOT_DIR;

test('walks the investigation story end to end', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: /PhysicsOps/ })).toBeVisible();
  await expect(page.getByText('Synthetic demo data')).toBeVisible();
  await expect(page.getByText('6 / 6 normal')).toBeVisible();
  const noVerticalScroll = await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight);
  expect(noVerticalScroll).toBe(true);
  if (shots) await page.screenshot({ path: `${shots}/01-normal.png` });

  await page.getByRole('button', { name: 'Start investigation' }).click();
  await expect(page.getByRole('tab', { name: /Observations/ })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('5 / 6 normal')).toBeVisible();
  await expect(page.getByText('Something is abnormal')).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/02-observations.png` });

  await page.getByRole('button', { name: 'Review competing explanations' }).click();
  await expect(page.getByText('Leading hypothesis — requires verification')).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/03-hypotheses.png` });

  await page.getByRole('button', { name: /^Condenser heat-transfer degradation/ }).click();
  await page.getByRole('button', { name: /Condenser approach elevated/ }).click();
  await expect(page.getByText(/Approach = T_cond,sat − T_CW,out/)).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/04-evidence.png` });

  await page.getByRole('button', { name: 'View engineering finding' }).click();
  await expect(page.getByRole('article', { name: 'Engineering finding' })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Finding/ })).toHaveAttribute('data-state', 'active');
  await expect(page.getByText(/Medium — requires verification/)).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/05-finding.png` });

  await page.getByRole('button', { name: 'Explore what-if deterioration' }).click();
  await page.getByRole('button', { name: 'Run what-if investigation' }).click();
  await expect(page.getByText(/Sensitivity analysis — not a calibrated forecast/)).toBeVisible();
  await expect(page.getByRole('tab', { name: 'What-if sensitivity' })).toHaveAttribute('data-state', 'active');
  if (shots) await page.screenshot({ path: `${shots}/06-what-if.png` });

  await page.getByRole('button', { name: 'Schedule inspection — demo' }).click();
  await page.getByRole('button', { name: 'Create demo inspection request' }).click();
  await expect(page.getByText('Demo inspection request created. No request was sent to a maintenance system.')).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/07-inspection.png` });

  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('button', { name: 'Start investigation' })).toBeVisible();
  await expect(page.getByText('6 / 6 normal')).toBeVisible();
  expect(errors).toEqual([]);
});

test('keeps the core layout usable at 1280×720', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start investigation' }).click();
  await expect(page.getByRole('tab', { name: /Observations/ })).toBeVisible({ timeout: 15_000 });
  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflowX).toBe(false);
  await expect(page.getByRole('button', { name: 'Schedule inspection — demo' })).toBeInViewport();
  if (shots) await page.screenshot({ path: `${shots}/08-1280x720.png` });
});
