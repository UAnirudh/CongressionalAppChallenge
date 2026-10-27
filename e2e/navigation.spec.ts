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
  const topicGroup = page.getByRole('radiogroup', { name: 'Physics topics' });
  const projectileTopic = topicGroup.getByRole('radio', { name: /Projectile motion/ });
  await expect(projectileTopic).toBeChecked();
  await projectileTopic.press('ArrowRight');
  const motionTopic = topicGroup.getByRole('radio', { name: /Motion & speed/ });
  await expect(motionTopic).toBeChecked();
  await expect(topicGroup.locator('[aria-checked="true"]')).toHaveCount(1);
  await expect(motionTopic).toBeFocused();
  await motionTopic.press('ArrowLeft');
  await expect(projectileTopic).toBeChecked();
  await page.getByRole('link', { name: /How far will it travel/ }).click();
  await expect(page.getByRole('heading', { name: 'How far will it travel?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'See the relationship' })).toBeVisible();
  await page.getByRole('button', { name: /Start practice/ }).click();
  await page.getByLabel('Horizontal range').fill('40.77');
  await page.getByRole('button', { name: /Check answer/ }).click();
  await expect(page.getByRole('status')).toContainText('You found the answer');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Exercise library' })
    .click();
  await page.getByRole('tab', { name: /Math 3 topics/ }).click();
  await page.getByRole('link', { name: /Follow the line/ }).click();
  await expect(page.getByRole('heading', { name: 'Follow the line' })).toBeVisible();
  await page.getByRole('button', { name: /Start practice/ }).click();
  await page.getByLabel('Value of y').fill('7');
  await page.getByRole('button', { name: /Check answer/ }).click();
  await expect(page.getByRole('status')).toContainText('You found the answer');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('guide, privacy link, and return to the lab work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Your data & privacy' }).click();
  await expect(page).toHaveURL(/\/guide#your-data$/);
  await expect(page.getByRole('heading', { name: 'Know what you’re sharing.' })).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.getByRole('link', { name: 'Open the lab' }).click();
  await expect(page.getByRole('button', { name: 'Interpret problem' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
