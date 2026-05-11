"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus } from "@/lib/actions/clinic";
import { cn } from "@/lib/utils";

type Status = "new" | "contacted" | "success" | "failed";

const ORDER: { value: Status; label: string }[] = [
  { value: "new", label: "ใหม่" },
  { value: "contacted", label: "ติดต่อแล้ว" },
  { value: "success", label: "สำเร็จ" },
  { value: "failed", label: "ไม่สำเร็จ" },
];

export function LeadStatusControl({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(currentStatus);
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  const isLocked = status === "success";

  const setNew = (newStatus: Status) => {
    if (isLocked || newStatus === status) return;
    start(async () => {
      const result = await updateLeadStatus(leadId, newStatus);
      if (result.ok) {
        setStatus(newStatus);
        if (result.commissionCreated) {
          setToast("✓ สร้าง Commission ให้ Sale แล้ว");
          setTimeout(() => setToast(null), 3000);
        }
      } else {
        setToast(`✗ ${result.error}`);
        setTimeout(() => setToast(null), 3000);
      }
    });
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5">
        {ORDER.map((s) => {
          const active = s.value === status;
          const tone = getTone(s.value, active);
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => setNew(s.value)}
              disabled={pending || isLocked || active}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium transition-colors disabled:cursor-not-allowed",
                tone,
                pending && "opacity-50",
              )}
              title={
                isLocked && !active
                  ? "lead นี้ปิดสำเร็จแล้ว — เปลี่ยนสถานะไม่ได้"
                  : active
                  ? "สถานะปัจจุบัน"
                  : `เปลี่ยนเป็น ${s.label}`
              }
            >
              {s.label}
            </button>
          );
        })}
      </div>
      {toast && (
        <span className="absolute -top-7 right-0 whitespace-nowrap rounded-md border border-[color:var(--color-gold-deep)] bg-[color:var(--color-surface-elevated)] px-2 py-0.5 text-[0.72rem] text-[color:var(--color-gold-bright)]">
          {toast}
        </span>
      )}
    </div>
  );
}

function getTone(value: Status, active: boolean): string {
  if (active) {
    if (value === "success")   return "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]";
    if (value === "contacted") return "border-[color:var(--color-verified)] bg-[color:var(--color-verified-soft)] text-[color:var(--color-verified)]";
    if (value === "failed")    return "border-[color:var(--color-hot)]/40 bg-[color:var(--color-hot-soft)] text-[color:var(--color-hot)]";
    return "border-[color:var(--color-foreground)] bg-[color:var(--color-surface-elevated)] text-[color:var(--color-foreground)]";
  }
  return "border-[color:var(--color-border-default)] bg-transparent text-[color:var(--color-muted)] hover:border-[color:var(--color-gold-muted)] hover:text-[color:var(--color-muted-strong)]";
}
