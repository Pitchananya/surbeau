"use client";

import { useTransition } from "react";
import { toggleJobOpen } from "@/lib/actions/jobs";
import { cn } from "@/lib/utils";

export function ToggleJobButton({
  jobId,
  status,
}: {
  jobId: string;
  status: "open" | "closed" | "draft";
}) {
  const [pending, start] = useTransition();
  const isOpen = status === "open";

  return (
    <button
      type="button"
      onClick={() => start(() => toggleJobOpen(jobId).then(() => {}))}
      disabled={pending}
      className={cn(
        "rounded-full border px-3 py-1 text-[0.78rem] font-medium transition-colors disabled:opacity-50",
        isOpen
          ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]"
          : "border-[color:var(--color-border-default)] text-[color:var(--color-muted)]",
      )}
    >
      {pending ? "..." : isOpen ? "เปิดรับ" : "ปิดรับ"}
    </button>
  );
}
