"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitMembershipPayment, type SubmitState } from "@/lib/actions/membership";
import { cn } from "@/lib/utils";

export function SubmitPaymentForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<SubmitState | null, FormData>(
    submitMembershipPayment,
    null,
  );

  useEffect(() => {
    if (state?.ok) router.push("/candidate");
  }, [state, router]);

  const errs = state && !state.ok ? state.fields ?? {} : {};

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="payment_method" value="promptpay" />

      <label className="block">
        <span className="mb-1.5 block text-[0.78rem] font-medium text-[color:var(--color-muted-strong)]">
          หมายเลขอ้างอิงการโอน (ดูจาก slip/transaction ID)
          <span className="text-[color:var(--color-hot)]">*</span>
        </span>
        <input
          name="payment_ref"
          type="text"
          required
          maxLength={100}
          placeholder="เช่น 2026051120251234567"
          className="w-full rounded-xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-4 py-3 text-[0.92rem] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-gold)] focus:outline-none"
        />
        {errs.payment_ref && (
          <span className="mt-1 block text-[0.75rem] text-[color:var(--color-hot)]">
            {errs.payment_ref}
          </span>
        )}
      </label>

      {state && !state.ok && !state.fields && (
        <p className="text-[0.85rem] text-[color:var(--color-hot)]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "w-full rounded-full px-5 py-3.5 text-[0.95rem] font-semibold transition-all",
          pending
            ? "bg-[color:var(--color-surface-elevated)] text-[color:var(--color-muted)]"
            : "bg-[color:var(--color-gold)] text-black hover:bg-[color:var(--color-gold-bright)]",
        )}
      >
        {pending ? "กำลังส่ง..." : "ยืนยันชำระเงิน 300฿"}
      </button>

      <p className="text-center text-[0.78rem] text-[color:var(--color-muted)]">
        Admin จะตรวจสอบและเปิดใช้งาน Premium ภายใน 1 วันทำการ
      </p>
    </form>
  );
}
