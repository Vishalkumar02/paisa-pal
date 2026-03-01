"use client";

import { Coins } from "lucide-react";

export function CoinBadge({ coins }: { coins: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30">
      <Coins className="w-4 h-4 text-amber-400" />
      <span className="font-bold text-amber-400">{coins.toLocaleString()}</span>
      <span className="text-amber-400/70 text-xs">coins</span>
    </div>
  );
}
