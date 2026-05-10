"use client";

import { useActionState } from "react";
import { signupSale, type SaleSignupState } from "@/lib/actions/sale";
import { cn } from "@/lib/utils";

export function SaleSetupForm() {
  const [state, formAction, pending] = useActionState<SaleSignupState | null, FormData>(
    signupSale,
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      <Field label="เบอร์โทร" required error={state && !state.ok ? state.fields?.phone : undefined}>
        <input
          name="phone"
          type="tel"
          required
          inputMode="tel"
          placeholder="08x-xxx-xxxx"
          className="input"
        />
      </Field>

      <Field label="Bio (สั้น ๆ บอกเกี่ยวกับตัวคุณ)">
        <textarea
          name="bio"
          rows={3}
          maxLength={500}
          placeholder="เช่น เคยทำการตลาดกลุ่มความงาม 3 ปี..."
          className="input resize-none"
        />
      </Field>

      <fieldset className="space-y-4 rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5">
        <legend className="px-1 text-[0.85rem] font-semibold text-[color:var(--color-gold-bright)]">
          ช่องทางรับเงิน
        </legend>
        <p className="text-[0.8rem] text-[color:var(--color-muted)]">
          กรอก <b>โอนธนาคาร</b> หรือ <b>PromptPay</b> อย่างน้อย 1 อย่าง
        </p>

        <Field label="ชื่อบัญชี">
          <input name="bank_account_name" type="text" placeholder="ตามที่ปรากฏในสมุดบัญชี" className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="เลขบัญชี" error={state && !state.ok ? state.fields?.bank_account_no : undefined}>
            <input name="bank_account_no" type="text" inputMode="numeric" className="input" />
          </Field>
          <Field label="ธนาคาร">
            <input name="bank_name" type="text" placeholder="เช่น KBank, SCB" className="input" />
          </Field>
        </div>
        <div className="text-center text-[0.78rem] text-[color:var(--color-muted)]">— หรือ —</div>
        <Field label="PromptPay (เบอร์โทรหรือเลขบัตร)">
          <input name="promptpay" type="text" inputMode="numeric" className="input" />
        </Field>
      </fieldset>

      {state && !state.ok && (
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
        {pending ? "กำลังส่งใบสมัคร..." : "สมัครเป็น Sale (รออนุมัติ)"}
      </button>
      <p className="text-center text-[0.78rem] text-[color:var(--color-muted)]">
        หลังส่งใบสมัคร Admin จะตรวจสอบและอนุมัติภายใน 1-2 วันทำการ
      </p>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-border-default);
          background: var(--color-surface-elevated);
          padding: 0.75rem 1rem;
          font-size: 0.92rem;
          color: var(--color-foreground);
        }
        .input::placeholder { color: var(--color-muted); }
        .input:focus { outline: none; border-color: var(--color-gold); }
      `}</style>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.78rem] font-medium text-[color:var(--color-muted-strong)]">
        {label}
        {required && <span className="text-[color:var(--color-hot)]">*</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-[0.75rem] text-[color:var(--color-hot)]">{error}</span>
      )}
    </label>
  );
}
