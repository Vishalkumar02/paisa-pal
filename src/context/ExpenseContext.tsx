"use client";

import { createContext, useContext, useCallback, useEffect, useMemo } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { useBudget } from "@/hooks/useBudget";
import { useCoins } from "@/hooks/useCoins";
import { useCategories } from "@/hooks/useCategories";
import {
  filterByDateRange,
  getTotal,
  getCategoryTotals,
} from "@/lib/utils";
import {
  addCoinReward,
  hasAwardedForPeriod,
  hasPenalizedForMonth,
  addPenalty,
  getExpenses,
} from "@/lib/storage";
import type { CategoryId, Category } from "@/types";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { startOfMonth, format, subDays, subMonths } from "date-fns";

type ExpenseContextType = {
  expenses: ReturnType<typeof useExpenses>["expenses"];
  addExpense: ReturnType<typeof useExpenses>["addExpense"];
  deleteExpense: ReturnType<typeof useExpenses>["deleteExpense"];
  budget: ReturnType<typeof useBudget>["budget"];
  setBudget: ReturnType<typeof useBudget>["setBudget"];
  totalCoins: number;
  totalCashback: number;
  displayCoins: number;
  displayCashback: number;
  isOverBudget: boolean;
  coinRewards: import("@/types").CoinReward[];
  penalties: import("@/types").OverBudgetPenalty[];
  refreshCoins: () => void;
  getTotals: (range: "day" | "week" | "month" | "year", date?: Date) => number;
  getCategoryBreakdown: (
    range: "day" | "week" | "month" | "year",
    date?: Date
  ) => { category: CategoryId; total: number }[];
  categories: Category[];
  getCategoryById: (id: CategoryId) => Category | undefined;
  addCustomCategory: (cat: Omit<Category, "id" | "isCustom">) => Category;
  updateCustomCategory: (id: string, updates: Partial<Omit<Category, "id">>) => void;
  deleteCustomCategory: (id: string) => void;
  mounted: boolean;
};

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { expenses, addExpense, deleteExpense, mounted: expensesMounted } = useExpenses();
  const { budget, setBudget, mounted: budgetMounted } = useBudget();
  const { totalCoins, totalCashback, rewards: coinRewards, penalties, refresh, mounted: coinsMounted } = useCoins();
  const {
    customCategories,
    addCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
    mounted: categoriesMounted,
  } = useCategories();

  const mounted = expensesMounted && budgetMounted && coinsMounted && categoriesMounted;

  const categories = useMemo(
    () => [...DEFAULT_CATEGORIES, ...customCategories],
    [customCategories]
  );

  const getCategoryById = useCallback(
    (id: CategoryId) => categories.find((c) => c.id === id),
    [categories]
  );

  const getTotals = useCallback(
    (range: "day" | "week" | "month" | "year", date: Date = new Date()) => {
      const filtered = filterByDateRange(expenses, range, date);
      return getTotal(filtered);
    },
    [expenses]
  );

  const getCategoryBreakdown = useCallback(
    (
      range: "day" | "week" | "month" | "year",
      date: Date = new Date()
    ): { category: CategoryId; total: number }[] => {
      const filtered = filterByDateRange(expenses, range, date);
      return getCategoryTotals(filtered);
    },
    [expenses]
  );

  const monthSpent = getTotals("month");
  const isOverBudget =
    budget.monthlyTotal > 0 && monthSpent > budget.monthlyTotal;
  const overBy = isOverBudget
    ? Math.floor(monthSpent - budget.monthlyTotal)
    : 0;
  const displayCoins = isOverBudget ? -overBy : totalCoins;
  const displayCashback = displayCoins;

  useEffect(() => {
    if (!mounted || budget.monthlyTotal <= 0) return;
    const allExpenses = getExpenses();
    const now = new Date();
    const yesterday = subDays(now, 1);
    const dayKey = format(yesterday, "yyyy-MM-dd");
    if (!hasAwardedForPeriod("day", dayKey)) {
      const dayExpenses = filterByDateRange(allExpenses, "day", yesterday);
      const dayTotal = getTotal(dayExpenses);
      const dailyBudget = budget.monthlyTotal / 30;
      if (dayTotal <= dailyBudget) {
        const saved = Math.floor(dailyBudget - dayTotal);
        if (saved > 0) {
          addCoinReward({
            amount: saved,
            reason: "under_budget",
            period: "day",
            date: dayKey,
          });
          refresh();
        }
      }
    }

    const lastMonth = subMonths(now, 1);
    const monthKey = format(startOfMonth(lastMonth), "yyyy-MM");
    if (!hasAwardedForPeriod("month", monthKey)) {
      const monthExpenses = filterByDateRange(allExpenses, "month", lastMonth);
      const monthTotal = getTotal(monthExpenses);
      if (monthTotal <= budget.monthlyTotal) {
        const saved = Math.floor(budget.monthlyTotal - monthTotal);
        if (saved > 0) {
          addCoinReward({
            amount: saved,
            reason: "under_budget",
            period: "month",
            date: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
          });
          refresh();
        }
      }
    }

    const currentMonthKey = format(startOfMonth(now), "yyyy-MM");
    const currentMonthExpenses = filterByDateRange(allExpenses, "month", now);
    const currentMonthTotal = getTotal(currentMonthExpenses);
    if (
      budget.monthlyTotal > 0 &&
      currentMonthTotal > budget.monthlyTotal &&
      !hasPenalizedForMonth(currentMonthKey)
    ) {
      const overBy = Math.floor(currentMonthTotal - budget.monthlyTotal);
      if (overBy > 0) {
        addPenalty({
          amount: overBy,
          monthKey: currentMonthKey,
        });
        refresh();
      }
    }
  }, [mounted, budget.monthlyTotal, refresh, expenses.length]);

  const addExpenseWithRefresh = useCallback(
    (expense: Parameters<typeof addExpense>[0]) => {
      const result = addExpense(expense);
      refresh();
      return result;
    },
    [addExpense, refresh]
  );

  const setBudgetWithRefresh = useCallback(
    (newBudget: Parameters<typeof setBudget>[0]) => {
      setBudget(newBudget);
      refresh();
    },
    [setBudget, refresh]
  );

  const deleteExpenseWithRefresh = useCallback(
    (id: string) => {
      deleteExpense(id);
      refresh();
    },
    [deleteExpense, refresh]
  );

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense: addExpenseWithRefresh,
        deleteExpense: deleteExpenseWithRefresh,
        budget,
        setBudget: setBudgetWithRefresh,
        totalCoins,
        totalCashback,
        displayCoins,
        displayCashback,
        isOverBudget,
        coinRewards,
        penalties,
        refreshCoins: refresh,
        getTotals,
        getCategoryBreakdown,
        categories,
        getCategoryById,
        addCustomCategory,
        updateCustomCategory,
        deleteCustomCategory,
        mounted,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenseContext() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenseContext must be used within ExpenseProvider");
  return ctx;
}
