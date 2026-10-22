import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test('flight inspector, graph views, comparison, and CSV are usable', async ({ page }) => {
  await page.goto('/?sample=projectile');
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await expect(page.getByLabel('Type your math or physics problem')).toBeHidden();
  const inspector = page.getByRole('slider', { name: 'Inspect time' });
  await inspector.fill('0');
  await expect(page.getByLabel('Inspected flight point')).toContainText('0 m');
  await page.getByRole('button', { name: 'Peak', exact: true }).click();
  await expect(inspector).toHaveValue('0.5');
  await expect(page.getByLabel('Inspected flight point')).toContainText('Vertical v0 m/s');
  await page.getByRole('button', { name: 'Save comparison' }).click();
  await page.getByLabel('Gravity (m/s²)', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Earth', exact: true }).click();
  await expect(page.getByLabel('Gravity (m/s²)', { exact: true })).toHaveValue('9.81');
  await page.getByRole('button', { name: 'Moon', exact: true }).click();
  await expect(page.getByLabel('Gravity (m/s²)', { exact: true })).toHaveValue('1.62');
  await expect(page.getByText(/Saved launch: 20 m\/s/)).toContainText('g = 9.81');
  await page.getByRole('tab', { name: 'Height', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Height', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.getByRole('tab', { name: 'Height', exact: true }).press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Velocity', exact: true })).toBeFocused();
  await expect(page.getByText('Horizontal velocity', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Data', exact: true }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(12);
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('conceptlens-projectile.csv');
  const stream = await download.createReadStream();
  let csv = '';
  for await (const chunk of stream!) csv += chunk.toString();
  expect(csv.split('\r\n')).toHaveLength(82);
  expect(csv).toContain('time_s,distance_m,height_m,vx_m_s,vy_m_s,speed_m_s');
  await page.getByRole('button', { name: 'Make a prediction' }).click();
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Export CSV' })).toHaveCount(0);
  await expect(inspector).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('linear inspector, expanded domain, constants, and comparison stay accurate', async ({
  page,
}) => {
  await page.goto('/?sample=linear');
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await page.getByRole('button', { name: 'Save comparison' }).click();
  await page.getByLabel('Slope', { exact: true }).fill('-2');
  await page.getByLabel('Inspect x', { exact: true }).fill('4');
  await expect(page.getByText('f(4) =')).toContainText('-7');
  await expect(page.getByText(/Saved: y = 2x/)).toContainText('differs by -16');
  await page.getByLabel('X window (±)').fill('50');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await page.getByRole('button', { name: 'Fit', exact: true }).click();
  await page.getByRole('tab', { name: 'Data', exact: true }).click();
  await expect(page.getByRole('row').nth(1)).toContainText('-50');
  await page.getByLabel('Slope', { exact: true }).fill('0');
  await expect(page.getByText('None', { exact: true })).toBeVisible();
  await page.getByLabel('Intercept', { exact: true }).fill('0');
  await expect(page.getByText('Every x', { exact: true })).toBeVisible();
  await page.getByLabel('Slope', { exact: true }).fill('');
  await expect(page.getByText(/graph keeps the last valid value/)).toBeVisible();
  await page.getByLabel('Slope', { exact: true }).fill('1');
  await page.getByLabel('Slope', { exact: true }).fill('5e-324');
  await page.getByLabel('Intercept', { exact: true }).fill('1000');
  await expect(page.getByText('Outside numeric range', { exact: true })).toBeVisible();
  await page.getByLabel('Slope', { exact: true }).fill('1');
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('pending interpretation freezes the current flight and recovers on failure', async ({
  page,
}) => {
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/interpret', async (route) => {
    await waiting;
    await route.fulfill({
      status: 502,
      json: { error: 'The interpretation service is unavailable.' },
    });
  });
  await page.goto('/?sample=projectile');
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await page.getByRole('button', { name: 'New problem', exact: true }).click();
  await page.getByLabel('Type your math or physics problem').fill('A new launch problem');
  await page.getByRole('button', { name: 'Play flight' }).click();
  await page.getByRole('button', { name: 'Interpret problem' }).click();
  const inspector = page.getByRole('slider', { name: 'Inspect time' });
  await expect(inspector).toBeDisabled();
  const frozen = await inspector.inputValue();
  try {
    // Observe four playback ticks: this is a temporal freeze assertion, not a readiness wait.
    await page.waitForTimeout(200);
    expect(await inspector.inputValue()).toBe(frozen);
  } finally {
    release();
  }
  await expect(page.getByText('The interpretation service is unavailable.')).toBeVisible();
  await expect(inspector).toBeEnabled();
  await expect
    .poll(async () => Number(await inspector.inputValue()))
    .toBeGreaterThan(Number(frozen));
});

test('flight playback, vertical launches and reduced motion remain controllable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?sample=projectile');
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await page.getByRole('button', { name: 'Play flight' }).click();
  await expect
    .poll(async () => Number(await page.getByRole('slider', { name: 'Inspect time' }).inputValue()))
    .toBeGreaterThan(0.5);
  await page.getByRole('button', { name: 'Pause flight' }).click();
  await page.getByLabel('Launch angle (°)', { exact: true }).fill('90');
  await expect(page.getByRole('img', { name: /Trajectory: range 0.00/ })).toBeVisible();
  await page.getByLabel('Initial speed (m/s)', { exact: true }).fill('0');
  await expect(page.getByRole('button', { name: 'Play flight' })).toBeDisabled();
});
