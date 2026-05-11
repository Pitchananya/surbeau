"use client";

import { useActionState } from "react";
import { applyJob, type ApplyState } from "@/lib/actions/jobs";
import { cn } from "@/lib/utils";

export function ApplyForm({ jobId }: { jobId: string }) {
  const action = applyJob.bind(null, jobId);
  const [state, formAction, pending] = useActionState<ApplyState | null, FormData>(
    action,
    null,
  );

  if (state?.ok) {
    return (
      <div className="rounded-3xl border border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/5 p-7 text-center">
        <div className="text-3xl">🎉</div>
        <h3 className="mt-3 text-[1.15rem] font-bold text-[color:var(--color-gold-bright)]">
          ส่งใบสมัครเรียบร้อย
        </h3>
        <p className="mt-2 text-[0.9rem] text-[color:var(--color-muted-strong)]">
          คลินิกจะติดต่อกลับเมื่อเห็นใบสมัคร — ดูสถานะที่หน้า Dashboard ของคุณ
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-7"
    >
      <h3 className="text-[1.1rem] font-bold lg:text-[1.25rem]">สมัครตำแหน่งนี้</h3>
      <p className="mt-1 text-[0.82rem] text-[color:var(--color-muted)]">
        คลินิกจะเห็นโปรไฟล์ + ใบอนุญาตของคุณ พร้อมข้อความด้านล่าง
      </p>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-[0.78rem] font-medium text-[color:var(--color-muted-strong)]">
          ข้อความถึงคลินิก (Cover Letter)
        </span>
        <textarea
          name="cover_letter"
          rows={6}
          maxLength={2000}
          placeholder="แนะนำตัวสั้นๆ — ทำไมคุณเหมาะกับตำแหน่งนี้, ประสบการณ์ที่ผ่านมา, ความสามารถพิเศษ..."
          className="w-full resize-none rounded-xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-4 py-3 text-[0.92rem] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-gold)] focus:outline-none"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[0.78rem] font-medium text-[color:var(--color-muted-strong)]">
          ลิงก์ Resume / Portfolio (ถ้ามี)
        </span>
        <input
          name="resume_url"
          type="url"
          placeholder="https://drive.google.com/..."
          className="w-full rounded-xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-4 py-3 text-[0.92rem] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-gold)] focus:outline-none"
        />
      </label>

      {state && !state.ok && (
        <p className="mt-4 text-[0.85rem] text-[color:var(--color-hot)]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "mt-5 w-full rounded-full px-5 py-3.5 text-[0.95rem] font-semibold transition-all",
          pending
            ? "bg-[color:var(--color-surface-elevated)] text-[color:var(--color-muted)]"
            : "bg-[color:var(--color-gold)] text-black hover:bg-[color:var(--color-gold-bright)]",
        )}
      >
        {pending ? "กำลังส่ง..." : "ส่งใบสมัคร"}
      </button>
    </form>
  );
}
