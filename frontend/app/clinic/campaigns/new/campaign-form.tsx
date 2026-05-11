"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCampaign, type CampaignFormState } from "@/lib/actions/clinic";
import { cn } from "@/lib/utils";

export function CampaignForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<CampaignFormState | null, FormData>(
    createCampaign,
    null,
  );
  const errs = state && !state.ok ? state.fields ?? {} : {};

  useEffect(() => {
    if (state?.ok) {
      router.push("/clinic/campaigns");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="ชื่อแคมเปญ" required error={errs.title}>
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="เช่น โบท็อกซ์หน้าผาก ลด 50%"
          className="input"
        />
      </Field>

      <Field label="รายละเอียด">
        <textarea
          name="description"
          rows={4}
          maxLength={1000}
          placeholder="อธิบายโปรโมชัน เงื่อนไข ระยะเวลา..."
          className="input resize-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="ราคาปกติ (บาท)" error={errs.normal_price}>
          <input
            name="normal_price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="9990"
            className="input"
          />
        </Field>
        <Field label="ราคาโปร (บาท)" error={errs.promo_price}>
          <input
            name="promo_price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="4990"
            className="input"
          />
        </Field>
      </div>

      <Field
        label="ค่าคอมต่อเคสที่ปิดสำเร็จ (บาท)"
        required
        error={errs.commission_per_success}
        hint="Sale จะได้รับค่าคอมตามนี้เมื่อคุณ mark lead เป็น success"
      >
        <input
          name="commission_per_success"
          type="number"
          inputMode="decimal"
          required
          min="0"
          step="0.01"
          placeholder="500"
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="วันที่เริ่ม">
          <input name="start_date" type="date" className="input" />
        </Field>
        <Field label="วันที่สิ้นสุด">
          <input name="end_date" type="date" className="input" />
        </Field>
      </div>

      <Field label="จำกัดจำนวนเคส (ถ้ามี)" error={errs.max_slots}>
        <input
          name="max_slots"
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          placeholder="เว้นว่าง = ไม่จำกัด"
          className="input"
        />
      </Field>

      {state && !state.ok && (
        <p className="text-[0.85rem] text-[color:var(--color-hot)]">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-[color:var(--color-border-default)] px-5 py-3 text-[0.92rem] font-medium text-[color:var(--color-muted-strong)] hover:border-[color:var(--color-gold-muted)]"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "flex-1 rounded-full px-5 py-3 text-[0.95rem] font-semibold transition-all",
            pending
              ? "bg-[color:var(--color-surface-elevated)] text-[color:var(--color-muted)]"
              : "bg-[color:var(--color-gold)] text-black hover:bg-[color:var(--color-gold-bright)]",
          )}
        >
          {pending ? "กำลังบันทึก..." : "สร้างแคมเปญ"}
        </button>
      </div>

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
