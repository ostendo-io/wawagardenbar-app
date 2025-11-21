# Tabs & Orders System Specification

## 1. Document Overview
- **Version:** 1.0  
- **Date:** November 19, 2025  
- **Status:** Design Spec (Implementation Required)

This document defines the requirements, data model, and implementation details for supporting **open tabs** for dine‑in orders, for both **customers** and **staff**, while reusing and extending the existing orders, checkout, and rewards implementation.

This spec is complementary to:
- `docs/requirements.md`
- `docs/rewards-system-spec.md`

---

## 2. Goals & Non‑Goals

### 2.1 Goals
- **G1:** Allow customers (dine‑in) to **open a tab**, add multiple orders over time, and pay once when they decide to close the tab.
- **G2:** Allow staff to **open and manage tabs** (per table or customer), attach multiple orders to a tab, and close + checkout the entire tab.
- **G3:** Ensure all orders attached to a tab still behave like normal orders in the **kitchen display and dashboard orders queue**.
- **G4:** Integrate **rewards** with tabs so that discounts/points behave correctly when paying for a tab.
- **G5:** Reuse existing **order + payment + rewards** logic as much as possible and **remove redundant code** instead of duplicating flows.

### 2.2 Non‑Goals
- Changes to Monnify provider integration itself.
- Major redesign of rewards rules; re‑use rules described in `rewards-system-spec.md`.

---

## 3. Current Implementation Summary (Baseline)

### 3.1 Checkout & Orders
Relevant pieces (already implemented):
- `components/features/checkout/checkout-form.tsx`
  - Multi‑step React Hook Form (customer info → order details → payment).
  - Supports `orderType: 'dine-in' | 'pickup' | 'delivery'`.
  - For `dine-in`, collects `tableNumber` and then always **creates an order and immediately initializes payment**.
- `app/actions/payment/payment-actions.ts`
  - `createOrder(input)`
    - Persists an `Order` document with:
      - Items, customer/guest info, fees, totals via `SettingsService.calculateOrderTotals`.
      - `orderType`‑specific fields: `deliveryDetails`, `pickupDetails`, `dineInDetails.tableNumber`.
      - `status: 'pending'`, `paymentStatus: 'pending'`.
    - No notion of **tabs**.
  - `initializePayment(input)`
    - Initializes Monnify payment for a **single order** using `order.total`.
    - Redirects to `NEXT_PUBLIC_APP_URL/orders/:orderId?payment=success`.
- `services/order-service.ts` (not detailed here) and `interfaces/order.interface.ts` define order fields used across dashboard and customer views.

### 3.2 Rewards
- `app/actions/rewards/rewards-actions.ts`
  - `validateRewardCodeAction(code)` – validates a reward for the logged‑in user.
  - `redeemRewardAction(rewardId, orderId)` – redeems a reward **per order** and revalidates `/checkout` & `/profile/rewards`.
- `docs/rewards-system-spec.md` describes the intended behaviour:
  - Rewards are issued based on spend thresholds.
  - Rewards are applied **per order** at checkout.
  - Points and redemption are tracked against orders.

### 3.3 Gaps vs Tabs Requirements
- **No persistent tab abstraction.** All flows assume a single order → single payment.
- **No way to defer payment for dine‑in**; dine‑in always goes directly to payment.
- **No grouping of multiple orders** under a single bill.
- Rewards are **order‑level**, not tab‑level.

---

## 4. Functional Requirements – Tabs

### 4.1 Tab Concept
- A **Tab** represents an open bill associated with:
  - One or more **orders** (dine‑in only at first).
  - A **table** and optionally a **customer** (logged‑in user) or staff‑only pseudo‑owner.
  - A **lifecycle**: `open → settling → paid → closed` (simplified to `open | settling | closed` in data model; `closed` implies `paid`).

### 4.2 Customer Dine‑In Flow

When a customer chooses **`orderType = 'dine-in'`** in checkout:

1. **No existing open tab** for this customer + table:
   - Customer can **open a new tab & add an order** to it.
   - Or **complete this order and pay immediately** without opening a tab.

