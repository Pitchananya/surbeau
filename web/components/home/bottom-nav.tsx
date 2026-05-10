"use client";

import { Search, Tag, LayoutDashboard, Wallet } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "search", label: "ค้นหา", icon: Search },
  { id: "promo", label: "โปร", icon: Tag },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "earnings", label: "รายได้", icon: Wallet },
] as const;

export function BottomNav() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("search");

  return (
    <nav className="sticky bottom-0 mt-6 border-t border-[color:var(--color-border-soft)] bg-[color:var(--color-background)]/95 px-2 py-2 backdrop-blur-md">
      <ul className="flex items-center justify-around">
        {TABS.map((t) => {
          const isActive = active === t.id;
          const Icon = t.icon;
          return (
            <li key={t.id} className="flex-1">
              <button
                type="button"
                onClick={() => setActive(t.id)}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-xl py-1.5 transition-colors",
                  isActive
                    ? "text-[color:var(--color-gold-bright)]"
                    : "text-[color:var(--color-muted)]",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[0.68rem] font-medium">{t.label}</span>
                {isActive && (
                  <span className="h-[2px] w-6 rounded-full bg-[color:var(--color-gold)]" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
