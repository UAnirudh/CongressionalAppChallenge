import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('image selection can be replaced or removed and requires fresh consent', async ({ page }) => {
  await page.goto('/');
  const image = page.getByLabel('Or upload a problem image');
  await image.setInputFiles({
    name: 'first.png',
    mimeType: 'image/png',
    buffer: Buffer.from('first-image'),
  });
  const consent = page.getByRole('checkbox', { name: /I agree to send this image/ });
  await consent.check();
  await image.setInputFiles({
    name: 'second.png',
    mimeType: 'image/png',
    buffer: Buffer.from('second-image'),
  });
  await expect(consent).not.toBeChecked();
  await expect(page.getByText('second.png', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove image' }).click();
  await expect(consent).toHaveCount(0);
  await expect(image).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Interpret problem' })).toBeEnabled();
});

test('exercise library opens each editable model and navigation stays accessible', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Exercise library' })
    .click();
  await expect(page.getByRole('link', { name: 'Exercise library', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.getByRole('link', { name: /A ball in flight/ }).click();
  await expect(page.getByRole('heading', { name: 'Check your model' })).toBeFocused();
  await expect(page.getByLabel('Initial speed (m/s)')).toHaveValue('20');
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await expect(page.getByRole('heading', { name: 'Projectile motion', exact: true })).toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name: 'Exercise library' }).click();
  await page.getByRole('link', { name: /A line with a pattern/ }).click();
  await expect(page.getByLabel('Slope (unitless)')).toHaveValue('2');
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await expect(page.getByRole('heading', { name: 'Linear function', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('guide, privacy link, and return to the lab work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Your data & privacy' }).click();
  await expect(page).toHaveURL(/\/guide#your-data$/);
  await expect(page.getByRole('heading', { name: 'Your question. Your choice.' })).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.getByRole('link', { name: 'Let’s explore' }).click();
  await expect(page.getByRole('button', { name: 'Interpret problem' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
