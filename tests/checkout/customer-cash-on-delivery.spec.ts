// spec: specs/checkout.md
// seed: tests/seed.spec.ts
// NOTE: uses the shared demo account customer@practicesoftwaretesting.com / welcome01, which may be locked.

import { test, expect } from '@playwright/test';

test.use({ testIdAttribute: 'data-test' });

test.describe('Checkout', () => {
  test('Happy path: logged-in customer pays by Cash on Delivery and gets order confirmation', async ({ page }) => {
    // 1. Add a product, open cart, click 'Proceed to checkout'. On the 'Sign in' tab enter credentials, click 'Login'.
    await page.goto('/');
    await page.getByRole('link', { name: /Combination Pliers/ }).click();
    await page.getByTestId('add-to-cart').click();
    await page.getByTestId('nav-cart').click();
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    const signInPanel = page.getByRole('tabpanel');
    await signInPanel.getByRole('textbox', { name: 'Email address' }).fill('customer@practicesoftwaretesting.com');
    await signInPanel.getByRole('textbox', { name: 'Password' }).fill('welcome01');
    await signInPanel.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByTestId('nav-menu')).toContainText('Jane Doe');
    await expect(page.getByText('Hello Jane Doe, you are already logged in.')).toBeVisible();

    // 2. Click 'Proceed to checkout'. Fill billing address. Click 'Proceed to checkout'.
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();
    await expect(page.getByRole('heading', { name: 'Billing Address' })).toBeVisible();
    await page.getByLabel('Country').selectOption({ label: 'United States of America (the)' });
    await page.getByLabel('Postal code').fill('78701');
    await page.getByLabel('House number').fill('1');
    await page.getByLabel('Street').fill('Main St');
    await page.getByLabel('City').fill('Austin');
    await page.getByLabel('State').fill('TX');
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    const paymentMethod = page.getByLabel('Payment Method');
    await expect(paymentMethod).toBeVisible();
    await expect(paymentMethod.getByRole('option')).toHaveText([
      'Choose your payment method',
      'Bank Transfer',
      'Cash on Delivery',
      'Credit Card',
      'Buy Now Pay Later',
      'Gift Card',
    ]);

    // 3. Select 'Cash on Delivery', click 'Check payment', then click 'Confirm'.
    await paymentMethod.selectOption('Cash on Delivery');
    await page.getByRole('button', { name: 'Check payment' }).click();
    await expect(page.getByText('Payment was successful')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText(/Thanks for your order! Your invoice number is INV-\d+\./)).toBeVisible();
    await expect(page.getByTestId('cart-quantity')).toHaveCount(0);
  });
});
