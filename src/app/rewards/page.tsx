"use client";

import { useState, useMemo } from "react";
import { useExpenseContext } from "@/context/ExpenseContext";
import { Coins, Banknote, ArrowLeft, Calendar, AlertTriangle } from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { CoinReward, OverBudgetPenalty } from "@/types";

type HistoryItem =
  | { type: "reward"; data: CoinReward }
  | { type: "penalty"; data: OverBudgetPenalty };

type PresetRange = "1week" | "2weeks" | "3weeks" | "1month" | "2months";
type TimeRange = PresetRange | "custom";

const PRESET_OPTIONS: { value: PresetRange; label: string; days: number }[] = [
  { value: "1week", label: "1 week", days: 7 },
  { value: "2weeks", label: "2 weeks", days: 14 },
  { value: "3weeks", label: "3 weeks", days: 21 },
  { value: "1month", label: "1 month", days: 30 },
  { value: "2months", label: "2 months", days: 60 },
];

const MAX_CUSTOM_DAYS = 30;

function filterRewardsByPreset(
  rewards: CoinReward[],
  preset: PresetRange
): CoinReward[] {
  const days = PRESET_OPTIONS.find((o) => o.value === preset)?.days ?? 7;
  const cutoff = subDays(new Date(), days);
  return rewards
    .filter((r) => new Date(r.createdAt) >= cutoff)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function filterRewardsByCustom(
  rewards: CoinReward[],
  startDate: string,
  endDate: string
): CoinReward[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return rewards
    .filter((r) => {
      const d = new Date(r.createdAt);
      return d >= start && d <= end;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function filterPenaltiesByPreset(
  penalties: OverBudgetPenalty[],
  preset: PresetRange
): OverBudgetPenalty[] {
  const days = PRESET_OPTIONS.find((o) => o.value === preset)?.days ?? 7;
  const cutoff = subDays(new Date(), days);
  return penalties
    .filter((p) => new Date(p.createdAt) >= cutoff)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function filterPenaltiesByCustom(
  penalties: OverBudgetPenalty[],
  startDate: string,
  endDate: string
): OverBudgetPenalty[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return penalties
    .filter((p) => {
      const d = new Date(p.createdAt);
      return d >= start && d <= end;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function mergeHistory(
  rewards: CoinReward[],
  penalties: OverBudgetPenalty[],
  range: TimeRange,
  customStart: string,
  customEnd: string
): HistoryItem[] {
  const filteredRewards =
    range === "custom"
      ? filterRewardsByCustom(rewards, customStart, customEnd)
      : filterRewardsByPreset(rewards, range as PresetRange);
  const filteredPenalties =
    range === "custom"
      ? filterPenaltiesByCustom(penalties, customStart, customEnd)
      : filterPenaltiesByPreset(penalties, range as PresetRange);

  const items: HistoryItem[] = [
    ...filteredRewards.map((r) => ({ type: "reward" as const, data: r })),
    ...filteredPenalties.map((p) => ({ type: "penalty" as const, data: p })),
  ];
  return items.sort((a, b) => {
    const dateA = new Date(a.type === "reward" ? a.data.createdAt : a.data.createdAt).getTime();
    const dateB = new Date(b.type === "reward" ? b.data.createdAt : b.data.createdAt).getTime();
    return dateB - dateA;
  });
}

export default function RewardsPage() {
  const { displayCoins, displayCashback, coinRewards, penalties, isOverBudget, mounted } = useExpenseContext();
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

  const historyItems = useMemo(
    () => mergeHistory(coinRewards, penalties, range, customStart, customEnd),
    [coinRewards, penalties, range, customStart, customEnd]
  );

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 pt-6 pb-8">
      <header className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Rewards</h1>
          <p className="text-slate-400 text-sm">Coins & cashback from staying under budget</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className={`rounded-2xl p-5 border ${
            isOverBudget
              ? "bg-red-500/15 border-red-500/30"
              : "bg-amber-500/15 border-amber-500/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Coins
              className={`w-5 h-5 ${isOverBudget ? "text-red-400" : "text-amber-400"}`}
            />
            <span
              className={`text-sm font-medium ${isOverBudget ? "text-red-400/80" : "text-amber-400/80"}`}
            >
              {isOverBudget ? "Over budget" : "Total Coins"}
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${isOverBudget ? "text-red-400" : "text-amber-400"}`}
          >
            {displayCoins >= 0
              ? displayCoins.toLocaleString()
              : `-${Math.abs(displayCoins).toLocaleString()}`}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isOverBudget ? "Amount over budget" : "1 rupee saved = 1 coin"}
          </p>
        </div>
        <div
          className={`rounded-2xl p-5 border ${
            isOverBudget
              ? "bg-red-500/15 border-red-500/30"
              : "bg-emerald-500/15 border-emerald-500/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Banknote
              className={`w-5 h-5 ${isOverBudget ? "text-red-400" : "text-emerald-400"}`}
            />
            <span
              className={`text-sm font-medium ${isOverBudget ? "text-red-400/80" : "text-emerald-400/80"}`}
            >
              Cashback
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${isOverBudget ? "text-red-400" : "text-emerald-400"}`}
          >
            {formatCurrency(displayCashback)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isOverBudget ? "Over budget" : "Safe for investments"}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Time range
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
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium text-sm transition-colors"
            >
              Apply range
            </button>
          </div>
        )}
      </div>

      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          History
        </h2>
        {historyItems.length === 0 ? (
          <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-10 text-center">
            <Coins className="w-14 h-14 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 font-medium mb-1">No activity in this period</p>
            <p className="text-slate-500 text-sm">
              Stay under budget to earn coins; going over deducts them
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {historyItems.map((item) =>
              item.type === "reward" ? (
                <div
                  key={`r-${item.data.id}`}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        item.data.period === "month"
                          ? "bg-amber-500/20"
                          : "bg-emerald-500/20"
                      }`}
                    >
                      {item.data.period === "month" ? (
                        <Coins className="w-6 h-6 text-amber-400" />
                      ) : (
                        <Banknote className="w-6 h-6 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {item.data.period === "month" ? "Monthly" : "Daily"} reward
                      </p>
                      <p className="text-slate-500 text-sm">
                        {format(new Date(item.data.date), "EEEE, MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-400 text-lg">
                      +{item.data.amount.toLocaleString()} coins
                    </p>
                    <p className="text-emerald-400 font-medium">
                      +{formatCurrency(item.data.amount)}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  key={`p-${item.data.id}`}
                  className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/20">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-400">Over budget</p>
                      <p className="text-slate-500 text-sm">
                        {format(new Date(item.data.monthKey + "-01"), "MMMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-400 text-lg">
                      -{item.data.amount.toLocaleString()} coins
                    </p>
                    <p className="text-red-400/90 font-medium">
                      -{formatCurrency(item.data.amount)}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}
