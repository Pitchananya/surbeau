"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function Categories() {
  const [active, setActive] = useState<string | null>("botox");

  return (
    <section className="px-5 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[1.05rem] font-bold">หมวดหมู่</h2>
        <button
          type="button"
          className="text-[0.82rem] font-medium text-[color:var(--color-gold-bright)] hover:underline"
        >
          ดูทั้งหมด
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {CATEGORIES.map((c) => {
          const isActive = active === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActive(isActive ? null : c.slug)}
              className={cn(
                "group flex aspect-[1/1.05] flex-col items-center justify-center gap-1.5 rounded-2xl border p-2 transition-all",
                isActive
                  ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/5 ring-gold"
                  : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-gold-muted)]",
              )}
            >
              <span className="text-2xl leading-none" aria-hidden>
                {c.icon}
              </span>
              <span
                className={cn(
                  "text-[0.74rem] font-medium",
                  isActive ? "text-[color:var(--color-gold-bright)]" : "text-[color:var(--color-muted-strong)]",
                )}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
