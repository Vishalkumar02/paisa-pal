"use client";

import { useState, useEffect, useCallback } from "react";
import type { Category } from "@/types";
import {
  getCustomCategories,
  saveCustomCategories,
  addCustomCategory as addStorage,
  updateCustomCategory as updateStorage,
  deleteCustomCategory as deleteStorage,
} from "@/lib/storage";

export function useCategories() {
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCustomCategories(getCustomCategories());
    setMounted(true);
  }, []);

  const addCustomCategory = useCallback(
    (category: Omit<Category, "id" | "isCustom">) => {
      const newCat = addStorage(category);
      setCustomCategories(getCustomCategories());
      return newCat;
    },
    []
  );

  const updateCustomCategory = useCallback((id: string, updates: Partial<Omit<Category, "id">>) => {
    updateStorage(id, updates);
    setCustomCategories(getCustomCategories());
  }, []);

  const deleteCustomCategory = useCallback((id: string) => {
    deleteStorage(id);
    setCustomCategories(getCustomCategories());
  }, []);

  return {
    customCategories,
    addCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
    mounted,
  };
}
