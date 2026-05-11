"use client";

import { useTransition, useState } from "react";

type ActionResult = { ok: boolean; error?: string; message?: string };

export function ApproveRejectButtons({
  id,
  approveAction,
  rejectAction,
  approveLabel = "อนุมัติ",
  rejectLabel = "ปฏิเสธ",
}: {
  id: string;
  approveAction: (id: string) => Promise<ActionResult>;
  rejectAction: (id: string) => Promise<ActionResult>;
  approveLabel?: string;
  rejectLabel?: string;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = (fn: typeof approveAction) =>
    start(async () => {
      setErr(null);
      const r = await fn(id);
      if (r.ok) {
        setMsg(r.message ?? "สำเร็จ");
        setTimeout(() => setMsg(null), 2500);
      } else {
        setErr(r.error ?? "เกิดข้อผิดพลาด");
        setTimeout(() => setErr(null), 3500);
      }
    });

  if (msg) return <span className="text-[0.82rem] text-[color:var(--color-gold-bright)]">✓ {msg}</span>;
  if (err) return <span className="text-[0.82rem] text-[color:var(--color-hot)]">✗ {err}</span>;

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => run(approveAction)}
        disabled={pending}
        className="rounded-full bg-[color:var(--color-gold)] px-3.5 py-1.5 text-[0.78rem] font-semibold text-black transition-colors hover:bg-[color:var(--color-gold-bright)] disabled:opacity-50"
      >
        {approveLabel}
      </button>
      <button
        type="button"
        onClick={() => {
          if (window.confirm(`ยืนยัน "${rejectLabel}" ?`)) run(rejectAction);
        }}
        disabled={pending}
        className="rounded-full border border-[color:var(--color-hot)]/40 px-3.5 py-1.5 text-[0.78rem] font-medium text-[color:var(--color-hot)] transition-colors hover:bg-[color:var(--color-hot-soft)] disabled:opacity-50"
      >
        {rejectLabel}
      </button>
    </div>
  );
}

export function ToggleBlockButton({
  userId,
  currentStatus,
  setStatus,
}: {
  userId: string;
  currentStatus: "active" | "pending" | "blocked";
  setStatus: (userId: string, status: "active" | "blocked") => Promise<ActionResult>;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const toggle = () => {
    const next = currentStatus === "blocked" ? "active" : "blocked";
    if (next === "blocked" && !window.confirm("Block ผู้ใช้นี้?")) return;
    start(async () => {
      const r = await setStatus(userId, next);
      setMsg(r.ok ? r.message ?? "✓" : `✗ ${r.error}`);
      setTimeout(() => setMsg(null), 2500);
    });
  };

  if (msg) return <span className="text-[0.78rem] text-[color:var(--color-gold-bright)]">{msg}</span>;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={
        currentStatus === "blocked"
          ? "rounded-full border border-[color:var(--color-gold)] px-3 py-1 text-[0.78rem] font-medium text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold)]/10 disabled:opacity-50"
          : "rounded-full border border-[color:var(--color-hot)]/40 px-3 py-1 text-[0.78rem] font-medium text-[color:var(--color-hot)] hover:bg-[color:var(--color-hot-soft)] disabled:opacity-50"
      }
    >
      {currentStatus === "blocked" ? "Unblock" : "Block"}
    </button>
  );
}

export function TierSelect({
  clinicId,
  currentTier,
  setTier,
}: {
  clinicId: string;
  currentTier: "free" | "verified" | "premier";
  setTier: (clinicId: string, tier: "free" | "verified" | "premier") => Promise<ActionResult>;
}) {
  const [pending, start] = useTransition();
  const [value, setValue] = useState(currentTier);
  const [msg, setMsg] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as "free" | "verified" | "premier";
    setValue(next);
    start(async () => {
      const r = await setTier(clinicId, next);
      setMsg(r.ok ? "✓ บันทึก" : `✗ ${r.error}`);
      setTimeout(() => setMsg(null), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={onChange}
        disabled={pending}
        className="rounded-full border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-3 py-1 text-[0.78rem] focus:border-[color:var(--color-gold)] focus:outline-none"
      >
        <option value="free">Free</option>
        <option value="verified">✓ Verified</option>
        <option value="premier">★ Premier</option>
      </select>
      {msg && <span className="text-[0.72rem] text-[color:var(--color-gold-bright)]">{msg}</span>}
    </div>
  );
}