2. **Existing open tab** for this customer (and/or table):
   - Customer can **add a new order to the existing tab**.
   - Or **ignore tab** and **pay this order immediately** (behaves like current flow).

3. **Placing an order on a tab**:
   - Order is created as usual with `orderType = 'dine-in'` and `dineInDetails.tableNumber`.
   - The order is **linked to a Tab**.
   - The order’s `paymentStatus` remains `pending` (not paid yet), but the **tab is open**.
   - No payment initialization is triggered on order creation when the order is assigned to a tab.

4. **Viewing and closing tabs (customer UI)**:
   - From `customer > orders/tabs` page, customers see:
     - **All tabs** (open, closed, paid - regardless of status) with summary details
     - **Standalone orders** (orders that are NOT part of any tab)
   - Orders that are part of a tab are ONLY visible through the tab details view
   - For an open tab, customer can:
     - **View tab details** → see all orders within the tab
     - **Add another order** (navigates back to menu with context to keep using the same tab), or
     - **Close & pay tab** → single checkout and Monnify payment for the **tab total**
   - For a closed/paid tab, customer can:
     - **View tab details** → see all orders and payment history

### 4.3 Staff Tab Flow

From **Dashboard** (e.g. `/dashboard/orders`):

1. **Open tab for a table**:
   - Staff can open a new tab for a table (with optional customer info).
   - They can then **create orders on behalf of the customer** and attach them to this tab.

2. **Add orders to existing tab**:
   - Staff selects an **open tab** from a dedicated **Tabs view** (similar to kitchen display card view).
   - Staff creates new orders (existing order creation flow), ensuring they are linked to the **selected tab**.

3. **Process orders**:
   - Each order still appears in the **Orders queue** and **Kitchen display** like existing orders.
   - Order status changes (pending → preparing → ready → completed) are **per order**, independent of payment.

4. **Close & pay tab (staff)**:
   - Staff opens a tab from the Tabs view, sees **all unpaid orders + totals**.
   - Staff triggers **Checkout Tab**.
   - Payment is processed once (Monnify) for the tab total.
   - On success:
     - Tab is marked `closed` / `paid`.
     - All associated orders have `paymentStatus: 'paid'` and updated `status` as appropriate (e.g. `confirmed` if not already in a terminal state).

### 4.4 Tabs Dashboard View

Add a **Tabs** UI entry near/inside `Dashboard > Orders`:
- Shows **all open tabs** in a list or cards:
  - Table number.
  - Associated customer (if available).
  - Number of orders & summary (e.g. `3 orders, 7 items`).
  - Current tab subtotal, fees, tax, and total.
  - Open duration.
- Clicking a tab opens **Tab Details**:
  - List of all associated orders, with status and individual amounts.
  - Actions:
    - **Add order** (route into order creation with this tab bound).
    - **Close & pay tab**.
    - (Optional) **Cancel tab** – only allowed if business rules permit; orders may need cancellation rules.

### 4.5 Tips / Gratuity

- Customers must be able to **add a tip / gratuity** as part of checkout.
- Tipping must work for **both**:
  - **Single‑order checkout** (no tab).
  - **Tab checkout** (when closing a tab).
- Tips **do not affect** reward eligibility thresholds; rewards are based on **pre‑tip totals** (order or tab subtotal + configured fees/tax as defined in the rewards spec).
- Tips are **added on top of** the calculated total and included in the **final amount charged** via Monnify.
- Tipping options (configurable later, but spec for v1):
  - Free‑form amount input (₦) and/or preset percentage buttons (e.g. 5%, 10%, 15%).
  - Only one tip per checkout (per order payment or per tab payment).

---

## 5. Rewards & Tabs

