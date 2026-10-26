// spec: specs/checkout.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.use({ testIdAttribute: 'data-test' });

test.describe('Checkout', () => {
  test('Bank Transfer required fields and payment method switching', async ({ page }) => {
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

    const paymentMethod = page.getByLabel('Payment Method');
    const checkPayment = page.getByRole('button', { name: 'Check payment' });
    const bankName = page.getByLabel('Bank Name');
    const accountName = page.getByLabel('Account Name');
    const accountNumber = page.getByLabel('Account Number');

    // 1. Select 'Bank Transfer' and leave Bank Name, Account Name, Account Number blank.
    await paymentMethod.selectOption('Bank Transfer');
    await expect(bankName).toBeVisible();
    await bankName.click();
    await accountName.click();
    await accountNumber.click();
    await bankName.click();
    await expect(checkPayment).toBeDisabled();
    // Observed: only the Account Number field renders an inline error ("Account number must be numeric.").
    await expect(page.getByText('Account number must be numeric.')).toBeVisible();

    // 2. Enter non-numeric/spaced/hyphenated Account Number ('12 34-ab').
    await accountNumber.fill('12 34-ab');
    await bankName.fill('Test Bank');
    await accountName.fill('Jane Doe');
    await expect(page.getByText('Account number must be numeric.')).toBeVisible();
    await expect(checkPayment).toBeDisabled();

    // 3. Switch to 'Cash on Delivery', then 'Credit Card'.
    await paymentMethod.selectOption('Cash on Delivery');
    await expect(bankName).toBeHidden();
    await expect(accountName).toBeHidden();
    await expect(accountNumber).toBeHidden();
    await expect(page.getByLabel('Credit Card Number')).toBeHidden();
    await expect(checkPayment).toBeEnabled();

    await paymentMethod.selectOption('Credit Card');
    await expect(bankName).toBeHidden();
    await expect(page.getByLabel('Credit Card Number')).toBeVisible();
    await expect(page.getByLabel('Expiration Date')).toBeVisible();
    await expect(page.getByLabel('CVV')).toBeVisible();
    await expect(page.getByLabel('Card Holder Name')).toBeVisible();
    // Previous Bank Transfer values do not leak into the new method's fields.
    await expect(page.getByLabel('Credit Card Number')).toHaveValue('');
    await expect(page.getByLabel('Expiration Date')).toHaveValue('');
    await expect(page.getByLabel('CVV')).toHaveValue('');
    await expect(page.getByLabel('Card Holder Name')).toHaveValue('');

    // UNVERIFIED: switching back to 'Choose your payment method' hung the live browser tool
    // (the placeholder option appears not to be selectable), so that sub-step is not automated.
  });
});
