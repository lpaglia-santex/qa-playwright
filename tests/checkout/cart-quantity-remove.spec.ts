// spec: specs/checkout.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.use({ testIdAttribute: 'data-test' });

test.describe('Checkout', () => {
  test('Cart: add product, update quantity and remove item', async ({ page }) => {
    // 1. From Home click the first product card, then click Add to cart. Click the cart link in the header.
    await page.goto('/');
    await page.getByRole('link', { name: /Combination Pliers/ }).click();
    await page.getByTestId('add-to-cart').click();
    await page.getByTestId('nav-cart').click();

    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByRole('columnheader', { name: 'Item' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Quantity' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Price' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total' })).toBeVisible();
    const quantity = page.getByRole('spinbutton', { name: 'Quantity for Combination Pliers' });
    await expect(quantity).toHaveValue('1');
    await expect(page.getByTestId('cart-quantity')).toHaveText('1');

    // 2. Change 'Quantity for <product>' to 3 and press Tab.
    const quantityResponse = page.waitForResponse(
      (r) => /\/carts\/.+\/product\/quantity/.test(r.url()) && r.request().method() === 'PUT',
    );
    await quantity.fill('3');
    await quantity.press('Tab');
    expect((await quantityResponse).status()).toBe(200);

    await expect(page.getByRole('cell', { name: '$42.45' })).toHaveCount(2);
    await expect(page.getByTestId('cart-total')).toHaveText('$42.45');
    await expect(page.getByTestId('cart-quantity')).toHaveText('3');

    // 3. Click the remove (x) control on the line item.
    // The remove control is an href-less <a> with no role/name/test id, so click inside the last cell, over the icon button (offset avoids the cell centre which misses it).
    await page.getByRole('row', { name: /Combination Pliers/ }).getByRole('cell').last().click({ position: { x: 25, y: 25 } });

    await expect(page.getByText('The cart is empty. Nothing to display.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Proceed to checkout' })).toHaveCount(0);
    await expect(page.getByTestId('cart-quantity')).toHaveCount(0);
  });
});
