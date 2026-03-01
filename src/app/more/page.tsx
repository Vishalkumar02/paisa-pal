"use client";

import Link from "next/link";
import { useExpenseContext } from "@/context/ExpenseContext";
import { Tag, Coins, TrendingUp, ChevronRight, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MorePage() {
  const { displayCoins, displayCashback, mounted } = useExpenseContext();

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const menuItems = [
    {
      href: "/rewards",
      icon: Coins,
      label: "Rewards",
      subtitle: `${displayCoins >= 0 ? displayCoins.toLocaleString() : `-${Math.abs(displayCoins).toLocaleString()}`} coins · ${formatCurrency(displayCashback)} cashback`,
    },
    {
      href: "/categories",
      icon: Tag,
      label: "Categories",
      subtitle: "Manage expense categories",
    },
    {
      href: "/analysis",
      icon: TrendingUp,
      label: "Analysis",
      subtitle: "Spending habits & over-budget",
    },
    {
      href: "/export",
      icon: Download,
      label: "Export",
      subtitle: "Download expenses as CSV",
    },
  ];

  return (
    <main className="min-h-screen px-4 pt-6 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">More</h1>
        <p className="text-slate-400 text-sm">Categories, rewards & analysis</p>
      </header>

      <div className="space-y-2">
        {menuItems.map(({ href, icon: Icon, label, subtitle }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 hover:border-slate-600/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
              <Icon className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">{label}</p>
              <p className="text-slate-500 text-sm truncate">{subtitle}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </main>
  );
}
