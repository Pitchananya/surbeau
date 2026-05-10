"use client";

import { useActionState, useState } from "react";
import { createLead, type LeadFormState } from "@/lib/actions/lead";
import { cn, formatBaht } from "@/lib/utils";

type Campaign = {
  id: string;
  title: string;
  promoPrice: string | null;
};

export function LeadForm({
  campaigns,
  saleId,
  defaultCampaignId,
}: {
  campaigns: Campaign[];
  saleId: string | null;
  defaultCampaignId: string | null;
}) {
  const [state, formAction, pending] = useActionState<LeadFormState | null, FormData>(
    createLead,
    null,
  );
  const [selected, setSelected] = useState(defaultCampaignId ?? campaigns[0]?.id ?? "");

  if (state?.ok) {
    return (
      <div className="rounded-3xl border border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/5 p-7 text-center">
        <div className="text-3xl">✨</div>
        <h3 className="mt-3 text-[1.15rem] font-bold text-[color:var(--color-gold-bright)]">
          ส่งข้อมูลสำเร็จ
        </h3>
        <p className="mt-2 text-[0.9rem] text-[color:var(--color-muted-strong)]">
          คลินิกจะติดต่อกลับภายใน 24 ชั่วโมง
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-7"
    >
      <h3 className="text-[1.1rem] font-bold lg:text-[1.25rem]">
        ลงทะเบียนรับสิทธิ์
      </h3>
      <p className="mt-1 text-[0.82rem] text-[color:var(--color-muted)]">
        คลินิกจะติดต่อกลับเพื่อยืนยันโปรโมชัน
      </p>

      {!saleId && (
        <div className="mt-4 rounded-xl border border-[color:var(--color-hot)]/40 bg-[color:var(--color-hot-soft)] p-3 text-[0.82rem] text-[color:var(--color-hot)]">
          กรุณาเข้าผ่านลิงก์ Sale ที่แนะนำคุณ — ฟอร์มนี้จะใช้งานได้เมื่อ URL มี <code className="font-mono">?ref=</code>
        </div>
      )}

      <input type="hidden" name="sale_id" value={saleId ?? ""} />

      <div className="mt-5 space-y-4">
        <Field label="แคมเปญที่สนใจ" error={state?.fields?.campaign_id}>
          <select
            name="campaign_id"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-4 py-3 text-[0.92rem] focus:border-[color:var(--color-gold)] focus:outline-none"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
                {c.promoPrice ? ` — ${formatBaht(Number(c.promoPrice))} ฿` : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="ชื่อ-นามสกุล" error={state?.fields?.customer_name}>
          <input
            name="customer_name"
            type="text"
            required
            placeholder="คุณ..."
            className="w-full rounded-xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-4 py-3 text-[0.92rem] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-gold)] focus:outline-none"
          />
        </Field>

        <Field label="เบอร์โทร" error={state?.fields?.customer_phone}>
          <input
            name="customer_phone"
            type="tel"
            required
            inputMode="tel"
            placeholder="08x-xxx-xxxx"
            className="w-full rounded-xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-4 py-3 text-[0.92rem] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-gold)] focus:outline-none"
          />
        </Field>

        <Field label="ข้อความเพิ่มเติม (ไม่บังคับ)">
          <textarea
            name="note"
            rows={3}
            maxLength={500}
            placeholder="เช่น สะดวกให้ติดต่อกลับช่วงไหน"
            className="w-full resize-none rounded-xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-4 py-3 text-[0.92rem] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-gold)] focus:outline-none"
          />
        </Field>
      </div>

      {state && !state.ok && (
        <p className="mt-4 text-[0.82rem] text-[color:var(--color-hot)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !saleId}
        className={cn(
          "mt-5 w-full rounded-full px-5 py-3.5 text-[0.95rem] font-semibold transition-all",
          pending || !saleId
            ? "bg-[color:var(--color-surface-elevated)] text-[color:var(--color-muted)]"
            : "bg-[color:var(--color-gold)] text-black hover:bg-[color:var(--color-gold-bright)]",
        )}
      >
        {pending ? "กำลังส่ง..." : "ส่งข้อมูล รับติดต่อกลับ"}
      </button>

      <p className="mt-3 text-center text-[0.72rem] text-[color:var(--color-muted)]">
        ฟรี ไม่มีค่าใช้จ่าย • ข้อมูลของคุณถูกเก็บรักษาตามนโยบายความเป็นส่วนตัว
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.78rem] font-medium text-[color:var(--color-muted-strong)]">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-[0.75rem] text-[color:var(--color-hot)]">
          {error}
        </span>
      )}
    </label>
  );
}
