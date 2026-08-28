import { test, expect } from '@playwright/test';

test('home page loads and has a single h1', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
});

test('private-source case studies stay reachable without a broken source link', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/projects/');
  await expect(page.locator('article')).toHaveCount(9);
  await page
    .getByRole('link', { name: 'VFRM Agentic Design Assistant', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'VFRM Agentic Design Assistant',
  );
  await expect(page.getByText('Source code is private', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View source', exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.locator('a[href="https://github.com/GeorgeAnes/vfrm-agentic-design-assistant"]'),
  ).toHaveCount(0);

  await page.getByRole('link', { name: 'Projects', exact: true }).click();
  await page
    .getByRole('link', { name: 'Enterprise AI Document Risk Auditor', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: 'View source', exact: true }),
  ).toHaveAttribute(
    'href',
    'https://github.com/GeorgeAnes/enterprise-ai-document-risk-auditor',
  );
  expect(errors).toEqual([]);
});
