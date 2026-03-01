import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO,
  format,
  subDays,
  differenceInDays,
} from "date-fns";
import type { Expense } from "@/types";
import type { CategoryId } from "@/types";

export function filterByDateRange(
  expenses: Expense[],
  range: "day" | "week" | "month" | "year",
  date: Date = new Date()
): Expense[] {
  let start: Date;
  let end: Date;

  switch (range) {
    case "day":
      start = startOfDay(date);
      end = endOfDay(date);
      break;
    case "week":
      start = startOfWeek(date, { weekStartsOn: 1 });
      end = endOfWeek(date, { weekStartsOn: 1 });
      break;
    case "month":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "year":
      start = startOfYear(date);
      end = endOfYear(date);
      break;
    default:
      return expenses;
  }

  return expenses.filter((e) => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start, end });
  });
}

export function getTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getCategoryTotals(
  expenses: Expense[]
): { category: CategoryId; total: number }[] {
  const map = new Map<CategoryId, number>();
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  }
  return Array.from(map.entries()).map(([category, total]) => ({
    category,
    total,
  }));
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getDaysInMonth(date: Date): number {
  return endOfMonth(date).getDate();
}

export function getRemainingDaysInMonth(date: Date = new Date()): number {
  const end = endOfMonth(date);
  const days = differenceInDays(end, date);
  return Math.max(1, days);
}

export function getDynamicDailyBudget(
  monthlyBudget: number,
  monthSpent: number,
  date: Date = new Date()
): { daily: number; remaining: number; daysLeft: number } {
  const remaining = monthlyBudget - monthSpent;
  const daysLeft = getRemainingDaysInMonth(date);
  const daily = daysLeft > 0 ? remaining / daysLeft : 0;
  return { daily, remaining, daysLeft };
}

export function getSpendingByDay(
  expenses: Expense[],
  month: Date
): { day: number; amount: number }[] {
  const days = getDaysInMonth(month);
  const result: { day: number; amount: number }[] = [];
  for (let d = 1; d <= days; d++) {
    const dayDate = new Date(month.getFullYear(), month.getMonth(), d);
    const dayExpenses = filterByDateRange(expenses, "day", dayDate);
    result.push({ day: d, amount: getTotal(dayExpenses) });
  }
  return result;
}
