"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { useExpenseContext } from "@/context/ExpenseContext";
import { format } from "date-fns";
import type { CategoryId } from "@/types";

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export function AddExpenseModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addExpense, categories } = useExpenseContext();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId>("food");
  const firstCategory = categories[0]?.id ?? "food";

  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.id === category)) {
      setCategory(firstCategory);
    }
  }, [categories, category, firstCategory]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(num) || num <= 0) return;

    addExpense({
      amount: Math.round(num * 100) / 100,
      category,
      note: note.trim() || undefined,
      date,
    });

    setAmount("");
    setNote("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    onClose();
  };

  const addToAmount = (n: number) => {
    const current = parseFloat(amount.replace(/,/g, "")) || 0;
    setAmount(String(current + n));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-h-[90vh] overflow-y-auto bg-slate-800/95 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl sm:max-w-md shadow-2xl border border-slate-700/50">
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/95 z-10">
          <h2 className="text-xl font-bold text-white">Add Expense</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Amount (₹)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^0-9.]/g, ""))
              }
              placeholder="0"
              className="w-full text-3xl font-bold bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {QUICK_AMOUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => addToAmount(n)}
                  className="px-3 py-1.5 rounded-lg bg-slate-600/80 hover:bg-slate-500 text-sm font-medium transition-colors"
                >
                  +{n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${
                    category === c.id
                      ? "border-amber-500 bg-amber-500/20 shadow-[0_0_0_1px_rgba(245,158,11,0.3)]"
                      : "border-slate-600/50 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-600/50"
                  }`}
                >
                  <span className="text-2xl">{c.icon}</span>
                  <span className="text-xs font-medium truncate w-full text-center">
                    {c.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Coffee, groceries..."
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={!amount || parseFloat(amount.replace(/,/g, "")) <= 0}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}
