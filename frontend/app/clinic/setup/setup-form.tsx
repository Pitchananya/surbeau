"use client";

import { useActionState } from "react";
import { signupClinic, type ClinicSignupState } from "@/lib/actions/clinic";
import { cn } from "@/lib/utils";

export function ClinicSetupForm() {
  const [state, formAction, pending] = useActionState<ClinicSignupState | null, FormData>(
    signupClinic,
    null,
  );
  const errs = state && !state.ok ? state.fields ?? {} : {};

  return (
    <form action={formAction} className="space-y-5">
      <Field label="ชื่อคลินิก" required error={errs.clinic_name}>
        <input name="clinic_name" type="text" required placeholder="เช่น Glow Up Clinic" className="input" />
      </Field>

      <Field label="เลขที่ใบอนุญาต (ถ้ามี)">
        <input name="license_no" type="text" className="input" />
      </Field>

      <Field label="เบอร์โทรคลินิก" required error={errs.phone}>
        <input name="phone" type="tel" required inputMode="tel" placeholder="02-xxx-xxxx" className="input" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="จังหวัด" required error={errs.province}>
          <input name="province" type="text" required placeholder="กรุงเทพมหานคร" className="input" />
        </Field>
        <Field label="เขต/อำเภอ">
          <input name="district" type="text" placeholder="ปทุมวัน" className="input" />
        </Field>
      </div>

      <Field label="ที่อยู่">
        <textarea name="address" rows={2} maxLength={500} className="input resize-none" />
      </Field>

      <fieldset className="space-y-3 rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5">
        <legend className="px-1 text-[0.85rem] font-semibold text-[color:var(--color-gold-bright)]">
          ช่องทางติดต่อ (ไม่บังคับ)
        </legend>
        <Field label="LINE Official">
          <input name="line_official" type="text" placeholder="@yourclinic" className="input" />
        </Field>
        <Field label="Facebook URL">
          <input name="facebook_url" type="url" placeholder="https://facebook.com/..." className="input" />
        </Field>
        <Field label="Instagram URL">
          <input name="instagram_url" type="url" placeholder="https://instagram.com/..." className="input" />
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
        {pending ? "กำลังส่งใบสมัคร..." : "ลงทะเบียนคลินิก (รออนุมัติ)"}
      </button>
      <p className="text-center text-[0.78rem] text-[color:var(--color-muted)]">
        Admin จะตรวจสอบเอกสารและอนุมัติภายใน 1-3 วันทำการ
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
