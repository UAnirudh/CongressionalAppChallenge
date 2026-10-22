import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('landing, review, and both simulators pass automated accessibility checks', async ({
  page,
}) => {
  // This journey performs four full axe scans, so budget for the whole audit.
  test.setTimeout(60000);
  await page.goto('/');
  async function check() {
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  await check();
  await page.getByRole('button', { name: /A ball in flight/ }).click();
  await expect(page.getByRole('heading', { name: 'Check your model' })).toBeFocused();
  await check();
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await expect(page.getByRole('heading', { name: 'Projectile motion', exact: true })).toBeFocused();
  await check();
  await page.getByRole('button', { name: 'New problem', exact: true }).click();
  await page.getByRole('button', { name: /A line with a pattern/ }).click();
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await check();
});
