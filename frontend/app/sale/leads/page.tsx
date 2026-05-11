import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Phone } from "lucide-react";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { getSaleSummary, getSaleLeads } from "@/lib/queries/sale";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

export default async function SaleLeadsPage(props: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/sale/leads");

  const summary = await getSaleSummary(session.user.id);
  if (!summary) redirect("/sale/setup");

  const { status } = await props.searchParams;
  const allLeads = await getSaleLeads(summary.saleId, 100);
  const filtered = status && ["new", "contacted", "success", "failed"].includes(status)
    ? allLeads.filter((l) => l.status === status)
    : allLeads;

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <Link
          href="/sale"
          className="inline-flex items-center gap-1 text-[0.85rem] text-[color:var(--color-muted-strong)] hover:text-[color:var(--color-gold-bright)]"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับ Dashboard
        </Link>

        <h1 className="mt-3 text-[1.7rem] font-extrabold lg:text-[2.2rem]">
          ลูก<span className="text-gold-gradient">ค้าทั้งหมด</span>
        </h1>
        <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
          {filtered.length} เคส{status ? ` (กรอง: ${labelOf(status)})` : ""}
        </p>

        {/* Filter chips */}
        <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:overflow-visible lg:px-0">
          <FilterChip current={status} value="" label={`ทั้งหมด (${summary.leads.total})`} />
          <FilterChip current={status} value="new" label={`ใหม่ (${summary.leads.new})`} />
          <FilterChip current={status} value="contacted" label={`ติดต่อแล้ว (${summary.leads.contacted})`} tone="info" />
          <FilterChip current={status} value="success" label={`สำเร็จ (${summary.leads.success})`} tone="gold" />
          <FilterChip current={status} value="failed" label={`ไม่สำเร็จ (${summary.leads.failed})`} tone="hot" />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] py-12 text-center text-[0.9rem] text-[color:var(--color-muted)]">
            ไม่พบลูกค้าตามตัวกรองนี้
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] lg:block">
              <table className="w-full text-left text-[0.88rem]">
                <thead className="border-b border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-elevated)] text-[0.72rem] uppercase tracking-wider text-[color:var(--color-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">ลูกค้า</th>
                    <th className="px-5 py-3 font-medium">เบอร์</th>
                    <th className="px-5 py-3 font-medium">แคมเปญ</th>
                    <th className="px-5 py-3 font-medium">เข้ามาเมื่อ</th>
                    <th className="px-5 py-3 font-medium">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-b border-[color:var(--color-border-soft)] last:border-0">
                      <td className="px-5 py-3 font-medium">{l.customerName}</td>
                      <td className="px-5 py-3">
                        <a href={`tel:${l.customerPhone}`} className="inline-flex items-center gap-1 text-[color:var(--color-gold-bright)] hover:underline">
                          <Phone className="h-3 w-3" />
                          {l.customerPhone}
                        </a>
                      </td>
                      <td className="px-5 py-3 text-[color:var(--color-muted-strong)]">{l.campaignTitle ?? "—"}</td>
                      <td className="px-5 py-3 text-[color:var(--color-muted)]">
                        {new Date(l.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="mt-6 space-y-3 lg:hidden">
              {filtered.map((l) => (
                <li key={l.id} className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">{l.customerName}</div>
                      <a href={`tel:${l.customerPhone}`} className="mt-0.5 inline-flex items-center gap-1 text-[0.82rem] text-[color:var(--color-gold-bright)]">
                        <Phone className="h-3 w-3" />
                        {l.customerPhone}
                      </a>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                  <div className="mt-2 text-[0.78rem] text-[color:var(--color-muted-strong)]">
                    {l.campaignTitle ?? "—"} · {new Date(l.createdAt).toLocaleDateString("th-TH", { month: "short", day: "numeric" })}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}

function FilterChip({
  current,
  value,
  label,
  tone,
}: {
  current: string | undefined;
  value: string;
  label: string;
  tone?: "info" | "gold" | "hot";
}) {
  const isActive = (current ?? "") === value;
  const href = value ? `/sale/leads?status=${value}` : "/sale/leads";

  const activeStyles =
    tone === "gold" ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]"
    : tone === "info" ? "border-[color:var(--color-verified)] bg-[color:var(--color-verified-soft)] text-[color:var(--color-verified)]"
    : tone === "hot" ? "border-[color:var(--color-hot)]/40 bg-[color:var(--color-hot-soft)] text-[color:var(--color-hot)]"
    : "border-[color:var(--color-foreground)] bg-[color:var(--color-surface-elevated)] text-[color:var(--color-foreground)]";

  return (
    <a
      href={href}
      className={`shrink-0 rounded-full border px-3 py-1 text-[0.78rem] font-medium transition-colors ${
        isActive
          ? activeStyles
          : "border-[color:var(--color-border-default)] text-[color:var(--color-muted-strong)] hover:border-[color:var(--color-gold-muted)]"
      }`}
    >
      {label}
    </a>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    new:       { label: "ใหม่",        color: "border-[color:var(--color-border-default)] text-[color:var(--color-muted-strong)]" },
    contacted: { label: "ติดต่อแล้ว",  color: "border-[color:var(--color-verified)] text-[color:var(--color-verified)]" },
    success:   { label: "สำเร็จ",      color: "border-[color:var(--color-gold)] text-[color:var(--color-gold-bright)]" },
    failed:    { label: "ไม่สำเร็จ",   color: "border-[color:var(--color-hot)]/40 text-[color:var(--color-hot)]" },
  };
  const s = map[status] ?? map.new;
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}

function labelOf(s: string): string {
  const map: Record<string, string> = { new: "ใหม่", contacted: "ติดต่อแล้ว", success: "สำเร็จ", failed: "ไม่สำเร็จ" };
  return map[s] ?? s;
}
