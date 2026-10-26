// spec: specs/checkout.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.use({ testIdAttribute: 'data-test' });

test.describe('Checkout', () => {
  test('Happy path: guest checkout with Bank Transfer', async ({ page }) => {
    // 1. Add a product, go to cart, click 'Proceed to checkout', open the 'Continue as Guest' tab.
    await page.goto('/');
    await page.getByRole('link', { name: /Combination Pliers/ }).click();
    await page.getByTestId('add-to-cart').click();
    await page.getByTestId('nav-cart').click();
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();
    await page.getByRole('tab', { name: 'Continue as Guest' }).click();

    const guestPanel = page.getByRole('tabpanel');
    await expect(guestPanel.getByRole('heading', { name: 'Continue as Guest' })).toBeVisible();
    await expect(guestPanel.getByText('Checkout without creating an account')).toBeVisible();
    await expect(guestPanel.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(guestPanel.getByRole('textbox', { name: 'First name' })).toBeVisible();
    await expect(guestPanel.getByRole('textbox', { name: 'Last name' })).toBeVisible();

    // 2. Enter guest@example.com / Jane / Doe, click 'Continue as Guest'.
    await guestPanel.getByRole('textbox', { name: 'Email address' }).fill('guest@example.com');
    await guestPanel.getByRole('textbox', { name: 'First name' }).fill('Jane');
    await guestPanel.getByRole('textbox', { name: 'Last name' }).fill('Doe');
    await guestPanel.getByRole('button', { name: 'Continue as Guest' }).click();

    await expect(page.getByText('Continuing as guest: Jane Doe (guest@example.com)')).toBeVisible();

    // 3. Click 'Proceed to checkout', fill billing address, proceed, pay by Bank Transfer and confirm.
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();
    await page.getByLabel('Country').selectOption({ label: 'United States of America (the)' });
    await page.getByLabel('Postal code').fill('78701');
    await page.getByLabel('House number').fill('1');
    await page.getByLabel('Street').fill('Main St');
    await page.getByLabel('City').fill('Austin');
    await page.getByLabel('State').fill('TX');
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    await page.getByLabel('Payment Method').selectOption('Bank Transfer');
    await page.getByLabel('Bank Name').fill('Test Bank');
    await page.getByLabel('Account Name').fill('Jane Doe');
    await page.getByLabel('Account Number').fill('12345678');
    await page.getByRole('button', { name: 'Check payment' }).click();
    await expect(page.getByText('Payment was successful')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText(/Thanks for your order! Your invoice number is INV-\d+/)).toBeVisible();
  });
});
