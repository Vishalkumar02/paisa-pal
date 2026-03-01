"use client";

import { useState, useEffect, useCallback } from "react";
import type { Expense } from "@/types";
import {
  getExpenses,
  saveExpenses,
  addExpense as addExpenseStorage,
  deleteExpense as deleteExpenseStorage,
} from "@/lib/storage";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setExpenses(getExpenses());
    setMounted(true);
  }, []);

  const addExpense = useCallback(
    (expense: Omit<Expense, "id" | "createdAt">) => {
      const newExpense = addExpenseStorage(expense);
      setExpenses(getExpenses());
      return newExpense;
    },
    []
  );

  const deleteExpense = useCallback((id: string) => {
    deleteExpenseStorage(id);
    setExpenses(getExpenses());
  }, []);

  return { expenses, addExpense, deleteExpense, mounted };
}
