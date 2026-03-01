"use client";

import { useState } from "react";
import { useExpenseContext } from "@/context/ExpenseContext";
import { Download, ArrowLeft, Calendar } from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";
import Link from "next/link";
import {
  filterExpensesByPreset,
  filterExpensesByCustom,
  filterRewardsByRange,
  filterPenaltiesByRange,
  generateExpensesCSV,
  downloadCSV,
} from "@/lib/exportUtils";

type PresetRange = "1week" | "2weeks" | "3weeks" | "1month" | "2months";
type TimeRange = PresetRange | "custom";

const PRESET_OPTIONS: { value: PresetRange; label: string }[] = [
  { value: "1week", label: "1 week" },
  { value: "2weeks", label: "2 weeks" },
  { value: "3weeks", label: "3 weeks" },
  { value: "1month", label: "1 month" },
  { value: "2months", label: "2 months" },
];

const MAX_CUSTOM_DAYS = 30;

export default function ExportPage() {
  const {
    expenses,
    coinRewards,
    penalties,
    getCategoryById,
    mounted,
  } = useExpenseContext();
  const [range, setRange] = useState<TimeRange>("1week");
  const [customStart, setCustomStart] = useState(
    format(subDays(new Date(), 7), "yyyy-MM-dd")
  );
  const [customEnd, setCustomEnd] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customError, setCustomError] = useState<string | null>(null);

  const handleCustomApply = () => {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    const days = differenceInDays(end, start);
    if (start > end) {
      setCustomError("Start date must be before end date");
      return;
    }
    if (days > MAX_CUSTOM_DAYS) {
      setCustomError(`Maximum range is ${MAX_CUSTOM_DAYS} days`);
      return;
    }
    setCustomError(null);
    setRange("custom");
  };

  const handleDownload = () => {
    const filteredExpenses =
      range === "custom"
        ? filterExpensesByCustom(expenses, customStart, customEnd)
        : filterExpensesByPreset(expenses, range as PresetRange);

    const filteredRewards =
      range === "custom"
        ? filterRewardsByRange(coinRewards, "1week", customStart, customEnd)
        : filterRewardsByRange(coinRewards, range as PresetRange);
    const filteredPenalties =
      range === "custom"
        ? filterPenaltiesByRange(penalties, "1week", customStart, customEnd)
        : filterPenaltiesByRange(penalties, range as PresetRange);

    const periodCoins =
      filteredRewards.reduce((s, r) => s + r.amount, 0) -
      filteredPenalties.reduce((s, p) => s + p.amount, 0);
    const periodCashback = periodCoins;

    const rangeLabel =
      range === "custom"
        ? `${customStart} to ${customEnd}`
        : `Last ${PRESET_OPTIONS.find((o) => o.value === range)?.label ?? range}`;

    const getCategoryName = (id: string) =>
      getCategoryById(id)?.name ?? id;

    const csv = generateExpensesCSV(
      filteredExpenses,
      getCategoryName,
      periodCoins,
      periodCashback,
      rangeLabel
    );

    const filename = `paisa-pal-expenses-${format(new Date(), "yyyy-MM-dd")}.csv`;
    downloadCSV(csv, filename);
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const filteredExpenses =
    range === "custom"
      ? filterExpensesByCustom(expenses, customStart, customEnd)
      : filterExpensesByPreset(expenses, range as PresetRange);

  return (
    <main className="min-h-screen px-4 pt-6 pb-8">
      <header className="flex items-center gap-4 mb-6">
        <Link
          href="/more"
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Export</h1>
          <p className="text-slate-400 text-sm">
            Download expenses as CSV
          </p>
        </div>
      </header>

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Date range
        </h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                range === opt.value
                  ? "bg-amber-500 text-slate-900"
                  : "bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => setRange("custom")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              range === "custom"
                ? "bg-amber-500 text-slate-900"
                : "bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Custom
          </button>
        </div>

        {range === "custom" && (
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4 space-y-3">
            <p className="text-xs text-slate-400">
              Select a date range (max 30 days)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            {customError && (
              <p className="text-sm text-red-400">{customError}</p>
            )}
            <button
              onClick={handleCustomApply}
              className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition-colors"
            >
              Apply range
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-4 mb-6">
        <p className="text-slate-400 text-sm mb-2">
          {filteredExpenses.length} expense(s) in selected range
        </p>
        <p className="text-xs text-slate-500">
          CSV includes: Date, Amount, Category, Note, plus coins & cashback summary
        </p>
      </div>

      <button
        onClick={handleDownload}
        disabled={filteredExpenses.length === 0}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold text-lg transition-colors"
      >
        <Download className="w-6 h-6" />
        Download CSV
      </button>

      {filteredExpenses.length === 0 && (
        <p className="text-center text-slate-500 text-sm mt-4">
          No expenses in this period to export
        </p>
      )}
    </main>
  );
}
