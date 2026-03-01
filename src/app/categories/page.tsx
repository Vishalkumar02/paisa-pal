"use client";

import { useState } from "react";
import { useExpenseContext } from "@/context/ExpenseContext";
import { ICON_OPTIONS, COLOR_OPTIONS } from "@/lib/categories";
import { Plus, Trash2, Tag } from "lucide-react";

export default function CategoriesPage() {
  const {
    categories,
    addCustomCategory,
    deleteCustomCategory,
    mounted,
  } = useExpenseContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📦");
  const [color, setColor] = useState("#6B7280");

  const defaultIds = [
    "food", "transport", "shopping", "entertainment",
    "bills", "health", "education", "personal", "other",
  ];
  const defaultCats = categories.filter((c) => defaultIds.includes(c.id));
  const customCats = categories.filter((c) => c.isCustom);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCustomCategory({ name: name.trim(), icon, color });
    setName("");
    setIcon("📦");
    setColor("#6B7280");
    setShowAddForm(false);
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 pt-6 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <p className="text-slate-400 text-sm">
          Manage your expense categories
        </p>
      </header>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Default categories
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {defaultCats.map((c) => (
            <div
              key={c.id}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50"
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="text-xs font-medium truncate w-full text-center text-slate-300">
                {c.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Your categories
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleAdd}
            className="rounded-2xl bg-slate-800/80 border border-slate-700/50 p-4 mb-4 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Subscriptions"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                      icon === i
                        ? "bg-amber-500/30 border-2 border-amber-500"
                        : "bg-slate-700 border-2 border-transparent hover:bg-slate-600"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 font-medium hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-medium hover:bg-amber-400 disabled:opacity-50"
              >
                Add Category
              </button>
            </div>
          </form>
        )}

        {customCats.length === 0 && !showAddForm ? (
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-8 text-center">
            <Tag className="w-12 h-12 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 mb-1">No custom categories yet</p>
            <p className="text-slate-500 text-sm mb-4">
              Add categories like Subscriptions, Pet Care, etc.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 font-medium hover:bg-amber-500/30"
            >
              Add your first category
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {customCats.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/50"
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${c.color}20` }}
                >
                  {c.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-slate-500 text-xs">Custom</p>
                </div>
                <button
                  onClick={() => deleteCustomCategory(c.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
