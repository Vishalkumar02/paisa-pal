# Paisa Pal - Expense Tracker

A mobile-first expense tracking app built with Next.js. Track your spending, set budgets, earn coins when you save, and understand your habits—no boring spreadsheets.

**Paisa Pal** — Your money friend. Track, save, and stay on budget.

*Why this name?* "Paisa" means money in Hindi; "Pal" means friend. Paisa Pal is your friendly companion for managing finances.

📖 **[Full Documentation](DOCUMENTATION.md)** – Detailed guide to features, architecture, data models, and how everything works.

## Features

- **Easy expense entry** – Quick-add with amount, category, date, and optional note. One-tap quick amounts (₹50, ₹100, etc.)
- **Totals** – Day, week, month, and year spending at a glance
- **Categories** – 9 categories (Food, Transport, Shopping, Entertainment, Bills, Health, Education, Personal, Other)
- **Insights** – Pie charts and category breakdown for week/month/year
- **Budgeting** – Set overall monthly budget and optional per-category limits
- **Coin rewards** – Earn 1 coin per rupee saved when you stay under budget (awarded when you open the app for previous day/month)
- **Over-budget analysis** – See when and how much you exceeded budget, with daily spending charts

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (pie & bar charts)
- date-fns
- localStorage for persistence

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and view on your phone or use Chrome DevTools mobile view.

## Data

All data is stored in your browser's localStorage. No backend or account required. Your data stays on your device.
