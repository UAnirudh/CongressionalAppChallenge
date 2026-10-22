import { test, expect } from '@playwright/test';

test('projectile review, keyboard controls, and prediction', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /A ball in flight/ }).click();
  await page.getByLabel('Initial speed (m/s)').fill('10');
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await expect(page.getByText('10.19 m', { exact: true })).toBeVisible();
  const angle = page.getByRole('slider', { name: 'Launch angle', exact: true });
  await angle.focus();
  await angle.press('ArrowRight');
  expect(Number(await angle.inputValue())).toBeGreaterThan(45);
  await page.getByRole('button', { name: 'Make a prediction' }).click();
  await expect(page.getByText('Make your prediction to reveal the path.')).toBeVisible();
  await page.getByLabel('Your prediction (m)').fill('10.19');
  await page.getByRole('button', { name: 'Check prediction' }).click();
  await expect(
    page.getByRole('region', { name: 'Think before you reveal' }).getByRole('status'),
  ).toContainText('Correct.');
  await angle.press('ArrowRight');
  await expect(
    page.getByRole('region', { name: 'Think before you reveal' }).getByRole('status'),
  ).toBeEmpty();
  await expect(page.getByText('Make your prediction to reveal the path.')).toBeVisible();
});
test('fractional projectile parameters survive review without slider rounding', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: /A ball in flight/ }).click();
  await page.getByLabel('Initial speed (m/s)').fill('10.125');
  await page.getByLabel('Launch angle (degrees)').fill('45.125');
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await expect(page.getByRole('slider', { name: 'Initial speed', exact: true })).toHaveValue(
    '10.125',
  );
  await expect(page.getByRole('slider', { name: 'Launch angle', exact: true })).toHaveValue(
    '45.125',
  );
});
test('linear model updates and checks a prediction', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /A line with a pattern/ }).click();
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await page.getByLabel('Slope', { exact: true }).fill('-2');
  await page.getByLabel('Intercept', { exact: true }).fill('');
  await expect(page.getByLabel('Intercept', { exact: true })).toHaveValue('');
  await page.getByLabel('Intercept', { exact: true }).fill('1');
  await page.getByRole('button', { name: 'Make a prediction' }).click();
  await page.getByLabel('Your prediction (unitless)').fill('-5');
  await page.getByRole('button', { name: 'Check prediction' }).click();
  await expect(
    page.getByRole('region', { name: 'Think before you reveal' }).getByRole('status'),
  ).toContainText('Correct.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('typed AI model opens its dedicated tab and unsupported output is honest', async ({
  page,
}) => {
  await page.route('**/api/interpret', (route) =>
    route.fulfill({
      json: {
        status: 'supported',
        problem: {
          type: 'linear_function',
          slope: 3,
          intercept: -2,
          xUnit: 'unitless',
          yUnit: 'unitless',
          assumptions: ['Unitless axes.'],
        },
      },
    }),
  );
  await page.goto('/');
  await page.getByLabel('Type your math or physics problem').fill('y = 3x - 2');
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Interpret problem' }).click();
  const problemTab = await popup;
  await expect(
    problemTab.getByRole('heading', { name: 'Linear function', exact: true }),
  ).toBeVisible();
  await problemTab.getByRole('button', { name: 'Edit model & assumptions' }).click();
  await expect(problemTab.getByLabel('Slope (unitless)')).toHaveValue('3');
  await expect(page.getByRole('heading', { name: 'Linear function', exact: true })).toHaveCount(0);
  await page.route('**/api/interpret', (route) =>
    route.fulfill({ json: { status: 'unsupported', reason: 'Calculus is not supported.' } }),
  );
  await page.getByLabel('Type your math or physics problem').fill('integrate x');
  await page.getByRole('button', { name: 'Interpret problem' }).click();
  await expect(page.getByText('Unsupported problem: Calculus is not supported.')).toBeVisible();
});
test('API failure and image selection are recoverable', async ({ page }) => {
  await page.route('**/api/interpret', (route) =>
    route.fulfill({
      status: 503,
      json: { error: 'AI interpretation is not configured on this server.' },
    }),
  );
  await page.goto('/');
  await page.getByLabel('Or upload a problem image').setInputFiles({
    name: 'problem.png',
    mimeType: 'image/png',
    buffer: Buffer.from('test-image'),
  });
  await expect(page.getByRole('checkbox', { name: /I agree to send this image/ })).toBeVisible();
  await page.getByRole('checkbox', { name: /I agree to send this image/ }).check();
  await page.getByRole('button', { name: 'Interpret problem' }).click();
  await expect(page.getByText('AI interpretation is not configured on this server.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Interpret problem' })).toBeEnabled();
  await page.getByRole('button', { name: /A line with a pattern/ }).click();
  await expect(page.getByRole('heading', { name: 'Check your model' })).toBeVisible();
});
test('interpretation blocks competing sample selection while pending', async ({ page }) => {
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/interpret', async (route) => {
    await waiting;
    await route.fulfill({ json: { status: 'unsupported', reason: 'Test unsupported problem.' } });
  });
  await page.goto('/');
  await page.getByLabel('Type your math or physics problem').fill('y=2x');
  await page.getByRole('button', { name: 'Interpret problem' }).click();
  await expect(page.getByRole('button', { name: /A ball in flight/ })).toBeDisabled();
  release();
  await expect(page.getByRole('button', { name: /A ball in flight/ })).toBeEnabled();
});
test('failed interpretation preserves the existing edited model', async ({ page }) => {
  await page.route('**/api/interpret', (route) =>
    route.fulfill({ status: 502, json: { error: 'The interpretation service is unavailable.' } }),
  );
  await page.goto('/');
  await page.getByRole('button', { name: /A line with a pattern/ }).click();
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await page.getByLabel('Slope', { exact: true }).fill('-4');
  await page.getByRole('button', { name: 'New problem', exact: true }).click();
  await page.getByLabel('Type your math or physics problem').fill('new problem');
  await page.getByRole('button', { name: 'Interpret problem' }).click();
  await expect(page.getByText('The interpretation service is unavailable.')).toBeVisible();
  await expect(page.getByLabel('Slope', { exact: true })).toHaveValue('-4');
  await expect(page.getByLabel('Slope', { exact: true })).toBeEnabled();
});
