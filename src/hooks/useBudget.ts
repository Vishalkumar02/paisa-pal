"use client";

import { useState, useEffect, useCallback } from "react";
import type { Budget } from "@/types";
import { getBudget, saveBudget } from "@/lib/storage";

export function useBudget() {
  const [budget, setBudgetState] = useState<Budget>({
    monthlyTotal: 0,
    categoryBudgets: {},
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setBudgetState(getBudget());
    setMounted(true);
  }, []);

  const setBudget = useCallback((newBudget: Budget) => {
    saveBudget(newBudget);
    setBudgetState(getBudget());
  }, []);

  return { budget, setBudget, mounted };
}
