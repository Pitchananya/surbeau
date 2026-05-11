"use client";

import { useActionState } from "react";
import { submitContactSales, type InquiryState } from "@/lib/actions/inquiry";
import { cn } from "@/lib/utils";

export function ContactSalesForm({ initialPlan }: { initialPlan?: string }) {
  const [state, formAction, pending] = useActionState<InquiryState | null, FormData>(
    submitContactSales,
    null,
  );
  const errs = state && !state.ok ? state.fields ?? {} : {};

  if (state?.ok) {
    return (
      <div className="rounded-3xl border border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/5 p-8 text-center lg:p-10">
        <div className="text-4xl">🎉</div>
        <h3 className="mt-4 text-[1.25rem] font-bold text-[color:var(--color-gold-bright)] lg:text-[1.4rem]">
          รับข้อมูลเรียบร้อย
        </h3>
        <p className="mt-3 text-[0.95rem] text-[color:var(--color-muted-strong)]">
          ทีมขายของเราจะติดต่อกลับภายใน <b className="text-[color:var(--color-foreground)]">1 วันทำการ</b>
        </p>
        <p className="mt-2 text-[0.82rem] text-[color:var(--color-muted)]">
          เรื่องเร่งด่วน: LINE Official <b className="text-[color:var(--color-gold-bright)]">@surbeau</b>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field label="ชื่อ-นามสกุล" required error={errs.name}>
          <input name="name" type="text" required maxLength={200} className="input" />
        </Field>
        <Field label="ชื่อคลินิก" required error={errs.clinic_name}>
          <input name="clinic_name" type="text" required maxLength={200} className="input" />
        </Field>
        <Field label="Email" error={errs.email}>
          <input name="email" type="email" placeholder="you@example.com" className="input" />
        </Field>
        <Field label="เบอร์โทร" error={errs.phone}>
          <input name="phone" type="tel" inputMode="tel" placeholder="08x-xxx-xxxx" className="input" />
        </Field>
      </div>
      <p className="-mt-1 text-[0.78rem] text-[color:var(--color-muted)]">
        ✱ กรอก email หรือเบอร์โทร อย่างน้อย 1 อย่าง
      </p>

      <Field label="แพ็กเกจที่สนใจ">
        <select name="plan_interest" defaultValue={initialPlan ?? ""} className="input">
          <option value="">ยังไม่แน่ใจ — อยากปรึกษา</option>
          <option value="verified">Verified (3,000 ฿/เดือน)</option>
          <option value="premier">Premier (9,000 ฿/เดือน)</option>
          <option value="custom">Custom / Enterprise (หลายสาขา)</option>
        </select>
      </Field>

      <Field label="ข้อความเพิ่มเติม (ไม่บังคับ)">
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="ตัวอย่าง: คลินิก 3 สาขาในกรุงเทพ มีพนักงาน 12 คน อยากดูราคา custom"
          className="input resize-none"
        />
      </Field>

      {state && !state.ok && !state.fields && (
        <p className="text-[0.85rem] text-[color:var(--color-hot)]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "mt-2 w-full rounded-full px-5 py-3.5 text-[0.95rem] font-semibold transition-all",
          pending
            ? "bg-[color:var(--color-surface-elevated)] text-[color:var(--color-muted)]"
            : "bg-[color:var(--color-gold)] text-black hover:bg-[color:var(--color-gold-bright)]",
        )}
      >
        {pending ? "กำลังส่ง..." : "ส่งข้อมูล — ติดต่อกลับใน 1 วันทำการ"}
      </button>

      <p className="text-center text-[0.78rem] text-[color:var(--color-muted)]">
        ข้อมูลของคุณเก็บเป็นความลับ ใช้เฉพาะการติดต่อขายเท่านั้น
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
