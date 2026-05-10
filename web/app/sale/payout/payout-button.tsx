"use client";

import { useActionState } from "react";
import { requestPayout, type PayoutState } from "@/lib/actions/sale";
import { cn, formatBaht } from "@/lib/utils";

export function PayoutButton({
  approvedAmount,
  hasPending,
}: {
  approvedAmount: number;
  hasPending: boolean;
}) {
  const [state, formAction, pending] = useActionState<PayoutState | null, FormData>(
    requestPayout,
    null,
  );

  const disabled = pending || hasPending || approvedAmount <= 0;

  return (
    <form action={formAction} className="rounded-2xl border border-[color:var(--color-gold-deep)] bg-gradient-to-br from-[color:var(--color-gold)]/10 to-transparent p-6">
      <div className="text-[0.78rem] text-[color:var(--color-muted-strong)]">
        ยอดที่ถอนได้
      </div>
      <div className="mt-1 font-display text-[2rem] font-bold text-[color:var(--color-gold-bright)]">
        {formatBaht(approvedAmount)} <span className="text-[1rem]">฿</span>
      </div>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-[0.78rem] font-medium text-[color:var(--color-muted-strong)]">
          ข้อความเพิ่มเติม (ไม่บังคับ)
        </span>
        <textarea
          name="note"
          rows={2}
          maxLength={300}
          placeholder="เช่น ขอโอนเข้าบัญชี SCB"
          className="w-full resize-none rounded-xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-4 py-3 text-[0.92rem] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-gold)] focus:outline-none"
        />
      </label>

      {state?.ok && (
        <p className="mt-3 text-[0.85rem] text-[color:var(--color-gold-bright)]">
          ✓ ส่งคำขอถอน {formatBaht(state.amount)} ฿ เรียบร้อย — รอ Admin อนุมัติ
        </p>
      )}
      {state && !state.ok && (
        <p className="mt-3 text-[0.85rem] text-[color:var(--color-hot)]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={disabled}
        className={cn(
          "mt-4 w-full rounded-full px-5 py-3 text-[0.92rem] font-semibold transition-all",
          disabled
            ? "bg-[color:var(--color-surface-elevated)] text-[color:var(--color-muted)]"
            : "bg-[color:var(--color-gold)] text-black hover:bg-[color:var(--color-gold-bright)]",
        )}
      >
        {pending
          ? "กำลังส่งคำขอ..."
          : hasPending
          ? "มีคำขอรออนุมัติอยู่"
          : approvedAmount <= 0
          ? "ยังไม่มีค่าคอมที่อนุมัติแล้ว"
          : "ส่งคำขอถอนเงิน"}
      </button>
    </form>
  );
}
