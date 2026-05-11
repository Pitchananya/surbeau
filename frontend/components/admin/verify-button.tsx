"use client";

import { useState, useTransition } from "react";
import { BadgeCheck } from "lucide-react";

type ActionResult = { ok: boolean; error?: string; message?: string };

export function VerifyButton({
  candidateId,
  isVerified,
  setVerified,
}: {
  candidateId: string;
  isVerified: boolean;
  setVerified: (id: string, verified: boolean) => Promise<ActionResult>;
}) {
  const [pending, start] = useTransition();
  const [verified, setVerifiedState] = useState(isVerified);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const toggle = () => {
    const next = !verified;
    if (!next && !window.confirm("ยกเลิก verify โปรไฟล์นี้?")) return;

    start(async () => {
      const r = await setVerified(candidateId, next);
      if (r.ok) {
        setVerifiedState(next);
        setMsg(r.message ?? "✓");
        setTimeout(() => setMsg(null), 2500);
      } else {
        setErr(r.error ?? "เกิดข้อผิดพลาด");
        setTimeout(() => setErr(null), 3000);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={
          verified
            ? "inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 px-3.5 py-1.5 text-[0.78rem] font-medium text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold)]/20 disabled:opacity-50"
            : "inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-gold)] px-3.5 py-1.5 text-[0.78rem] font-semibold text-black hover:bg-[color:var(--color-gold-bright)] disabled:opacity-50"
        }
      >
        <BadgeCheck className="h-3.5 w-3.5" />
        {pending ? "..." : verified ? "Verified ✓" : "Verify"}
      </button>
      {msg && <span className="text-[0.72rem] text-[color:var(--color-gold-bright)]">{msg}</span>}
      {err && <span className="text-[0.72rem] text-[color:var(--color-hot)]">{err}</span>}
    </div>
  );
}
