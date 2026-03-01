# Paisa Pal - Complete Documentation

A comprehensive guide to understanding the Paisa Pal expense tracker app—its features, architecture, and how everything works together.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Key Features & How They Work](#3-key-features--how-they-work)
4. [Data Models](#4-data-models)
5. [File Structure](#5-file-structure)
6. [User Flows](#6-user-flows)
7. [Storage & Persistence](#7-storage--persistence)
8. [Technical Details](#8-technical-details)

---

## 1. Project Overview

**Paisa Pal** is a mobile-first expense tracking web app that helps you:

- Log daily expenses quickly
- See spending totals (day, week, month, year)
- Understand where money goes via categories and charts
- Set budgets and earn coins when you save
- Get analysis when you overspend

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Recharts, date-fns, localStorage

**Design Philosophy:** No backend, no accounts. All data stays in your browser. Simple, fast, and private.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App Layout                             │
│  (ExpenseProvider wraps everything, BottomNav fixed at bottom) │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐          ┌──────────┐          ┌──────────┐
   │Dashboard│          │ Insights │          │  Budget  │
   │   (/)   │          │(/insights)│          │(/budget) │
   └─────────┘          └──────────┘          └──────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  ExpenseContext    │
                    │  (shared state)   │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   useExpenses()         useBudget()          useCoins()
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  localStorage     │
                    │  (persistence)    │
                    └──────────────────┘
```

- **ExpenseProvider** – Central context that holds expenses, budget, coins, and helper functions
- **Hooks** – `useExpenses`, `useBudget`, `useCoins` read/write localStorage and sync React state
- **Pages** – Dashboard, Insights, Budget, Analysis consume context and render UI

---

## 3. Key Features & How They Work

### 3.1 Adding Expenses

**Where:** Dashboard → "Add Expense" button → Modal

**Flow:**
1. User taps "Add Expense"
2. Modal opens with:
   - **Amount** – Type or use quick-add buttons (+50, +100, +200, etc.)
   - **Category** – 9 options with icons (Food, Transport, Shopping, etc.)
   - **Date** – Defaults to today, can change
   - **Note** – Optional (e.g., "Coffee", "Groceries")
3. User taps "Add Expense" in the modal
4. Expense is saved to localStorage with a unique ID and `createdAt` timestamp
5. Modal closes and dashboard refreshes

**Implementation:** `AddExpenseModal` → `addExpense()` from context → `addExpenseStorage()` in `storage.ts` → localStorage

---

### 3.2 Totals (Day, Week, Month, Year)

**Where:** Dashboard cards

**How it works:**
- Each total uses a date range:
  - **Day** – Midnight to 11:59 PM of the selected date
  - **Week** – Monday to Sunday (week starts on Monday)
  - **Month** – 1st to last day of the month
  - **Year** – Jan 1 to Dec 31
- `filterByDateRange()` in `utils.ts` filters expenses by range
- `getTotal()` sums the filtered amounts
- Dashboard calls `getTotals("day")`, `getTotals("week")`, etc.

**Example:** If today is March 15, 2025:
- **Today** = all expenses on March 15
- **This Week** = March 10–16
- **This Month** = March 1–31
- **This Year** = Jan 1–Dec 31, 2025

---

### 3.3 Categories & Insights

**Where:** Insights page (`/insights`)

**Categories (9):**

| ID           | Name             | Icon |
|--------------|------------------|------|
| food         | Food & Dining    | 🍔   |
| transport    | Transport        | 🚗   |
| shopping     | Shopping         | 🛒   |
| entertainment| Entertainment    | 🎬   |
| bills        | Bills & Utilities| 📄   |
| health       | Health           | 💊   |
| education    | Education        | 📚   |
| personal     | Personal         | 🧴   |
| other        | Other            | 📦   |

**How it works:**
1. User selects range: Week, Month, or Year
2. `getCategoryBreakdown(range)` filters expenses and groups by category
3. Pie chart shows share per category
4. List below shows each category with amount and % of total
5. Categories are sorted by amount (highest first)

**Implementation:** `getCategoryTotals()` in `utils.ts` → `Map<CategoryId, number>` → converted to array for chart and list

---

### 3.4 Budgeting

**Where:** Budget page (`/budget`)

**Two levels:**

1. **Overall monthly budget**
   - Single number (e.g., ₹15,000)
   - Used for:
     - Progress bar (spent vs budget)
     - Daily budget = `monthlyTotal / 30`
     - Coin rewards when under budget

2. **Per-category budgets (optional)**
   - Limit per category (e.g., Food: ₹5,000)
   - Stored in `budget.categoryBudgets`
   - Shown as optional inputs; future use for category-level rewards

**Flow:**
1. User enters monthly total and optional category amounts
2. Taps "Save"
3. `setBudget()` writes to localStorage
4. Progress bar shows: spent this month vs budget
5. Green = under, red = over

---

### 3.5 Coin Rewards

**Rule:** 1 rupee saved under budget = 1 coin

**When coins are awarded:**
- **Daily** – When you open the app, if yesterday’s spend was under daily budget and you haven’t been awarded for that day yet
- **Monthly** – When you open the app in a new month, if last month’s spend was under monthly budget and you haven’t been awarded for that month yet

**Logic (in `ExpenseContext.tsx`):**
```
On app load (useEffect):
  1. If no monthly budget set → skip
  2. Check YESTERDAY:
     - Have we already awarded for yesterday? → skip
     - Yesterday's total spend vs daily budget (monthly/30)
     - If under → award floor(daily_budget - spent) coins
  3. Check LAST MONTH:
     - Have we already awarded for last month? → skip
     - Last month's total spend vs monthly budget
     - If under → award floor(monthly_budget - spent) coins
```

**Example:**
- Monthly budget: ₹15,000 → daily budget: ₹500
- Yesterday you spent ₹300 → saved ₹200 → 200 coins
- Last month you spent ₹12,000 → saved ₹3,000 → 3,000 coins

**Display:** Coin badge in header on Dashboard and Budget pages

---

### 3.6 Over-Budget Analysis

**Where:** Analysis page (`/analysis`)

**When you exceed budget:**
1. **Alert banner** – Red box: "Over budget this month" with amount over
2. **Daily spending chart** – Bar chart of spend per day in the month
3. **Top category** – Category with highest spend
4. **Summary** – Total spent, budget, and status (over/under)

**Month selector:** Left/right arrows to switch months

**Implementation:**
- `getTotals("month", selectedMonth)` for month total
- `getSpendingByDay()` in `utils.ts` for daily bars
- `getCategoryBreakdown("month")` for top category

---

## 4. Data Models

### Expense

```typescript
{
  id: string;           // UUID
  amount: number;        // e.g. 150.50
  category: CategoryId; // "food" | "transport" | ...
  note?: string;        // optional
  date: string;         // "2025-03-01" (ISO date)
  createdAt: string;    // "2025-03-01T14:30:00.000Z" (ISO timestamp)
}
```

### Budget

```typescript
{
  monthlyTotal: number;                    // e.g. 15000
  categoryBudgets: {                       // optional per-category limits
    food?: number;
    transport?: number;
    // ...
  };
}
```

### CoinReward

```typescript
{
  id: string;
  amount: number;       // coins earned
  reason: "under_budget" | "category_under_budget";
  period: "day" | "month";
  date: string;         // "2025-03-01" for day, "2025-02-01" for month
  createdAt: string;
}
```

### Category

```typescript
{
  id: CategoryId;
  name: string;
  icon: string;   // emoji
  color: string;  // hex for charts
}
```

---

## 5. File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, ExpenseProvider, BottomNav
│   ├── page.tsx            # Dashboard
│   ├── globals.css         # Tailwind + custom CSS variables
│   ├── insights/page.tsx   # Pie chart + category breakdown
│   ├── budget/page.tsx     # Budget settings + progress
│   └── analysis/page.tsx   # Over-budget analysis + charts
├── components/
│   ├── AddExpenseModal.tsx # Expense entry form
│   ├── BottomNav.tsx       # Tab navigation
│   └── CoinBadge.tsx       # Coin count display
├── context/
│   └── ExpenseContext.tsx  # Shared state, getTotals, getCategoryBreakdown, coin logic
├── hooks/
│   ├── useExpenses.ts      # CRUD for expenses
│   ├── useBudget.ts        # Budget get/set
│   └── useCoins.ts        # Total coins + refresh
├── lib/
│   ├── categories.ts       # Category definitions
│   ├── storage.ts         # localStorage read/write
│   └── utils.ts           # filterByDateRange, getTotal, getCategoryTotals, etc.
└── types/
    └── index.ts            # TypeScript interfaces
```

---

## 6. User Flows

### Flow 1: Add first expense

1. Open app → Dashboard
2. Tap "Add Expense"
3. Enter ₹200, select Food, add note "Lunch"
4. Tap "Add Expense"
5. Modal closes, dashboard shows ₹200 today and the expense in Recent

### Flow 2: Set budget and earn coins

1. Go to Budget
2. Enter ₹15,000 as monthly budget, tap Save
3. Add expenses during the month, stay under ₹15,000
4. Next day: open app → coins awarded for yesterday if under daily budget
5. Next month: open app → coins awarded for last month if under monthly budget

### Flow 3: Check where money goes

1. Go to Insights
2. Select "Month"
3. See pie chart and list of categories
4. Identify top spending category

### Flow 4: Overspend and review

1. Spend more than budget in a month
2. Go to Analysis
3. See red alert, amount over, daily chart, and top category

---

## 7. Storage & Persistence

**Backend:** None. All data is in the browser.

**localStorage keys:**

| Key                         | Content                          |
|-----------------------------|----------------------------------|
| `expense-tracker-expenses`   | JSON array of Expense objects    |
| `expense-tracker-budget`    | JSON Budget object               |
| `expense-tracker-coins`     | JSON array of CoinReward objects |

**Behavior:**
- Data survives browser restarts
- Clearing site data removes everything
- No sync across devices or browsers
- No authentication

---

## 8. Technical Details

### Date handling

- **Library:** date-fns
- **Week start:** Monday (`weekStartsOn: 1`)
- **Date format:** `yyyy-MM-dd` for storage, `parseISO` for comparisons

### Currency

- **Symbol:** ₹ (INR)
- **Formatting:** `toLocaleString("en-IN")` for thousands separators

### Charts

- **Library:** Recharts
- **Pie chart:** Donut style, inner radius 60, outer 90
- **Bar chart:** Daily spending by day of month

### Mobile optimizations

- `viewport-fit=cover` for full-screen on phones
- `user-scalable=no` to avoid accidental zoom
- `pb-[env(safe-area-inset-bottom)]` for bottom nav on notched devices
- `-webkit-tap-highlight-color: transparent` for cleaner taps

---

## Quick Reference

| Feature        | Location      | Key function / logic                    |
|----------------|---------------|----------------------------------------|
| Add expense    | Dashboard     | `addExpense()`                          |
| Totals         | Dashboard     | `getTotals(range)`                      |
| Category chart | Insights      | `getCategoryBreakdown(range)`           |
| Set budget     | Budget        | `setBudget()`                           |
| Coin display   | Dashboard, Budget | `totalCoins` from context          |
| Over-budget    | Analysis      | `getTotals("month")` vs `budget.monthlyTotal` |
| Coin awards    | On app load   | `useEffect` in ExpenseContext           |

---

*Last updated: March 2025*
