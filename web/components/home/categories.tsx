"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function Categories() {
  const [active, setActive] = useState<string | null>("botox");

  return (
    <section className="px-5 pt-5 lg:mx-auto lg:max-w-7xl lg:px-8 lg:pt-14">
      <div className="mb-3 flex items-center justify-between lg:mb-6">
        <h2 className="text-[1.05rem] font-bold lg:text-[1.5rem]">
          หมวดหมู่ <span className="font-normal text-[color:var(--color-muted)] lg:text-[0.95rem]">ที่นิยม</span>
        </h2>
        <button
          type="button"
          className="text-[0.82rem] font-medium text-[color:var(--color-gold-bright)] hover:underline lg:text-[0.92rem]"
        >
          ดูทั้งหมด →
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 lg:gap-4">
        {CATEGORIES.map((c) => {
          const isActive = active === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActive(isActive ? null : c.slug)}
              className={cn(
                "group flex aspect-[1/1.05] flex-col items-center justify-center gap-1.5 rounded-2xl border p-2 transition-all lg:gap-3 lg:rounded-3xl lg:p-4",
                isActive
                  ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/5 ring-gold"
                  : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-gold-muted)] hover:bg-[color:var(--color-surface-elevated)]",
              )}
            >
              <span className="text-2xl leading-none lg:text-[2rem]" aria-hidden>
                {c.icon}
              </span>
              <span
                className={cn(
                  "text-[0.74rem] font-medium lg:text-[0.85rem]",
                  isActive
                    ? "text-[color:var(--color-gold-bright)]"
                    : "text-[color:var(--color-muted-strong)]",
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
