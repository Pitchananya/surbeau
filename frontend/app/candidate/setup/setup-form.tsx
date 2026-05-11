"use client";

import { useActionState } from "react";
import { signupCandidate, type CandidateSignupState } from "@/lib/actions/jobs";
import { cn } from "@/lib/utils";

export function CandidateSetupForm() {
  const [state, formAction, pending] = useActionState<CandidateSignupState | null, FormData>(
    signupCandidate,
    null,
  );
  const errs = state && !state.ok ? state.fields ?? {} : {};

  return (
    <form action={formAction} className="space-y-5">
      <Field label="เบอร์โทร" required error={errs.phone}>
        <input
          name="phone"
          type="tel"
          required
          inputMode="tel"
          placeholder="08x-xxx-xxxx"
          className="input"
        />
      </Field>

      <Field
        label="แนะนำตัว 1 บรรทัด"
        required
        error={errs.headline}
        hint='เช่น "พยาบาลวิชาชีพ · Injector certified · 5 ปี"'
      >
        <input
          name="headline"
          type="text"
          required
          maxLength={200}
          className="input"
        />
      </Field>

      <Field label="Bio (รายละเอียดยาว — ใส่ทีหลังได้)">
        <textarea
          name="bio"
          rows={3}
          maxLength={500}
          placeholder="เขียนเล่าประสบการณ์ ความถนัด สิ่งที่ทำได้ดี..."
          className="input resize-none"
        />
      </Field>

      <Field label="ประสบการณ์ (ปี)" error={errs.experience_years}>
        <input
          name="experience_years"
          type="number"
          inputMode="numeric"
          min="0"
          max="60"
          placeholder="0"
          className="input"
        />
      </Field>

      <Field
        label="Skills (คั่นด้วย ,)"
        hint='เช่น "rn, injector, laser, reception"'
      >
        <input
          name="skills"
          type="text"
          placeholder="rn, injector, laser"
          className="input"
        />
      </Field>

      <Field
        label="ความถนัด (คั่นด้วย ,)"
        hint='เช่น "โบท็อกซ์, ฟิลเลอร์, เลเซอร์, ทรีตเมนต์"'
      >
        <input
          name="specialties"
          type="text"
          placeholder="โบท็อกซ์, ฟิลเลอร์"
          className="input"
        />
      </Field>

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
        {pending ? "กำลังบันทึก..." : "สร้างโปรไฟล์ (ฟรี)"}
      </button>
      <p className="text-center text-[0.78rem] text-[color:var(--color-muted)]">
        Premium 300฿/ปี (สมัครงานพรีเมียมไม่จำกัด) — สมัครได้หลังสร้างโปรไฟล์
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
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.78rem] font-medium text-[color:var(--color-muted-strong)]">
        {label}
        {required && <span className="text-[color:var(--color-hot)]">*</span>}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-[0.72rem] text-[color:var(--color-muted)]">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-[0.75rem] text-[color:var(--color-hot)]">{error}</span>
      )}
    </label>
  );
}
