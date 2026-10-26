// spec: specs/checkout.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.use({ testIdAttribute: 'data-test' });

test.describe('Checkout', () => {
  test('Billing address required-field validation', async ({ page }) => {
    // 1. Reach the Billing Address step as guest.
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

    const proceed = page.getByRole('button', { name: 'Proceed to checkout' });
    await expect(page.getByRole('heading', { name: 'Billing Address' })).toBeVisible();
    await expect(page.getByLabel('Country')).toBeVisible();
    await expect(page.getByLabel('Postal code')).toBeVisible();
    await expect(page.getByLabel('House number')).toBeVisible();
    await expect(page.getByLabel('Street')).toBeVisible();
    await expect(page.getByLabel('City')).toBeVisible();
    await expect(page.getByLabel('State')).toBeVisible();
    await expect(
      page.getByText('Enter country, postal code and house number. We will fill in the rest automatically.'),
    ).toBeVisible();
    await expect(proceed).toBeDisabled();

    // 2. Fill only Postal code, then click into and out of House number, Street, City, State.
    await page.getByLabel('Postal code').fill('78701');
    await page.getByLabel('House number').click();
    await page.getByLabel('Street').click();
    await page.getByLabel('City').click();
    await page.getByLabel('State').click();
    await page.getByRole('heading', { name: 'Billing Address' }).click();

    // Observed: no inline required messages are rendered for the touched empty fields; the button stays disabled.
    await expect(proceed).toBeDisabled();

    // 3. Fill all fields with valid data one at a time, leaving State last.
    await page.getByLabel('Country').selectOption({ label: 'United States of America (the)' });
    await expect(proceed).toBeDisabled();
    await page.getByLabel('House number').fill('1');
    await expect(proceed).toBeDisabled();
    await page.getByLabel('Street').fill('Main St');
    await expect(proceed).toBeDisabled();
    await page.getByLabel('City').fill('Austin');
    await expect(proceed).toBeDisabled();
    await page.getByLabel('State').fill('TX');
    await expect(proceed).toBeEnabled();

    await proceed.click();
    await expect(page.getByLabel('Payment Method')).toBeVisible();
  });
});
