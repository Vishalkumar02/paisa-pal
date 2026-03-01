export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  category: CategoryId;
  note?: string;
  date: string; // ISO date string
  createdAt: string; // ISO timestamp
}

export interface Budget {
  monthlyTotal: number;
  categoryBudgets: Record<string, number>;
}

export interface CoinReward {
  id: string;
  amount: number;
  reason: "under_budget" | "category_under_budget";
  period: "day" | "month";
  date: string;
  createdAt: string;
}

export interface OverBudgetPenalty {
  id: string;
  amount: number;
  monthKey: string; // "yyyy-MM"
  createdAt: string;
}
