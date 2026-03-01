"use client";

import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { useExpenseContext } from "@/context/ExpenseContext";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { RewardsBadge } from "@/components/RewardsBadge";
import { formatCurrency, getDynamicDailyBudget } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

export default function DashboardPage() {
  const {
    getTotals,
    displayCoins,
    displayCashback,
    expenses,
    getCategoryById,
    budget,
    mounted,
  } = useExpenseContext();
  const [showAddModal, setShowAddModal] = useState(false);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const dayTotal = getTotals("day");
  const weekTotal = getTotals("week");
  const monthTotal = getTotals("month");
  const yearTotal = getTotals("year");

  const monthlyBudget = budget.monthlyTotal;
  const remaining = monthlyBudget - monthTotal;
  const isUnderBudget = monthlyBudget > 0 && remaining > 0;
  const { daily: dailyBudget, daysLeft } =
    monthlyBudget > 0 && remaining > 0
      ? getDynamicDailyBudget(monthlyBudget, monthTotal)
      : { daily: 0, daysLeft: 0 };

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <main className="min-h-screen px-4 pt-6 pb-8">
      <header className="flex items-center justify-between mb-6 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Paisa Pal</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your money friend</p>
        </div>
        <RewardsBadge coins={displayCoins} cashback={displayCashback} />
      </header>

      <button
        onClick={() => setShowAddModal(true)}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:via-amber-400 hover:to-amber-500 text-slate-900 font-bold text-lg shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-[0.98] mb-6 opacity-0 animate-fade-in animate-fade-in-delay-1"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
        Add Expense
      </button>

      {isUnderBudget && (
        <div className="rounded-2xl p-4 mb-6 bg-emerald-500/10 border border-emerald-500/30 opacity-0 animate-fade-in animate-fade-in-delay-1">
          <p className="text-emerald-400 font-medium">
            You&apos;re on track! {formatCurrency(remaining)} left for {daysLeft} day{daysLeft !== 1 ? "s" : ""}
          </p>
          <p className="text-slate-400 text-sm mt-0.5">
            Daily limit: {formatCurrency(Math.round(dailyBudget))} / day
          </p>
        </div>
      )}

      <section className="mb-6 opacity-0 animate-fade-in animate-fade-in-delay-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Totals
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Today" value={dayTotal} />
          <StatCard label="This Week" value={weekTotal} />
          <StatCard label="This Month" value={monthTotal} />
          <StatCard label="This Year" value={yearTotal} />
        </div>
      </section>

      <section className="opacity-0 animate-fade-in animate-fade-in-delay-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Recent
          </h2>
          {recentExpenses.length > 0 && (
            <Link
              href="/insights"
              className="text-amber-400 text-sm font-medium flex items-center gap-0.5 hover:text-amber-300 transition-colors"
            >
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-3">
              <Plus className="w-7 h-7 text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium mb-1">No expenses yet</p>
            <p className="text-slate-500 text-sm">
              Tap &quot;Add Expense&quot; above to log your first one
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map((e) => {
              const cat = getCategoryById(e.category);
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40 hover:border-slate-600/50 transition-colors"
                >
                  <span className="text-2xl">{cat?.icon ?? "📦"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {e.note || cat?.name || "Expense"}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {format(new Date(e.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <span className="font-bold text-red-400">
                    -{formatCurrency(e.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <AddExpenseModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/40 p-4 hover:border-slate-600/50 transition-colors">
      <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className="text-xl font-bold text-white tracking-tight">{formatCurrency(value)}</p>
    </div>
  );
}
