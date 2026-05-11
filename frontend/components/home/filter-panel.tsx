"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const PRICE_PRESETS = [
  { label: "ทั้งหมด", min: undefined as number | undefined, max: undefined as number | undefined },
  { label: "ต่ำกว่า 3,000", min: undefined, max: 3000 },
  { label: "3,000-10,000", min: 3000, max: 10000 },
  { label: "10,000-30,000", min: 10000, max: 30000 },
  { label: "มากกว่า 30,000", min: 30000, max: undefined },
];

const SORT_OPTIONS = [
  { value: "featured", label: "แนะนำ" },
  { value: "rating", label: "คะแนนสูงสุด" },
  { value: "price_asc", label: "ราคาต่ำ → สูง" },
  { value: "price_desc", label: "ราคาสูง → ต่ำ" },
];

export function FilterPanel({ provinces }: { provinces: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const current = {
    q:        params.get("q") ?? "",
    province: params.get("province") ?? "",
    category: params.get("category") ?? "",
    tier:     params.get("tier") ?? "",
    sort:     params.get("sort") ?? "featured",
    minPrice: params.get("min_price") ?? "",
    maxPrice: params.get("max_price") ?? "",
  };

  const activeCount = ["province", "category", "tier", "min_price", "max_price"]
    .filter((k) => params.get(k)).length;

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    start(() => router.replace(`/?${next.toString()}`, { scroll: false }));
  };

  const setPriceRange = (min: number | undefined, max: number | undefined) => {
    const next = new URLSearchParams(params.toString());
    if (min === undefined) next.delete("min_price");
    else next.set("min_price", String(min));
    if (max === undefined) next.delete("max_price");
    else next.set("max_price", String(max));
    start(() => router.replace(`/?${next.toString()}`, { scroll: false }));
  };

  const clearAll = () => {
    const keep = new URLSearchParams();
    if (current.q) keep.set("q", current.q);
    start(() => router.replace(`/?${keep.toString()}`, { scroll: false }));
  };

  const panel = (
    <div className="space-y-6 lg:space-y-7">
      {/* Sort */}
      <Section title="เรียงตาม">
        <select
          value={current.sort}
          onChange={(e) => setParam("sort", e.target.value === "featured" ? undefined : e.target.value)}
          className="select"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Section>

      {/* Province */}
      <Section title="จังหวัด">
        <select
          value={current.province}
          onChange={(e) => setParam("province", e.target.value || undefined)}
          className="select"
        >
          <option value="">ทุกจังหวัด</option>
          {provinces.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </Section>

      {/* Price */}
      <Section title="ช่วงราคา (บาท)">
        <div className="space-y-1.5">
          {PRICE_PRESETS.map((p, i) => {
            const isActive =
              String(current.minPrice) === String(p.min ?? "") &&
              String(current.maxPrice) === String(p.max ?? "");
            return (
              <button
                key={i}
                type="button"
                onClick={() => setPriceRange(p.min, p.max)}
                className={cn(
                  "block w-full rounded-lg px-3 py-2 text-left text-[0.85rem] transition-colors",
                  isActive
                    ? "bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]"
                    : "text-[color:var(--color-muted-strong)] hover:bg-[color:var(--color-surface-elevated)]",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Tier */}
      <Section title="ระดับคลินิก">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "", label: "ทุกระดับ" },
            { value: "premier", label: "★ Premier" },
            { value: "verified", label: "✓ Verified" },
            { value: "free", label: "Free" },
          ].map((t) => {
            const isActive = (current.tier || "") === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setParam("tier", t.value || undefined)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[0.78rem] font-medium transition-colors",
                  isActive
                    ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]"
                    : "border-[color:var(--color-border-default)] text-[color:var(--color-muted-strong)] hover:border-[color:var(--color-gold-muted)]",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Section>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-[0.82rem] font-medium text-[color:var(--color-gold-bright)] hover:underline"
        >
          ล้างตัวกรอง ({activeCount})
        </button>
      )}

      <style>{`
        .select {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-border-default);
          background: var(--color-surface);
          padding: 0.6rem 0.9rem;
          font-size: 0.88rem;
          color: var(--color-foreground);
        }
        .select:focus { outline: none; border-color: var(--color-gold); }
      `}</style>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] px-3.5 py-1.5 text-[0.82rem] font-medium text-[color:var(--color-foreground)] hover:border-[color:var(--color-gold-muted)] lg:hidden"
      >
        <Filter className="h-3.5 w-3.5" />
        ตัวกรอง
        {activeCount > 0 && (
          <span className="rounded-full bg-[color:var(--color-gold)] px-1.5 text-[0.72rem] font-bold text-black">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-[color:var(--color-border-default)] bg-[color:var(--color-background)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[1.15rem] font-bold">ตัวกรอง</h3>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="ปิด">
                <X className="h-5 w-5 text-[color:var(--color-muted)]" />
              </button>
            </div>
            {panel}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              disabled={pending}
              className="mt-6 w-full rounded-full bg-[color:var(--color-gold)] py-3 text-[0.92rem] font-semibold text-black hover:bg-[color:var(--color-gold-bright)]"
            >
              ดูผลลัพธ์
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-6">
          <h3 className="mb-5 text-[1rem] font-bold">ตัวกรอง</h3>
          {panel}
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-[0.78rem] font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
        {title}
      </h4>
      {children}
    </div>
  );
}
