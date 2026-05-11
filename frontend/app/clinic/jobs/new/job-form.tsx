"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createJob, type JobFormState } from "@/lib/actions/jobs";
import { cn } from "@/lib/utils";

export function JobForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<JobFormState | null, FormData>(
    createJob,
    null,
  );
  const errs = state && !state.ok ? state.fields ?? {} : {};

  useEffect(() => {
    if (state?.ok) router.push("/clinic/jobs");
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="ชื่อตำแหน่ง" required error={errs.title}>
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="เช่น พยาบาลฉีดโบท็อกซ์ (Full-time)"
          className="input"
        />
      </Field>

      <Field label="รายละเอียดงาน">
        <textarea
          name="description"
          rows={6}
          maxLength={2000}
          placeholder="หน้าที่ความรับผิดชอบ, คุณสมบัติที่ต้องการ, สวัสดิการ..."
          className="input resize-none"
        />
      </Field>

      <Field label="ประเภทการจ้าง" required error={errs.employment_type}>
        <select name="employment_type" defaultValue="full_time" className="input">
          <option value="full_time">งานประจำ (Full-time)</option>
          <option value="part_time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="freelance">Freelance</option>
          <option value="internship">ฝึกงาน</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="เงินเดือนขั้นต่ำ (บาท/เดือน)" error={errs.salary_min}>
          <input
            name="salary_min"
            type="number"
            inputMode="decimal"
            min="0"
            step="100"
            placeholder="20000"
            className="input"
          />
        </Field>
        <Field label="เงินเดือนสูงสุด" error={errs.salary_max}>
          <input
            name="salary_max"
            type="number"
            inputMode="decimal"
            min="0"
            step="100"
            placeholder="35000"
            className="input"
          />
        </Field>
      </div>

      <Field label="สถานที่ทำงาน (override คลินิก ถ้ามีหลายสาขา)">
        <input
          name="location"
          type="text"
          placeholder="เช่น สาขาสยาม / สำนักงานใหญ่"
          className="input"
        />
      </Field>

      <label className="flex items-center gap-2 text-[0.88rem]">
        <input name="is_remote" type="checkbox" className="h-4 w-4 accent-[color:var(--color-gold)]" />
        <span>ทำงานทางไกล (Remote)</span>
      </label>

      <Field label="ทักษะที่ต้องการ (คั่นด้วย ,)" hint='เช่น "rn, injector, laser"'>
        <input
          name="required_skills"
          type="text"
          placeholder="rn, injector, laser"
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
          {pending ? "กำลังลงประกาศ..." : "ลงประกาศ"}
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