### 5.1 Requirements
- Rewards must be **compatible** with tabs.
- When a **tab is used**, rewards are **calculated and redeemed based on the total amount of the tab**, not on the individual orders that make up the tab.
- When **no tab is opened** (single‑order checkout), the existing rewards behaviour from `rewards-system-spec.md` remains **exactly as is** (rewards applied per order at checkout).
- Rewards **application point** for tabs is explicit and fixed:
  - **Tab flow:** Rewards apply **only when closing a tab** (tab‑level rewards on the aggregated tab total).
  - **Non‑tab flow:** Rewards continue to apply **per individual order** during normal single‑order checkout.

### 5.2 Behaviour When Closing a Tab

1. Calculate **tab subtotal** as the sum of all **unpaid orders’ subtotals** that belong to the tab.
2. Run the existing **reward eligibility + auto‑apply logic** against this **tab subtotal** (see `rewards-system-spec.md` §3.2+):
   - Threshold detection vs tab subtotal.
   - Rules filtered by user eligibility & max redemptions.
   - Random probability checks as specified.
3. For tab checkout:
   - **Create one or more rewards** and link them to the **tab** and/or a synthetic **tab‑checkout order record** (see 6.3) if needed.
   - Adjust tab totals (service fee, tax, etc.) using existing `SettingsService.calculateOrderTotals`, extended to accept rewards/discounts at **tab level**.
4. Persist rewards and update their status as **redeemed** when tab payment succeeds. These redemptions are associated with the tab (and underlying user) rather than individual child orders.

### 5.3 Points & Tabs

- When a tab is used, points **earning** should be based on the **paid amount for the tab** (after discounts) to keep behaviour consistent with "rewards on tab total".
- When no tab is used, points continue to be earned based on the **single order total**, as described in `rewards-system-spec.md`.
- Points **spending** (redeeming menu items for points) can still be treated per order; the resulting discounts naturally roll up into the tab total when those orders are part of a tab.
- The rewards implementation must:
  - Track `orderId` and optionally `tabId` when rewards are generated or redeemed.
  - Ensure max redemptions are still enforced **per user**, independent of whether the purchase is via a single order or a tab.

---

## 6. Data Model Changes

### 6.1 New: Tab Model

Create a new `Tab` Mongoose model and matching `ITab` interface, e.g. in `/models/tab.model.ts` and `/interfaces/tab.interface.ts`.

**Core fields (suggested):**
- `_id: ObjectId`
- `tabNumber: string` (human‑friendly identifier; can be derived from table number + sequence)
- `tableNumber: string`
- `userId?: ObjectId` (customer owner, optional)
- `openedByStaffId?: ObjectId`
- `status: 'open' | 'settling' | 'closed'`
- `orders: ObjectId[]` (refs to `Order`)
- `subtotal: number` (cached aggregate of open orders)
- `serviceFee: number`
- `tax: number`
- `deliveryFee: number` (usually `0` for dine‑in)
- `discountTotal: number` (sum of rewards applied at tab level)
- `tipAmount: number` (tip/gratuity for the tab; default 0)
- `total: number` (final total to pay, including `tipAmount`)
- `paymentStatus: 'pending' | 'paid' | 'failed'`
- `paymentReference?: string`
- `transactionReference?: string`
- `openedAt: Date`
- `closedAt?: Date`

### 6.2 Order Model Updates

Extend the `Order` model / `IOrder` interface to support tab links and decoupled payment:
- `tabId?: ObjectId` (ref `Tab`)
- Allow `order.paymentStatus` to remain `pending` even if items are prepared/completed until **tab is paid**.
- Consider additional status rules:
  - `status` remains operational (kitchen) state.
  - `paymentStatus` is purely financial state and may be controlled by `Tab` checkout.

Optionally (recommended for reporting), individual orders can also track their own tip amount when paid directly (no tab):
- `tipAmount?: number` (tip added when paying this single order; default 0).

### 6.3 Rewards Model Updates (Minimal)

Ensure reward model and service can optionally reference a tab:
- Add `tabId?: ObjectId` where rewards are applied at tab checkout rather than per single order.
- When redeeming, update both:
  - `redeemedInOrderId?: ObjectId` (if using a dedicated tab‑checkout order), and
  - `tabId?: ObjectId`.

No breaking changes should be introduced to existing order‑level reward logic.

