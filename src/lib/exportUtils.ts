import { format, subDays } from "date-fns";
import type { Expense, CoinReward, OverBudgetPenalty } from "@/types";

type PresetRange = "1week" | "2weeks" | "3weeks" | "1month" | "2months";

const PRESET_DAYS: Record<PresetRange, number> = {
  "1week": 7,
  "2weeks": 14,
  "3weeks": 21,
  "1month": 30,
  "2months": 60,
};

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function filterExpensesByPreset(
  expenses: Expense[],
  preset: PresetRange
): Expense[] {
  const days = PRESET_DAYS[preset];
  const cutoff = subDays(new Date(), days);
  return expenses
    .filter((e) => new Date(e.date) >= cutoff)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function filterExpensesByCustom(
  expenses: Expense[],
  startDate: string,
  endDate: string
): Expense[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function filterRewardsByRange(
  rewards: CoinReward[],
  preset: PresetRange,
  customStart?: string,
  customEnd?: string
): CoinReward[] {
  if (customStart && customEnd) {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    return rewards.filter((r) => {
      const d = new Date(r.createdAt);
      return d >= start && d <= end;
    });
  }
  const days = PRESET_DAYS[preset];
  const cutoff = subDays(new Date(), days);
  return rewards.filter((r) => new Date(r.createdAt) >= cutoff);
}

export function filterPenaltiesByRange(
  penalties: OverBudgetPenalty[],
  preset: PresetRange,
  customStart?: string,
  customEnd?: string
): OverBudgetPenalty[] {
  if (customStart && customEnd) {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    return penalties.filter((p) => {
      const d = new Date(p.createdAt);
      return d >= start && d <= end;
    });
  }
  const days = PRESET_DAYS[preset];
  const cutoff = subDays(new Date(), days);
  return penalties.filter((p) => new Date(p.createdAt) >= cutoff);
}

export function generateExpensesCSV(
  expenses: Expense[],
  getCategoryName: (id: string) => string,
  periodCoins: number,
  periodCashback: number,
  rangeLabel: string
): string {
  const headers = ["Date", "Amount (₹)", "Category", "Note"];
  const rows: string[][] = [headers];

  for (const e of expenses) {
    rows.push([
      format(new Date(e.date), "yyyy-MM-dd"),
      String(e.amount),
      escapeCSV(getCategoryName(e.category)),
      escapeCSV(e.note ?? ""),
    ]);
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  rows.push([]);
  rows.push(["Summary", "", "", ""]);
  rows.push(["Total Expenses (₹)", String(totalExpenses), "", ""]);
  rows.push(["Coins (period)", String(periodCoins), "", ""]);
  rows.push(["Cashback (period)", String(periodCashback), "", ""]);
  rows.push(["Export Range", rangeLabel, "", ""]);

  return rows.map((row) => row.join(",")).join("\n");
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
