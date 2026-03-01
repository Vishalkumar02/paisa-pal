import type { Category, CategoryId } from "@/types";
import { getCustomCategories } from "./storage";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", name: "Food & Dining", icon: "🍔", color: "#F59E0B" },
  { id: "transport", name: "Transport", icon: "🚗", color: "#3B82F6" },
  { id: "shopping", name: "Shopping", icon: "🛒", color: "#EC4899" },
  { id: "entertainment", name: "Entertainment", icon: "🎬", color: "#8B5CF6" },
  { id: "bills", name: "Bills & Utilities", icon: "📄", color: "#10B981" },
  { id: "health", name: "Health", icon: "💊", color: "#EF4444" },
  { id: "education", name: "Education", icon: "📚", color: "#06B6D4" },
  { id: "personal", name: "Personal", icon: "🧴", color: "#F97316" },
  { id: "other", name: "Other", icon: "📦", color: "#6B7280" },
];

export function getAllCategories(): Category[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  const custom = getCustomCategories();
  return [...DEFAULT_CATEGORIES, ...custom];
}

export function getCategoryById(id: CategoryId): Category | undefined {
  const all = getAllCategories();
  return all.find((c) => c.id === id);
}

export const ICON_OPTIONS = [
  "🍔", "🚗", "🛒", "🎬", "📄", "💊", "📚", "🧴", "📦",
  "☕", "✈️", "🏠", "🎮", "📱", "👕", "🐕", "🌿", "🎁",
  "💡", "🔧", "📷", "🎵", "📺", "🏋️", "🧘", "✏️", "📌",
];

export const COLOR_OPTIONS = [
  "#F59E0B", "#3B82F6", "#EC4899", "#8B5CF6", "#10B981",
  "#EF4444", "#06B6D4", "#F97316", "#6B7280", "#84CC16",
  "#6366F1", "#EC4899", "#14B8A6", "#F43F5E",
];
