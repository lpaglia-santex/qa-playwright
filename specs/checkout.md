# Checkout Flow Test Plan

## Application Overview

Checkout flow of Practice Software Testing - Toolshop (https://practicesoftwaretesting.com). Wizard steps: Cart (1), Sign in (2, tabs "Sign in" / "Continue as Guest"), Billing Address (3), Payment (4). Payment is a two-phase step: pick a "Payment Method", fill fields, click "Check payment"; on success a "Payment was successful" message and a "Confirm" button appear; Confirm places the order ("Thanks for your order! Your invoice number is INV-...."). Demo user customer@practicesoftwaretesting.com / welcome01 (shared public account, may be locked). Each test starts from a fresh browser context (empty cart, logged out) and adds a product first (e.g. the first product on Home, "Combination Pliers"). Seed file: tests/seed.spec.ts (empty "Test group" > "seed" test, using the @playwright/test page fixture).

## Test Scenarios

### 1. Checkout

**Seed:** `tests/seed.spec.ts`

#### 1.1. Cart: add product, update quantity and remove item

**File:** `tests/checkout/cart-quantity-remove.spec.ts`

**Steps:**
  1. From Home click the first product card, then click Add to cart (data-test add-to-cart). Click the cart link in the header.
    - expect: URL is /checkout; Cart step 1 is active; table columns Item, Quantity, Price, Total list the product with quantity 1; header cart badge shows 1
  2. Change 'Quantity for <product>' to 3 and press Tab.
    - expect: Line total and cart Total become 3 x unit price (e.g. $14.15 -> $42.45); badge shows 3; PUT /carts/{id}/product/quantity returns 200
  3. Click the remove (x) control on the line item.
    - expect: Item disappears; cart shows empty state and 'Proceed to checkout' is no longer available or the cart is empty; badge disappears/0

#### 1.2. Happy path: logged-in customer pays by Cash on Delivery and gets order confirmation

**File:** `tests/checkout/customer-cash-on-delivery.spec.ts`

**Steps:**
  1. Add a product, open cart, click 'Proceed to checkout'. On the 'Sign in' tab enter customer@practicesoftwaretesting.com / welcome01, click 'Login'.
    - expect: Header shows 'Jane Doe'; step 2 shows 'Hello Jane Doe, you are already logged in...' style message and a 'Proceed to checkout' button
  2. Click 'Proceed to checkout'. Select Country 'United States of America (the)', Postal code 78701, House number 1, Street 'Main St', City 'Austin', State 'TX' (if the profile address is not prefilled). Click 'Proceed to checkout'.
    - expect: Payment step 4 appears with 'Payment Method' dropdown (Choose your payment method, Bank Transfer, Cash on Delivery, Credit Card, Buy Now Pay Later, Gift Card)
  3. Select 'Cash on Delivery', click 'Check payment', then click 'Confirm'.
    - expect: 'Payment was successful' appears after Check payment
    - expect: Message 'Thanks for your order! Your invoice number is INV-<digits>.' is displayed
    - expect: Cart badge is cleared

#### 1.3. Happy path: guest checkout with Bank Transfer

**File:** `tests/checkout/guest-bank-transfer.spec.ts`

**Steps:**
  1. Add a product, go to cart, click 'Proceed to checkout', open the 'Continue as Guest' tab.
    - expect: Heading 'Continue as Guest' and text 'Checkout without creating an account'; fields Email address *, First name *, Last name *
  2. Enter guest@example.com / Jane / Doe, click 'Continue as Guest'.
    - expect: Message 'Continuing as guest: Jane Doe (guest@example.com)' and a 'Proceed to checkout' button (must be clicked to advance)
  3. Click 'Proceed to checkout', fill billing address, click 'Proceed to checkout'. Select 'Bank Transfer', fill Bank Name 'Test Bank', Account Name 'Jane Doe', Account Number '12345678', click 'Check payment', then 'Confirm'.
    - expect: Order confirmation 'Thanks for your order! Your invoice number is INV-...' appears

#### 1.4. Guest sign-in validation: invalid email and empty fields

**File:** `tests/checkout/guest-validation.spec.ts`

**Steps:**
  1. Add product, proceed to Sign in step, open 'Continue as Guest' tab, enter email 'bad', first name 'Jane', last name 'Doe', click 'Continue as Guest'.
    - expect: Email field marked invalid (is-invalid, #guest-email-error shown); step does not advance
  2. Clear all fields and click 'Continue as Guest'.
    - expect: Required errors for Email address, First name, Last name; user stays on step 2
  3. Switch to 'Sign in' tab and submit empty, then with wrong password.
    - expect: Required-field errors for empty submit; an invalid credentials error for wrong password; user not logged in

#### 1.5. Billing address required-field validation

**File:** `tests/checkout/billing-validation.spec.ts`

**Steps:**
  1. Reach the Billing Address step as guest (see guest test).
    - expect: Heading 'Billing Address'; Country, Postal code, House number, Street, City, State; hint 'Enter country, postal code and house number. We will fill in the rest automatically.'; 'Proceed to checkout' is disabled
  2. Fill only Postal code, then click into and out of House number, Street, City, State.
    - expect: Required validation messages shown on touched empty fields; button remains disabled
  3. Fill all fields with valid data one at a time, leaving State last.
    - expect: Button stays disabled until the last required field is filled, then becomes enabled and advances to Payment

#### 1.6. Credit Card payment: invalid values and successful payment

**File:** `tests/checkout/credit-card.spec.ts`

**Steps:**
  1. Reach the Payment step; select 'Credit Card'.
    - expect: Fields Credit Card Number (format 0000-0000-0000-0000), Expiration Date (MM/YYYY), CVV, Card Holder Name appear
  2. Enter number '1234', expiration '13/2020', CVV '12', leave Card Holder Name empty and blur.
    - expect: 'Invalid date format. Use MM/YYYY.' and 'CVV must be 3 or 4 digits.' shown; number and holder name flagged; 'Check payment' disabled
  3. Enter 1111-1111-1111-1111, 12/2030, 123, 'Jane Doe', click 'Check payment', then 'Confirm'.
    - expect: 'Payment was successful' then 'Thanks for your order! Your invoice number is INV-...'

#### 1.7. Buy Now Pay Later and Gift Card payment methods

**File:** `tests/checkout/bnpl-gift-card.spec.ts`

**Steps:**
  1. At Payment step select 'Buy Now Pay Later'.
    - expect: 'Monthly Installments' dropdown with 'Choose your monthly installments', 3, 6, 9, 12 Monthly Installments; helper text about spreading the cost; 'Check payment' disabled until chosen
  2. Choose '6 Monthly Installments', Check payment, Confirm.
    - expect: Order placed with invoice number
  3. In a new order select 'Gift Card', leave empty, then enter an invalid Validation Code (e.g. 'AB'), then valid Gift Card Number (16 alphanumerics) and 4-character Validation Code.
    - expect: Fields 'Gift Card Number' and 'Validation Code' required/format-validated; button disabled while invalid; enabled and order completes when valid

#### 1.8. Bank Transfer required fields and payment method switching

**File:** `tests/checkout/bank-transfer-validation.spec.ts`

**Steps:**
  1. Select 'Bank Transfer' and leave Bank Name, Account Name, Account Number blank.
    - expect: 'Check payment' is disabled/not actionable; required errors after blur
  2. Enter non-numeric/spaced/hyphenated Account Number ('12 34-ab').
    - expect: Validation error per hint 'Avoid including any spaces or hyphens'; if accepted, record as defect
  3. Switch to 'Cash on Delivery', then 'Credit Card', then back to 'Choose your payment method'.
    - expect: Fields change with method; previous values do not leak into new method; Cash on Delivery shows no extra fields

#### 1.9. Edge: guest cannot skip steps and cart persists across sign-in

**File:** `tests/checkout/step-navigation.spec.ts`

**Steps:**
  1. As guest with item in cart, at step 2 click the 'Billing Address' and 'Payment' step labels.
    - expect: Future steps are not navigable; only completed steps (Cart, Sign in) are clickable
  2. Add product while logged out, then log in via the Sign in tab.
    - expect: Cart still contains product and quantity after login
  3. Go back to Cart step via the 'Cart' label, change quantity, return forward.
    - expect: Updated total is preserved through the steps

#### 1.10. Edge: locked demo account and session expiry during order

**File:** `tests/checkout/login-errors-session.spec.ts`

**Steps:**
  1. At Sign in step, login with customer@practicesoftwaretesting.com and wrong password repeatedly (use a throwaway account instead of the shared demo user where possible).
    - expect: Error message shown; after many failures 'Account locked, too many failed attempts. Please contact the administrator.'
  2. With valid session, idle past token expiry (or clear the token via localStorage) on the Payment step, then click Confirm.
    - expect: POST /invoices returns 401; order is not placed; user sees no success message and is expected to be redirected/asked to login (observed: silent failure, page stays on Payment)