---

## 7. API / Server Actions

### 7.1 New Server Actions / Services (Tabs)

Create a `TabService` in `/services/tab-service.ts` and matching server actions in `/app/actions/tabs/tab-actions.ts` (or similar), following the existing patterns.

**Core operations:**
- `createTab({ tableNumber, userId?, openedByStaffId? })`
- `getOpenTabForUser({ userId }): ITab | null`
- `getOpenTabForTable({ tableNumber }): ITab | null`
- `addOrderToTab({ tabId, orderId })`
- `listOpenTabs({ filters? })`
- `getTabDetails({ tabId })`
- `prepareTabForCheckout({ tabId })` → calculates totals & eligible rewards
- `markTabPaid({ tabId, paymentReference, transactionReference })`

### 7.2 Changes to Order Creation / Payment Actions

**`createOrder` (in `payment-actions.ts`):**
- Accept **optional `tabId`**.
- If `tabId` is provided:
  - Do **not** call `initializePayment` or assume immediate payment.
  - Set `order.paymentStatus = 'pending'` and link `order.tabId`.
  - After saving order, call `TabService.addOrderToTab` and recalc tab subtotal.
- If `tabId` is not provided:
  - Behaviour remains as today (single order, immediate payment).

> Note: The UI will now decide whether to pass `tabId` based on customer/staff choices.

**New `initializeTabPayment` action:**
- Similar to `initializePayment`, but works on `Tab`:
  - Fetch tab, ensure status `open` or `settling` and total > 0.
  - Generate payment reference via existing `PaymentService`.
  - Accept a **tip amount** as part of the input, update `tab.tipAmount`, and recompute `tab.total` before payment initialization.
  - Initialize Monnify with `amount = tab.total` (including tip).
  - Save `paymentReference` + `transactionReference` on tab.
  - Return `checkoutUrl`.

**Payment verification for tabs:**
- Extend `verifyPayment` to handle both **order** and **tab** references:
  - First lookup by `Order.paymentReference` as today.
  - If not found, lookup by `Tab.paymentReference`.
  - If tab payment is confirmed:
    - Mark `tab.paymentStatus = 'paid'`, `status = 'closed'`, set `closedAt`.
    - For each `order` in `tab.orders`:
      - `paymentStatus = 'paid'`.
      - Optionally update `status` to `confirmed` if still `pending`.

### 7.3 Checkout Form Changes (Client)

Update `CheckoutForm` to support tabs while minimizing branching:

1. Detect context:
   - `orderType === 'dine-in'`.
   - Logged‑in user may already have `openTab` (fetched via server component or client API call).

