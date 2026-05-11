"use client";

import { useState, useTransition } from "react";
import { updateApplicationStatus } from "@/lib/actions/jobs";
import { cn } from "@/lib/utils";

type Status = "pending" | "shortlisted" | "interviewing" | "hired" | "rejected" | "withdrawn";

// Allowed next statuses from each non-final state
const ALLOWED_NEXT: Record<Status, Status[]> = {
  pending:      ["shortlisted", "rejected"],
  shortlisted:  ["interviewing", "rejected"],
  interviewing: ["hired", "rejected"],
  hired:        [],
  rejected:     [],
  withdrawn:    [],
};

const LABELS: Record<Status, string> = {
  pending:      "รอพิจารณา",
  shortlisted:  "Shortlist",
  interviewing: "เรียกสัมภาษณ์",
  hired:        "รับเข้าทำงาน",
  rejected:     "ปฏิเสธ",
  withdrawn:    "ผู้สมัครถอน",
};

const STYLES: Record<Status, string> = {
  pending:      "border-[color:var(--color-border-default)] text-[color:var(--color-muted-strong)]",
  shortlisted:  "border-[color:var(--color-verified)] text-[color:var(--color-verified)] bg-[color:var(--color-verified-soft)]",
  interviewing: "border-[color:var(--color-verified)] text-[color:var(--color-verified)] bg-[color:var(--color-verified-soft)]",
  hired:        "border-[color:var(--color-gold)] text-[color:var(--color-gold-bright)] bg-[color:var(--color-gold)]/10",
  rejected:     "border-[color:var(--color-hot)]/40 text-[color:var(--color-hot)] bg-[color:var(--color-hot-soft)]",
  withdrawn:    "border-[color:var(--color-border-default)] text-[color:var(--color-muted)]",
};

export function StatusControl({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(currentStatus);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const isFinal = ALLOWED_NEXT[status].length === 0;
  const nextOptions = ALLOWED_NEXT[status];

  const goto = (next: Status) => {
    const isCritical = next === "hired" || next === "rejected";
    if (isCritical && !window.confirm(`ยืนยัน "${LABELS[next]}" ?\n(สถานะนี้เปลี่ยนไม่ได้อีก)`)) return;

    start(async () => {
      setErr(null);
      const result = await updateApplicationStatus(applicationId, next);
      if (result.ok) {
        setStatus(next);
      } else {
        setErr(result.error ?? "เกิดข้อผิดพลาด");
        setTimeout(() => setErr(null), 3000);
      }
    });
  };

  return (
    <div className="space-y-2">
      <span
        className={cn(
          "inline-block rounded-full border px-3 py-0.5 text-[0.78rem] font-medium",
          STYLES[status],
        )}
      >
        {LABELS[status]}
      </span>

      {!isFinal && (
        <div className="flex flex-wrap gap-2">
          {nextOptions.map((next) => {
            const isCritical = next === "hired" || next === "rejected";
            return (
              <button
                key={next}
                type="button"
                onClick={() => goto(next)}
                disabled={pending}
                className={cn(
                  "rounded-full border px-3 py-1 text-[0.78rem] font-medium transition-colors disabled:opacity-50",
                  isCritical && next === "hired"
                    ? "border-[color:var(--color-gold)] text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold)]/10"
                    : isCritical
                    ? "border-[color:var(--color-hot)]/40 text-[color:var(--color-hot)] hover:bg-[color:var(--color-hot-soft)]"
                    : "border-[color:var(--color-verified)] text-[color:var(--color-verified)] hover:bg-[color:var(--color-verified-soft)]",
                )}
              >
                → {LABELS[next]}
              </button>
            );
          })}
        </div>
      )}

      {err && <p className="text-[0.78rem] text-[color:var(--color-hot)]">✗ {err}</p>}
    </div>
  );
}
