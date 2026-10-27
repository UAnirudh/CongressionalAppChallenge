import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import sharp from 'sharp';

test('Groq image interpretation requires consent and reaches editable review and exploration', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.addInitScript(() => {
    window.open = () => null;
  });
  let submissions = 0;
  await page.route('**/api/interpret', async (route) => {
    submissions++;
    const form = await new Response(new Uint8Array(route.request().postDataBuffer() ?? []), {
      headers: { 'Content-Type': route.request().headers()['content-type'] },
    }).formData();
    expect(form.get('imageConsent')).toBe('yes');
    expect(form.get('text')).toBe('Read the equation in this image.');
    expect(form.get('image')).toBeInstanceOf(File);
    await route.fulfill({
      json: {
        status: 'supported',
        problem: {
          type: 'linear_function',
          slope: 3,
          intercept: -7,
          xUnit: 'unitless',
          yUnit: 'unitless',
          assumptions: ['Read y = 3x - 7 from the image.'],
        },
      },
    });
  });
  await page.goto(`http://127.0.0.1:${process.env.E2E_VISION_PORT || 3202}/`);
  await expect(page.getByText(/Typed problems are sent to NVIDIA/)).toBeVisible();
  await expect(page.getByText(/Images and accompanying text are sent to Groq/)).toBeVisible();
  const image = page.getByLabel('Or upload a problem image');
  const consent = page.getByRole('checkbox', { name: /I agree to send this image.*Groq/ });
  await page
    .getByLabel('Type your math or physics problem')
    .fill('Read the equation in this image.');
  await image.setInputFiles({ name: 'empty.png', mimeType: 'image/png', buffer: Buffer.alloc(0) });
  await consent.check();
  await page.getByRole('button', { name: 'Interpret problem' }).click();
  await expect(page.getByRole('status')).toContainText('Use a nonempty PNG');
  expect(submissions).toBe(0);
  const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: 'white' } })
    .png()
    .toBuffer();
  await image.setInputFiles({ name: 'equation.png', mimeType: 'image/png', buffer: png });
  await expect(consent).not.toBeChecked();
  await page.getByRole('button', { name: 'Interpret problem' }).click();
  expect(submissions).toBe(0);
  await consent.check();
  await image.setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: png });
  await expect(consent).not.toBeChecked();
  await consent.check();
  await page
    .getByLabel('Type your math or physics problem')
    .fill('Read the equation in this image.');
  await page.getByRole('button', { name: 'Interpret problem' }).click();
  await expect(page).toHaveURL(/\/problem\?handoff=/);
  const problemTab = page;
  await expect(problemTab.getByRole('heading', { name: 'Check your model' })).toBeFocused();
  await expect(problemTab.getByLabel('Slope (unitless)')).toHaveValue('3');
  await expect(problemTab.getByLabel('Intercept (unitless)')).toHaveValue('-7');
  await expect(
    problemTab.getByRole('img', { name: 'Uploaded problem image for review' }),
  ).toBeVisible();
  await expect(problemTab.getByRole('tab')).toHaveCount(0);
  await problemTab.getByLabel('Slope (unitless)').fill('4');
  await problemTab.getByRole('button', { name: 'Confirm and explore' }).click();
  await problemTab.getByRole('tab', { name: /Graph & controls/ }).click();
  await expect(
    problemTab.getByRole('heading', { name: 'Linear function', exact: true }),
  ).toBeVisible();
  await expect(problemTab.getByLabel('Slope', { exact: true })).toHaveValue('4');
  expect(submissions).toBe(1);
  expect(
    (
      await new AxeBuilder({ page: problemTab })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});
