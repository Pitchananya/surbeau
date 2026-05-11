"use client";

import { useState } from "react";
import { Check, Copy, Link as LinkIcon } from "lucide-react";
import { formatBaht } from "@/lib/utils";

type Campaign = {
  campaignId: string;
  clinicId: string;
  title: string;
  clinicName: string;
  promoPrice: string | null;
  commissionPerSuccess: string;
};

export function ReferralLinks({
  saleId,
  campaigns,
}: {
  saleId: string;
  campaigns: Campaign[];
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (campaigns.length === 0) {
    return (
      <p className="text-[0.85rem] text-[color:var(--color-muted)]">
        ยังไม่มีแคมเปญที่เปิดอยู่ในระบบ
      </p>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const copy = async (campaignId: string, clinicId: string) => {
    const link = `${baseUrl}/clinics/${clinicId}?ref=${saleId}&campaign=${campaignId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(campaignId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedId(campaignId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <ul className="space-y-2">
      {campaigns.map((c) => {
        const isCopied = copiedId === c.campaignId;
        return (
          <li
            key={c.campaignId}
            className="flex items-start justify-between gap-3 rounded-xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] p-3"
          >
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-[0.92rem] font-semibold">{c.title}</h4>
              <p className="truncate text-[0.78rem] text-[color:var(--color-muted)]">
                {c.clinicName}
                {c.promoPrice && <> · {formatBaht(Number(c.promoPrice))} ฿</>}
                {" · "}
                <span className="text-[color:var(--color-gold-bright)]">
                  คอม {formatBaht(Number(c.commissionPerSuccess))} ฿/เคส
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => copy(c.campaignId, c.clinicId)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.78rem] font-medium transition-colors ${
                isCopied
                  ? "bg-[color:var(--color-gold)] text-black"
                  : "border border-[color:var(--color-gold-deep)] bg-transparent text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold)]/10"
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied
                </>
              ) : (
                <>
                  <LinkIcon className="h-3.5 w-3.5" /> Copy link
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch {}
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-gold-deep)] px-3 py-1.5 text-[0.78rem] font-medium text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold)]/10"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}
