"use client";

import { useState } from "react";
import { useExpenseContext } from "@/context/ExpenseContext";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, subMonths, addMonths } from "date-fns";
import { getSpendingByDay } from "@/lib/utils";

export default function AnalysisPage() {
  const { getTotals, getCategoryBreakdown, budget, expenses, getCategoryById, mounted } =
    useExpenseContext();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const monthSpent = getTotals("month", selectedMonth);
  const monthlyBudget = budget.monthlyTotal;
  const isOverBudget = monthlyBudget > 0 && monthSpent > monthlyBudget;
  const overBy = isOverBudget ? monthSpent - monthlyBudget : 0;

  const breakdown = getCategoryBreakdown("month", selectedMonth);
  const topCategory = breakdown.sort((a, b) => b.total - a.total)[0];

  const chartData = getSpendingByDay(expenses, selectedMonth);

  return (
    <main className="min-h-screen px-4 pt-6 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analysis</h1>
        <p className="text-slate-400 text-sm">
          Understand your spending habits
        </p>
      </header>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedMonth((d) => subMonths(d, 1))}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-white">
          {format(selectedMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => setSelectedMonth((d) => addMonths(d, 1))}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isOverBudget && (
        <div className="rounded-2xl bg-red-500/20 border border-red-500/40 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">
                Over budget this month
              </h3>
              <p className="text-slate-300 text-sm mb-2">
                You spent {formatCurrency(overBy)} more than your budget of{" "}
                {formatCurrency(monthlyBudget)}.
              </p>
              <p className="text-slate-400 text-sm">
                Total spent: {formatCurrency(monthSpent)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/50 p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          Daily spending
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                formatter={(value: number | undefined) => [value != null ? formatCurrency(value) : "0", "Spent"]}
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
                labelFormatter={(day) => `Day ${day}`}
              />
              <Bar
                dataKey="amount"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {topCategory && (
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700/50 p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">Top category</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {getCategoryById(topCategory.category)?.icon ?? "📦"}
            </span>
            <div>
              <p className="font-medium">
                {getCategoryById(topCategory.category)?.name ?? topCategory.category}
              </p>
              <p className="text-amber-400 font-bold">
                {formatCurrency(topCategory.total)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Summary</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Total spent</span>
            <span className="font-medium">{formatCurrency(monthSpent)}</span>
          </div>
          {monthlyBudget > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-400">Budget</span>
                <span className="font-medium">{formatCurrency(monthlyBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span
                  className={`font-medium ${
                    isOverBudget ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {isOverBudget
                    ? `${formatCurrency(overBy)} over`
                    : `${formatCurrency(monthlyBudget - monthSpent)} under`}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
