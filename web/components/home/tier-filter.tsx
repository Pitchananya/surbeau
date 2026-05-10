"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Tier } from "@/lib/types";

type Filter = "all" | Tier;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "premier", label: "★ Premier" },
  { value: "verified", label: "✓ Verified" },
  { value: "free", label: "Free" },
];

export function TierFilter() {
  const [active, setActive] = useState<Filter>("verified");

  return (
    <div className="px-5 pt-4">
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {FILTERS.map((f) => {
          const isActive = active === f.value;
          const styles = getChipStyles(f.value, isActive);
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setActive(f.value)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-[0.82rem] font-medium transition-all",
                styles,
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[0.78rem] text-[color:var(--color-muted)]">
        แสดงคลินิกใกล้คุณ — เรียงตาม tier และระยะทาง
      </p>
    </div>
  );
}

function getChipStyles(value: Filter, active: boolean): string {
  if (!active) {
    return "border-[color:var(--color-border-default)] bg-transparent text-[color:var(--color-muted-strong)] hover:border-[color:var(--color-gold-muted)]";
  }
  if (value === "premier") {
    return "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]";
  }
  if (value === "verified") {
    return "border-[color:var(--color-verified)] bg-[color:var(--color-verified-soft)] text-[color:var(--color-verified)]";
  }
  return "border-[color:var(--color-foreground)] bg-[color:var(--color-foreground)]/10 text-[color:var(--color-foreground)]";
}
