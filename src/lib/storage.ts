"use client";

import type { Expense, Budget, CoinReward, Category, OverBudgetPenalty } from "@/types";

const STORAGE_KEYS = {
  expenses: "expense-tracker-expenses",
  budget: "expense-tracker-budget",
  coins: "expense-tracker-coins",
  penalties: "expense-tracker-penalties",
  customCategories: "expense-tracker-custom-categories",
} as const;

export function getExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.expenses);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
}

export function addExpense(expense: Omit<Expense, "id" | "createdAt">): Expense {
  const expenses = getExpenses();
  const newExpense: Expense = {
    ...expense,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses().filter((e) => e.id !== id);
  saveExpenses(expenses);
}

export function getBudget(): Budget {
  if (typeof window === "undefined")
    return { monthlyTotal: 0, categoryBudgets: {} };
  try {
    const data = localStorage.getItem(STORAGE_KEYS.budget);
    return data ? JSON.parse(data) : { monthlyTotal: 0, categoryBudgets: {} };
  } catch {
    return { monthlyTotal: 0, categoryBudgets: {} };
  }
}

export function saveBudget(budget: Budget): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.budget, JSON.stringify(budget));
}

export function getCoins(): CoinReward[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.coins);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addCoinReward(reward: Omit<CoinReward, "id" | "createdAt">): void {
  const coins = getCoins();
  coins.push({
    ...reward,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.coins, JSON.stringify(coins));
}

export function getPenalties(): OverBudgetPenalty[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.penalties);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addPenalty(penalty: Omit<OverBudgetPenalty, "id" | "createdAt">): void {
  const penalties = getPenalties();
  penalties.push({
    ...penalty,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.penalties, JSON.stringify(penalties));
}

export function hasPenalizedForMonth(monthKey: string): boolean {
  return getPenalties().some((p) => p.monthKey === monthKey);
}

export function hasAwardedForPeriod(
  period: "day" | "month",
  dateKey: string
): boolean {
  const coins = getCoins();
  if (period === "day") {
    return coins.some((c) => c.period === "day" && c.date === dateKey);
  }
  return coins.some(
    (c) => c.period === "month" && c.date.startsWith(dateKey)
  );
}

export function getCustomCategories(): Category[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.customCategories);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomCategories(categories: Category[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.customCategories, JSON.stringify(categories));
}

export function addCustomCategory(category: Omit<Category, "id" | "isCustom">): Category {
  const existing = getCustomCategories();
  const newCategory: Category = {
    ...category,
    id: `custom_${crypto.randomUUID().slice(0, 8)}`,
    isCustom: true,
  };
  existing.push(newCategory);
  saveCustomCategories(existing);
  return newCategory;
}

export function updateCustomCategory(id: string, updates: Partial<Omit<Category, "id">>): void {
  const existing = getCustomCategories();
  const idx = existing.findIndex((c) => c.id === id);
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...updates };
    saveCustomCategories(existing);
  }
}

export function deleteCustomCategory(id: string): void {
  const existing = getCustomCategories().filter((c) => c.id !== id);
  saveCustomCategories(existing);
}
