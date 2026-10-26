// spec: specs/checkout.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.use({ testIdAttribute: 'data-test' });

test.describe('Checkout', () => {
  test('Guest sign-in validation: invalid email and empty fields', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Combination Pliers/ }).click();
    await page.getByTestId('add-to-cart').click();
    await page.getByTestId('nav-cart').click();
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    // 1. Open 'Continue as Guest' tab, enter email 'bad', first name 'Jane', last name 'Doe', click 'Continue as Guest'.
    await page.getByRole('tab', { name: 'Continue as Guest' }).click();
    const panel = page.getByRole('tabpanel');
    const email = panel.getByRole('textbox', { name: 'Email address' });
    const firstName = panel.getByRole('textbox', { name: 'First name' });
    const lastName = panel.getByRole('textbox', { name: 'Last name' });
    await email.fill('bad');
    await firstName.fill('Jane');
    await lastName.fill('Doe');
    await panel.getByRole('button', { name: 'Continue as Guest' }).click();

    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(panel.getByText('Email format is invalid')).toBeVisible();
    await expect(page.getByText(/Continuing as guest/)).toHaveCount(0);

    // 2. Clear all fields and click 'Continue as Guest'.
    await email.fill('');
    await firstName.fill('');
    await lastName.fill('');
    await panel.getByRole('button', { name: 'Continue as Guest' }).click();

    await expect(panel.getByText('Email is required')).toBeVisible();
    await expect(panel.getByText('First name is required')).toBeVisible();
    await expect(panel.getByText('Last name is required')).toBeVisible();
    await expect(panel.getByRole('heading', { name: 'Continue as Guest' })).toBeVisible();

    // 3. Switch to 'Sign in' tab and submit empty, then with wrong password.
    await page.getByRole('tab', { name: 'Sign in' }).click();
    await panel.getByRole('button', { name: 'Login' }).click();
    await expect(panel.getByText('Email is required')).toBeVisible();
    await expect(panel.getByText('Password is required')).toBeVisible();

    // Throwaway (non-existent) account is used so the shared demo user is not locked out.
    await panel.getByRole('textbox', { name: 'Email address' }).fill('nobody-qa@example.com');
    await panel.getByRole('textbox', { name: 'Password' }).fill('wrongpass1');
    await panel.getByRole('button', { name: 'Login' }).click();

    await expect(panel.getByText('Invalid email or password')).toBeVisible();
    await expect(page.getByText(/you are already logged in/)).toHaveCount(0);
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
  });
});
