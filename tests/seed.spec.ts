import { test, expect } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // Start agents on the checkout cart with one product, so they skip catalog browsing.
    await page.goto('/');
    await page.getByRole('link', { name: /Combination Pliers/ }).click();
    await page.getByTestId('add-to-cart').click();
    await expect(page.getByTestId('cart-quantity')).toHaveText('1');
    await page.getByTestId('nav-cart').click();
    await expect(page).toHaveURL(/\/checkout/);

    // generate code here.
  });
});
