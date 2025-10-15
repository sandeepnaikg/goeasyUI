# GOzy-UI (Vite + React + TS)

A modular demo of a super-app style UI that bundles Travel, Food, Tickets, Shopping and Wallet modules in a single React app. Built with Vite, TypeScript and TailwindCSS.

## Overview

- Single-page application controlled by a lightweight `AppContext` for navigation/state
- Feature modules under `src/modules/*` (travel, food, tickets, shopping, wallet)
- Shared components like `Header`, `Footer`, `PaymentPage`, `ImageWithFallback`
- LocalStorage used to persist lightweight data such as carts, wallet, orders and rewards

## Tech stack

- React 18 + TypeScript
- Vite 5
- TailwindCSS 3
- lucide-react icons

## Project structure (partial)

```text
src/
  App.tsx                      # Route switch over modules via AppContext
  components/
    PaymentPage.tsx            # Reusable payment with promo codes & summary
    Header.tsx, Footer.tsx, ...
  context/
    AppContext.tsx             # Global navigation & app state
  modules/
    food/                      # Food ordering flow (menu → cart → payment → tracking)
    tickets/                   # Movies flow (home → details → seats → payment → confirmation)
    travel/                    # Travel flows (buses, trains, metro, hotels)
    shopping/                  # Commerce flows (home → details/search → cart → payment)
    wallet/                    # Wallet home, offers and transactions
```

## Features implemented

- Food Cart redesigned
  - Bill Summary moved below Delivery Address and full-width
  - Proceed button uses a soft red/pink gradient
- Tickets Home
  - 3 cards per row on desktop (`lg:grid-cols-3`)
  - Additional movie cards added to fill multiple rows
- Shared PaymentPage
  - Wallet/UPI/Card methods
  - Promo code field with animation (paper ticket pop) on success
  - Price Summary + Rewards calculation
- Travel modules:
  - **Back navigation**: All travel submodules (Trains, Hotels, Metro) now have a Back button for easier navigation.
  - **Trains**: IRCTC-style confirmation with PNR and berth details after booking, shown on confirmation page.
  - **Metro**: DMRC-style grid and navigation; future: add smart card recharge and trip history.
  - **Hotels**: Back button added; booking flow improved.
- Profile:
  - Back button added for navigation
  - "Edit Profile" button stub (future: full profile editing)

## Promo codes you can use

Implemented in `src/components/PaymentPage.tsx`.

Flat discounts

- GOZY50 → ₹50 off
- FIRST100 → ₹100 off
- WALLET100 → ₹100 off when amount ≥ ₹499 and payment method is Wallet

Category/flow-specific

- GOFLY300 → ₹300 off for Travel amounts ≥ ₹2500
- BUS50 → ₹50 off when amount ≥ ₹400 (e.g., bus tickets)

Percentage with caps

- MOVIE20 → 20% off up to ₹150
- STAY20 → 20% off up to ₹500

Bank offer

- HDFC10 → 10% off when amount ≥ ₹2999 and payment method is Card

Notes

- Codes are case-insensitive, stored uppercase in logic.
- Offers can also be preselected from Wallet → Offers; the chosen code is auto-filled on PaymentPage.

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open the LAN/dev server if needed:

```bash
npm run dev:lan
```

Build & preview:

```bash
npm run build
npm run preview
```

Type checking & lint:

```bash
npm run typecheck
npm run lint
```

## How navigation works

The app uses `AppContext` to hold `currentPage`. `App.tsx` renders the appropriate module/component based on that value. Modules navigate by calling `setCurrentPage('target')`.

## Food flow

1. FoodHome → FoodMenu → FoodCart
2. In `FoodCart`, users add/remove items, enter address/instructions.
3. On Proceed, cart details are saved to localStorage and app navigates to `FoodPayment`.
4. `FoodPayment` renders `PaymentPage` with the computed `amount`.
5. Successful payments record wallet debits, transactions and reward points, and navigate to tracking.

Recent cart update

- `Bill Summary` is below `Delivery Address` (same card width)
- Proceed button gradient: `from-rose-400 to-pink-500` with hover shades

## Tickets flow

- `TicketsHome` showcases a carousel and the movie cards grid
- Grid enforcement: one column on mobile, two on small screens, three on large screens (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)

## Customization tips

- Colors/gradients: adjust Tailwind color utilities where needed (buttons/cards)
- Promo logic: extend/modify branches in `PaymentPage.applyPromo()`
- Storage keys: food cart uses `foodCart`, order details `foodOrderDetails`, wallet and rewards under `wallet*` keys

## Roadmap / Next Steps

- **Profile**: Implement full edit (name, email, phone, avatar), address management, and payment card CRUD.
- **Trains**: Add “Check PNR Status”, “Cancel Ticket”, and live running status.
- **Metro**: Add DMRC-style smart card recharge, trip history, and fare calculator.
- **Hotels**: Add hotel details page, reviews, and booking history.
- **General**: Add notifications, dark mode toggle, and a help/FAQ center.
- **Active links**: Ensure all navigation and “back” flows are consistent and context-aware.

---

This README reflects the current codebase (as of 12 Oct 2025). If you add new modules or pages, mirror the patterns used here for quick wiring.

## Troubleshooting

- If UI looks unstyled, ensure Tailwind is properly configured and `index.css` imports Tailwind directives
- LocalStorage collisions: clear site data from browser dev tools if stale data causes odd behavior

---


- Codes are case-insensitive, stored uppercase in logic.
