"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { FilterPanel } from "@/components/home/filter-panel";
import { cn } from "@/lib/utils";
import type { Tier } from "@/lib/types";

type Chip = "all" | Tier;

const FILTERS: { value: Chip; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "premier", label: "★ Premier" },
  { value: "verified", label: "✓ Verified" },
  { value: "free", label: "Free" },
];

export function TierFilter({ provinces }: { provinces: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const active: Chip = (params.get("tier") as Chip) || "all";

  const setTier = (v: Chip) => {
    const next = new URLSearchParams(params.toString());
    if (v === "all") next.delete("tier");
    else next.set("tier", v);
    start(() => router.replace(`/?${next.toString()}`, { scroll: false }));
  };

  return (
    <div className="px-5 pt-4 lg:mx-auto lg:max-w-7xl lg:px-8 lg:pt-12">
      <div className="lg:flex lg:items-end lg:justify-between">
        <div>
          <h2 className="hidden text-[1.5rem] font-bold lg:block">
            คลินิกแนะนำ{" "}
            <span className="font-normal text-[color:var(--color-muted)] text-[0.95rem]">
              ใกล้คุณ
            </span>
          </h2>
          <p className="hidden text-[0.85rem] text-[color:var(--color-muted)] lg:mt-1 lg:block">
            เรียงตาม Tier และระยะทาง
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:overflow-visible lg:px-0">
            {FILTERS.map((f) => {
              const isActive = active === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setTier(f.value)}
                  disabled={pending}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-1.5 text-[0.82rem] font-medium transition-all disabled:cursor-wait lg:px-5 lg:py-2 lg:text-[0.88rem]",
                    getChipStyles(f.value, isActive),
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Mobile-only filter trigger */}
          <div className="lg:hidden">
            <FilterPanel provinces={provinces} />
          </div>
        </div>
      </div>

      <p className="mt-3 text-[0.78rem] text-[color:var(--color-muted)] lg:hidden">
        แสดงคลินิกใกล้คุณ — เรียงตาม tier และระยะทาง
      </p>
    </div>
  );
}

function getChipStyles(value: Chip, active: boolean): string {
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
