"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PieChart, Wallet, Menu } from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/insights", icon: PieChart, label: "Insights" },
  { href: "/budget", icon: Wallet, label: "Budget" },
  { href: "/more", icon: Menu, label: "More" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-colors min-w-0 ${
                isActive ? "text-amber-400" : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <Icon
                className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs mt-0.5 truncate max-w-full px-1">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
