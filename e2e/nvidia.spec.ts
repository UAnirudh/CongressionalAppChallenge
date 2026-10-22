import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('NVIDIA text interpretation reaches review and exploration with honest image capabilities', async ({
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
  await page.goto(`http://127.0.0.1:${process.env.E2E_NVIDIA_PORT || 3101}/`);
  await expect(page.getByText(/Problem text is sent to NVIDIA/)).toBeVisible();
  await expect(page.getByLabel('Or upload a problem image')).toBeDisabled();
  await expect(
    page.getByText('GPT-OSS on NVIDIA reads text only. Type or paste your problem above.'),
  ).toBeVisible();
  await page.getByLabel('Type your math or physics problem').fill('y = 3x - 2');
  await page.getByRole('button', { name: 'Interpret problem' }).click();
  await expect(page.getByRole('heading', { name: 'Check your model' })).toBeFocused();
  await expect(page.getByLabel('Slope (unitless)')).toHaveValue('3');
  await page.getByRole('button', { name: 'Confirm and explore' }).click();
  await expect(page.getByRole('heading', { name: 'Linear function', exact: true })).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
});
