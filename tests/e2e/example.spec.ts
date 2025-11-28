import { test, expect } from '@playwright/test';

test.describe('App shell', () => {
  test('serves the root document', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  });
});

