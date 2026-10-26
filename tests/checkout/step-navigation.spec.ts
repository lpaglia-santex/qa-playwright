// spec: specs/checkout.md
// seed: tests/seed.spec.ts

import { test, expect } from "@playwright/test";

test.use({ testIdAttribute: "data-test" });

test.describe("Checkout", () => {
  test("Edge: guest cannot skip steps and cart persists across sign-in", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Combination Pliers/ }).click();
    await page.getByTestId("add-to-cart").click();
    await page.getByTestId("nav-cart").click();
    await page.getByRole("button", { name: "Proceed to checkout" }).click();

    // 1. As guest with item in cart, at step 2 click the 'Billing Address' and 'Payment' step labels.
    await page.getByRole("tab", { name: "Continue as Guest" }).click();
    const signInPanel = page.getByRole("tabpanel");
    await expect(
      signInPanel.getByRole("heading", { name: "Continue as Guest" }),
    ).toBeVisible();

    await page.getByText("Billing Address", { exact: true }).click();
    await expect(
      signInPanel.getByRole("heading", { name: "Continue as Guest" }),
    ).toBeVisible();
    await expect(page.getByLabel("Postal code")).toHaveCount(0);

    await page.getByText("Payment", { exact: true }).click();
    await expect(
      signInPanel.getByRole("heading", { name: "Continue as Guest" }),
    ).toBeVisible();
    await expect(page.getByLabel("Payment Method")).toHaveCount(0);

    // 2. Add product while logged out, then log in via the Sign in tab.
    await page.getByRole("tab", { name: "Sign in" }).click();
    await signInPanel
      .getByRole("textbox", { name: "Email address" })
      .fill("customer@practicesoftwaretesting.com");
    await signInPanel
      .getByRole("textbox", { name: "Password" })
      .fill("welcome01");
    await signInPanel.getByRole("button", { name: "Login" }).click();

    await expect(
      page.getByText("Hello Jane Doe, you are already logged in."),
    ).toBeVisible();
    await expect(page.getByTestId("cart-quantity")).toHaveText("1");

    // 3. Go back to Cart step via the 'Cart' label, change quantity, return forward.
    await page.getByText("Cart", { exact: true }).click();
    const quantity = page.getByRole("spinbutton", {
      name: "Quantity for Combination Pliers",
    });
    await expect(quantity).toHaveValue("1");

    const quantityResponse = page.waitForResponse(
      (r) =>
        /\/carts\/.+\/product\/quantity/.test(r.url()) &&
        r.request().method() === "PUT",
    );
    await quantity.fill("3");
    await quantity.press("Tab");
    expect((await quantityResponse).status()).toBe(200);
    await expect(page.getByTestId("cart-total")).toHaveText("$42.45");

    await page.getByRole("button", { name: "Proceed to checkout" }).click();
    await expect(
      page.getByText("Hello Jane Doe, you are already logged in."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Proceed to checkout" }).click();
    await expect(
      page.getByRole("heading", { name: "Billing Address" }),
    ).toBeVisible();

    await page.getByText("Cart", { exact: true }).click();
    await expect(quantity).toHaveValue("3");
    await expect(page.getByTestId("cart-total")).toHaveText("$42.45");
    await expect(page.getByTestId("cart-quantity")).toHaveText("3");
  });
});
