"use client";

import { useState } from "react";
import { useExpenseContext } from "@/context/ExpenseContext";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { CategoryId } from "@/types";

const RANGE_OPTIONS = [
  { value: "week" as const, label: "Week" },
  { value: "month" as const, label: "Month" },
  { value: "year" as const, label: "Year" },
];

export default function InsightsPage() {
  const { getCategoryBreakdown, getTotals, getCategoryById, mounted } = useExpenseContext();
  const [range, setRange] = useState<"week" | "month" | "year">("month");

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const breakdown = getCategoryBreakdown(range);
  const total = getTotals(range);

  const chartData = breakdown.map(({ category, total: t }) => {
    const cat = getCategoryById(category);
    return {
      name: cat?.name ?? category,
      value: t,
      color: cat?.color ?? "#6B7280",
    };
  });

  return (
    <main className="min-h-screen px-4 pt-6 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Insights</h1>
        <p className="text-slate-400 text-sm">
          Where your money goes
        </p>
      </header>

      <div className="flex gap-2 mb-6">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRange(opt.value)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
              range === opt.value
                ? "bg-amber-500 text-slate-900"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-800/80 border border-slate-700/50 p-4 mb-6">
        <p className="text-slate-400 text-sm mb-2">Total ({range})</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(total)}</p>
      </div>

      {chartData.length === 0 ? (
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-12 text-center">
          <p className="text-slate-400">No data for this period</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-slate-800/80 border border-slate-700/50 p-4 mb-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-4">
              Category breakdown
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            {breakdown
              .sort((a, b) => b.total - a.total)
              .map(({ category, total: t }) => {
                const cat = getCategoryById(category);
                const pct = total > 0 ? ((t / total) * 100).toFixed(1) : "0";
                return (
                  <div
                    key={category}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/50"
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat?.color ?? "#6B7280" }}
                    />
                    <span className="text-2xl">{cat?.icon ?? "📦"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{cat?.name ?? category}</p>
                      <p className="text-slate-500 text-sm">{pct}% of total</p>
                    </div>
                    <span className="font-bold text-white">
                      {formatCurrency(t)}
                    </span>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </main>
  );
}
