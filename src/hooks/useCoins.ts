"use client";

import { useState, useEffect, useCallback } from "react";
import { getCoins, getPenalties } from "@/lib/storage";
import type { CoinReward, OverBudgetPenalty } from "@/types";

export function useCoins() {
  const [rewards, setRewards] = useState<CoinReward[]>([]);
  const [penalties, setPenalties] = useState<OverBudgetPenalty[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRewards(getCoins());
    setPenalties(getPenalties());
    setMounted(true);
  }, []);

  const refresh = useCallback(() => {
    setRewards(getCoins());
    setPenalties(getPenalties());
  }, []);

  const rewardsTotal = rewards.reduce((sum, r) => sum + r.amount, 0);
  const penaltiesTotal = penalties.reduce((sum, p) => sum + p.amount, 0);
  const totalCoins = Math.max(0, rewardsTotal - penaltiesTotal);
  const totalCashback = totalCoins; // 1 coin = ₹1 saved

  return { totalCoins, totalCashback, rewards, penalties, refresh, mounted };
}
