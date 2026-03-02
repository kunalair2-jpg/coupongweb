# 👑 Cou-pong Plus Membership System

## Overview
A complete subscription-based membership system integrated into the Cou-pong website. It offers tiered benefits, exclusive deals, and member-only pricing.

## 🚀 Key Features

### 1. Membership Tiers
- **Free**: 5% cashback, standard access.
- **Cou-pong Plus (Paid)**: 
  - **10% Cashback** (2x rewards)
  - **Exclusive Deals** (Locked for free users)
  - **Member Pricing** (Discounted rates)
  - **Premium Support** & Badges

### 2. Plans & Pricing
- **Monthly Saver**: ₹49/month
- **Quarterly**: ₹129/3 months
- **Annual Pro**: ₹299/year (Best Value)

### 3. Implementation Details

#### **Pages**
- **`membership.html`**: Landing page with pricing cards, benefits list, and mock payment modal.
- **`deal.html`**: Updated to support dual pricing (Member vs Regular) and locked content overlays.
- **`my-dashboard.html`**: Enhanced "Membership" section showing active plan, expiry date, and benefits.

#### **Logic**
- **`js/auth.js`**: 
  - `purchaseMembership(plan, price)`: Upgrades user tier, calculates expiry date based on plan duration.
  - `checkMembershipExpiry()`: Auto-downgrades expired users on load.
- **`js/app.js`**: 
  - `renderDeals()`: Checks `membersOnly` flag. Renders locked overlay for non-members.
- **`js/deal-page.js`**: 
  - Enforces access control (redirects non-members).
  - Calculates and displays Member Price (5% extra discount logic) and 10% Cashback.

#### **Data**
- New `membersOnly: true` flag in `PROMOTION_DEALS`.
- User object extended with:
  - `membershipTier`: 'plus' (or legacy 'premium')
  - `membershipPlan`: 'monthly' | 'quarterly' | 'annual'
  - `membershipExpiry`: ISO Date String

---

## 🎨 Design Elements
- **Gold/Orange Theme**: Used for premium branding.
- **Badges**: "PLUS" crown badge in nav and dashboard.
- **Locked Overlay**: Blurred content with lock icon for exclusive deals.
- **Pricing Cards**: Modern, responsive layout with "Popular" choice highlight.

## 🧪 How to Test
See `.agent/workflows/test_membership_system.md` for step-by-step instructions.