2. Add **choice step** or options on the Payment step for dine‑in:
   - **Pay Now (no tab)** – existing behaviour.
   - **Add to Tab**:
     - If there is an `openTab`, show “Add to existing tab (#TAB_ID / table X)”.
     - Otherwise show “Open new tab for table X & add this order”.

3. `onSubmit` logic:
   - If user chooses **Pay Now**:
     - Collect an optional **tip amount** from the customer on the final step (e.g. preset buttons + custom amount field).
     - Call existing `createOrder` (without `tabId`) and then `initializePayment`, passing the final total that includes the selected **tip amount** (and persisting `tipAmount` on the order if the model supports it).
   - If user chooses **Add to Tab**:
     - If no tab exists, call server action to create tab for this user + table.
     - Call `createOrder` **with** `tabId` and **skip** `initializePayment`.
     - Redirect to a **Tab summary / customer orders** page instead of Monnify.

4. Validation remains mostly unchanged, except that **payment method can be optional** when adding to tab (since no payment occurs yet). This can be handled as:
   - Keep schema but only require `paymentMethod` when `checkoutMode === 'pay-now'`.

---

## 8. UI / UX Changes

### 8.1 Customer – Orders / Tabs Page

Update the **Customer Orders** page to optionally show tabs:

- Display either:
  - Existing list of orders as today; or
  - A new **Tabs view**:
    - Each tab card shows:
      - `tableNumber`
      - Status (`open` / `closed`)
      - Total, subtotal, discount, etc.
      - Number of orders.
    - Expand/click to view **orders within the tab** (order status, totals).
    - Actions (for open tabs):
      - **Add Order to Tab** → navigate to menu with tab context.
      - **Pay & Close Tab** → triggers `initializeTabPayment`, with a UI step that allows the customer to select or enter a **tip / gratuity** amount that will be added to the tab’s total.

Implementation detail: This can be a **toggle** between "Orders" and "Tabs" on the page, or tabs can be the default when tabs exist.

### 8.2 Dashboard – Orders Tabs Button

In `Dashboard > Orders`:
- Add a **Tabs** button (similar to the kitchen display toggle) that opens `Dashboard > Orders > Tabs` view.
- `Tabs` view:
  - Lists all **open tabs** with filters (table, staff, age).
  - Clicking a tab opens tab detail (see 4.4).

### 8.3 Access Control

- In line with existing dashboard permissions (see main requirements):
  - **Admin & Super‑Admin**: Can manage Tabs via Dashboard.
  - **Customers**: Access only their **own tabs** via customer area; no dashboard access.

---

## 9. Refactoring & Redundant Code Removal

As part of implementing tabs, remove or refactor code that would otherwise duplicate order/payment logic.

### 9.1 Shared Calculation Logic
- **Current:** `SettingsService.calculateOrderTotals` operates on a single subtotal and order type.
- **Change:** Ensure it can be reused for both:
  - Individual orders.
  - Tab totals (aggregated subtotal, likely `orderType: 'dine-in'`).
- Avoid separate duplicate total‑calculation functions for tabs.

### 9.2 Rewards Handling
- Move any reward threshold / eligibility / application logic that is currently embedded in checkout‑specific areas into **RewardsService** so it can be reused from:
  - Single‑order checkout.
  - Tab checkout.
- Eliminate any duplicate reward application calculations.

### 9.3 Payment Initialization
- Extract shared logic for mapping between internal entities and Monnify into `PaymentService` helpers so that:
  - `initializePayment` (order).
  - `initializeTabPayment` (tab).
  share all common logic and only differ in:
  - Amount, description text, redirect URL, and metadata (`orderId` vs `tabId`).

---

## 10. Implementation Phases

### Phase 1 – Data Model & Services
- Add `Tab` model and interfaces.
- Extend `Order` and `Reward` models as needed.
- Implement `TabService` core operations.

### Phase 2 – Backend Flow Integration
- Extend `createOrder` to support optional `tabId`.
- Implement `initializeTabPayment` and extend `verifyPayment` to handle tabs.
- Implement rewards tab checkout integration (reuse `RewardsService`).

### Phase 3 – Customer UI
- Update `CheckoutForm` with tab options for `dine-in`.
- Implement customer **Tabs** view and details page.

### Phase 4 – Dashboard UI
- Add **Tabs** entry and tabs list/detail views under `Dashboard > Orders`.
- Wire staff flows for open/add orders/close tab.

### Phase 5 – Refactoring & Cleanup
- Deduplicate total calculation and payment wiring.
- Remove or refactor any redundant order/reward/checkout logic.

---

## 11. Open Questions

1. **Tab ownership rules:**
   - Should a customer be limited to **one open tab** at a time?
   - How do we handle multiple tabs for the same user but different tables?
2. **Staff‑only tabs:**
   - Do we support tabs without a logged‑in customer (anonymous table tabs)?
   - If yes, how do we expose them to customers later (if they log in)?
3. **Rewards visibility on tabs:**
   - Should customers see **potential rewards** before closing a tab, or only applied rewards after payment?
4. **Tab cancellation policy:**
   - Can a tab be cancelled after some orders were fulfilled? What happens to those orders and rewards?
5. **Mixed payment:**
   - Do we need to support splitting payment for a tab (multiple Monnify transactions or cash + Monnify)?

This spec should be used as the primary reference when implementing the tabs feature and adjusting the existing orders, checkout, and rewards flows.
