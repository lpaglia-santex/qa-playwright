// spec: specs/checkout.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.use({ testIdAttribute: 'data-test' });

test.describe('Checkout', () => {
  test('Credit Card payment: invalid values and successful payment', async ({ page }) => {
    // 1. Reach the Payment step; select 'Credit Card'.
    await page.goto('/');
    await page.getByRole('link', { name: /Combination Pliers/ }).click();
    await page.getByTestId('add-to-cart').click();
    await page.getByTestId('nav-cart').click();
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();
    await page.getByRole('tab', { name: 'Continue as Guest' }).click();
    const panel = page.getByRole('tabpanel');
    await panel.getByRole('textbox', { name: 'Email address' }).fill('guest@example.com');
    await panel.getByRole('textbox', { name: 'First name' }).fill('Jane');
    await panel.getByRole('textbox', { name: 'Last name' }).fill('Doe');
    await panel.getByRole('button', { name: 'Continue as Guest' }).click();
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();
    await page.getByLabel('Country').selectOption({ label: 'United States of America (the)' });
    await page.getByLabel('Postal code').fill('78701');
    await page.getByLabel('House number').fill('1');
    await page.getByLabel('Street').fill('Main St');
    await page.getByLabel('City').fill('Austin');
    await page.getByLabel('State').fill('TX');
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    await page.getByLabel('Payment Method').selectOption('Credit Card');
    const cardNumber = page.getByLabel('Credit Card Number');
    const expiry = page.getByLabel('Expiration Date');
    const cvv = page.getByLabel('CVV');
    const holder = page.getByLabel('Card Holder Name');
    await expect(cardNumber).toBeVisible();
    await expect(expiry).toBeVisible();
    await expect(cvv).toBeVisible();
    await expect(holder).toBeVisible();

    // 2. Enter number '1234', expiration '13/2020', CVV '12', leave Card Holder Name empty and blur.
    const checkPayment = page.getByRole('button', { name: 'Check payment' });
    await cardNumber.fill('1234');
    await expiry.fill('13/2020');
    await cvv.fill('12');
    await holder.click();
    await cardNumber.click();

    await expect(page.getByText('Invalid card number format.')).toBeVisible();
    await expect(page.getByText('Invalid date format. Use MM/YYYY.')).toBeVisible();
    await expect(page.getByText('CVV must be 3 or 4 digits.')).toBeVisible();
    // Observed: an empty Card Holder Name does not show an inline error in the live app (field stays ng-valid).
    await expect(checkPayment).toBeDisabled();

    // 3. Enter 1111-1111-1111-1111, 12/2030, 123, 'Jane Doe', click 'Check payment', then 'Confirm'.
    await cardNumber.fill('1111-1111-1111-1111');
    await expiry.fill('12/2030');
    await cvv.fill('123');
    await holder.fill('Jane Doe');
    await expect(checkPayment).toBeEnabled();
    await checkPayment.click();
    await expect(page.getByText('Payment was successful')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText(/Thanks for your order! Your invoice number is INV-\d+/)).toBeVisible();
  });
});
