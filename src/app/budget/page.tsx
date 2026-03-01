"use client";

import { useState, useEffect } from "react";
import { useExpenseContext } from "@/context/ExpenseContext";
import { RewardsBadge } from "@/components/RewardsBadge";
import { formatCurrency, getDynamicDailyBudget } from "@/lib/utils";
import { Wallet, Save, TrendingDown, CheckCircle } from "lucide-react";

export default function BudgetPage() {
  const { budget, setBudget, getTotals, displayCoins, displayCashback, categories, mounted } = useExpenseContext();
  const [monthlyTotal, setMonthlyTotal] = useState(
    budget.monthlyTotal > 0 ? String(budget.monthlyTotal) : ""
  );
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});

  useEffect(() => {
    if (categories.length === 0) return;
    setCategoryBudgets((prev) => {
      const next: Record<string, string> = {};
      for (const c of categories) {
        next[c.id] =
          prev[c.id] ??
          ((budget.categoryBudgets?.[c.id] ?? 0) > 0
            ? String(budget.categoryBudgets[c.id])
            : "");
      }
      return next;
    });
  }, [categories, budget.categoryBudgets]);
  const [saved, setSaved] = useState(false);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const monthSpent = getTotals("month");
  const monthlyBudget = parseFloat(monthlyTotal) || 0;
  const remaining = monthlyBudget - monthSpent;
  const isOverBudget = remaining < 0;
  const { daily: dailyBudget, daysLeft } =
    monthlyBudget > 0
      ? getDynamicDailyBudget(monthlyBudget, monthSpent)
      : { daily: 0, remaining: 0, daysLeft: 0 };

  const handleSave = () => {
    const catBudgets: Record<string, number> = {};
    for (const [id, val] of Object.entries(categoryBudgets)) {
      const n = parseFloat(val);
      if (!isNaN(n) && n > 0) catBudgets[id] = n;
    }
    setBudget({
      monthlyTotal: parseFloat(monthlyTotal) || 0,
      categoryBudgets: catBudgets,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen px-4 pt-6 pb-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Budget</h1>
          <p className="text-slate-400 text-sm">Set limits, earn coins & cashback</p>
        </div>
        <RewardsBadge coins={displayCoins} cashback={displayCashback} />
      </header>

      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/50 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Monthly Budget</h3>
        </div>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-slate-400 text-sm mb-1">
              Total (₹)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={monthlyTotal}
              onChange={(e) => setMonthlyTotal(e.target.value)}
              placeholder="e.g. 15000"
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
              saved
                ? "bg-green-500/20 text-green-400"
                : "bg-amber-500 hover:bg-amber-400 text-slate-900"
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {monthlyBudget > 0 && (
        <>
          <div
            className={`rounded-2xl p-4 mb-4 border ${
              isOverBudget
                ? "bg-red-500/10 border-red-500/30"
                : "bg-slate-800/80 border-slate-700/50"
            }`}
          >
            <p className="text-slate-400 text-sm mb-1">This month</p>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold text-white">
                {formatCurrency(monthSpent)}
              </span>
              <span
                className={`font-bold ${
                  isOverBudget ? "text-red-400" : "text-green-400"
                }`}
              >
                {isOverBudget
                  ? `${formatCurrency(Math.abs(remaining))} over`
                  : `${formatCurrency(remaining)} left`}
              </span>
            </div>
            <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOverBudget ? "bg-red-500" : "bg-amber-500"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (monthSpent / monthlyBudget) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          {!isOverBudget && remaining > 0 && (
            <div className="rounded-2xl p-4 mb-6 bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-400">You&apos;re on track!</span>
              </div>
              <p className="text-slate-300 text-sm mb-2">
                {formatCurrency(remaining)} left for {daysLeft} day{daysLeft !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <p className="text-emerald-400 font-medium">
                  Daily limit: {formatCurrency(Math.round(dailyBudget))} / day
                </p>
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Stay under this to hit your monthly budget
              </p>
            </div>
          )}

          {isOverBudget && (
            <div className="rounded-2xl p-4 mb-6 bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 font-medium">
                You&apos;ve exceeded your budget. Reduce spending to get back on track.
              </p>
            </div>
          )}
        </>
      )}

      <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Category budgets (optional)
        </h3>
        <p className="text-slate-500 text-sm mb-4">
          Set limits per category. Stay under to earn extra coins!
        </p>
        <div className="space-y-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/50"
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="flex-1 font-medium truncate">{c.name}</span>
              <input
                type="number"
                inputMode="numeric"
                value={categoryBudgets[c.id] ?? ""}
                onChange={(e) =>
                  setCategoryBudgets((prev) => ({
                    ...prev,
                    [c.id]: e.target.value,
                  }))
                }
                placeholder="0"
                className="w-24 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-right placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
