"use client";

import Link from "next/link";
import { Coins, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function RewardsBadge({
  coins,
  cashback,
}: {
  coins: number;
  cashback: number;
}) {
  const isNegative = coins < 0;
  const coinsDisplay =
    coins >= 0 ? coins.toLocaleString() : `-${Math.abs(coins).toLocaleString()}`;

  return (
    <Link
      href="/rewards"
      className={`inline-flex flex-col items-end gap-1 px-3 py-2 rounded-xl border transition-colors active:scale-[0.98] ${
        isNegative
          ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/15"
          : "bg-slate-800/60 border-slate-600/50 hover:border-slate-500/50 hover:bg-slate-700/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <Coins
          className={`w-4 h-4 ${isNegative ? "text-red-400" : "text-amber-400"}`}
        />
        <span
          className={`font-bold ${isNegative ? "text-red-400" : "text-amber-400"}`}
        >
          {coinsDisplay} coins
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Banknote
          className={`w-3.5 h-3.5 ${isNegative ? "text-red-400" : "text-emerald-400"}`}
        />
        <span
          className={`font-bold text-sm ${
            isNegative ? "text-red-400" : "text-emerald-400"
          }`}
        >
          {formatCurrency(cashback)}
        </span>
      </div>
    </Link>
  );
}
