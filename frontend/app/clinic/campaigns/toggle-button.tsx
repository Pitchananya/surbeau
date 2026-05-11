"use client";

import { useTransition } from "react";
import { toggleCampaignActive } from "@/lib/actions/clinic";
import { cn } from "@/lib/utils";

export function ToggleActiveButton({
  campaignId,
  isActive,
}: {
  campaignId: string;
  isActive: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      onClick={() => start(() => toggleCampaignActive(campaignId).then(() => {}))}
      disabled={pending}
      className={cn(
        "rounded-full border px-3 py-1 text-[0.78rem] font-medium transition-colors disabled:opacity-50",
        isActive
          ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold)]/20"
          : "border-[color:var(--color-border-default)] text-[color:var(--color-muted)] hover:border-[color:var(--color-gold-muted)]",
      )}
      title={isActive ? "ปิดแคมเปญ (จะไม่แสดงในหน้าค้นหา)" : "เปิดแคมเปญ"}
    >
      {pending ? "..." : isActive ? "ใช้งานอยู่" : "ปิดอยู่"}
    </button>
  );
}
