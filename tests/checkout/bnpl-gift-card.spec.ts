// spec: specs/checkout.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';

test.use({ testIdAttribute: 'data-test' });

async function reachPaymentStepAsGuest(page: Page) {
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
  await expect(page.getByLabel('Payment Method')).toBeVisible();
}

test.describe('Checkout', () => {
  test('Buy Now Pay Later and Gift Card payment methods', async ({ page }) => {
    // 1. At Payment step select 'Buy Now Pay Later'.
    await reachPaymentStepAsGuest(page);
    await page.getByLabel('Payment Method').selectOption('Buy Now Pay Later');

    const installments = page.getByLabel('Monthly Installments');
    await expect(installments.getByRole('option')).toHaveText([
      'Choose your monthly installments',
      '3 Monthly Installments',
      '6 Monthly Installments',
      '9 Monthly Installments',
      '12 Monthly Installments',
    ]);
    await expect(page.getByText('This option allows you to spread the cost of your purchase over several months.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Check payment' })).toBeDisabled();

    // 2. Choose '6 Monthly Installments', Check payment, Confirm.
    await installments.selectOption('6 Monthly Installments');
    await page.getByRole('button', { name: 'Check payment' }).click();
    await expect(page.getByText('Payment was successful')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText(/Thanks for your order! Your invoice number is INV-\d+/)).toBeVisible();

    // 3. In a new order select 'Gift Card', leave empty, then invalid Validation Code, then valid values.
    await reachPaymentStepAsGuest(page);
    await page.getByLabel('Payment Method').selectOption('Gift Card');
    const giftCardNumber = page.getByLabel('Gift Card Number');
    const validationCode = page.getByLabel('Validation Code');
    const checkPayment = page.getByRole('button', { name: 'Check payment' });
    await expect(giftCardNumber).toBeVisible();
    await expect(validationCode).toBeVisible();
    await expect(checkPayment).toBeDisabled();

    await validationCode.fill('AB');
    await giftCardNumber.click();
    await validationCode.click();
    await giftCardNumber.click();
    await expect(page.getByText('Please enter a valid gift card number: exactly 16 letters and/or digits.')).toBeVisible();
    await expect(page.getByText('Please enter a valid validation code: exactly 4 letters and/or digits.')).toBeVisible();
    await expect(checkPayment).toBeDisabled();

    await giftCardNumber.fill('ABCD1234EFGH5678');
    await validationCode.fill('AB12');
    await expect(checkPayment).toBeEnabled();
    await checkPayment.click();
    await expect(page.getByText('Payment was successful')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText(/Thanks for your order! Your invoice number is INV-\d+/)).toBeVisible();
  });
});
