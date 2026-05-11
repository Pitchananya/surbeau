import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import {
  getClinicSummary,
  getClinicLeads,
} from "@/lib/queries/clinic-dashboard";
import { formatBaht } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClinicDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/clinic");

  const summary = await getClinicSummary(session.user.id);
  if (!summary) redirect("/clinic/setup");

  const recentLeads = await getClinicLeads(summary.clinicId, 5);
  const isApproved = summary.status === "approved";

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <div className="mb-6 lg:mb-10 lg:flex lg:items-end lg:justify-between">
          <div>
            <span className="text-[0.7rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
              CLINIC DASHBOARD
            </span>
            <h1 className="mt-1 text-[1.7rem] font-extrabold lg:text-[2.2rem]">
              <span className="text-gold-gradient">{summary.clinicName}</span>
            </h1>
            <div className="mt-2 flex items-center gap-2 text-[0.85rem] text-[color:var(--color-muted)]">
              <TierChip tier={summary.tier} />
              <span>·</span>
              <StatusChip status={summary.status} />
            </div>
          </div>

          {isApproved && (
            <div className="mt-4 lg:mt-0">
              <Link
                href="/clinic/campaigns/new"
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-gold)] px-5 py-2.5 text-[0.88rem] font-semibold text-black transition-colors hover:bg-[color:var(--color-gold-bright)]"
              >
                <Plus className="h-4 w-4" />
                สร้างแคมเปญ
              </Link>
            </div>
          )}
        </div>

        {!isApproved && (
          <div className="mb-6 rounded-2xl border border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5 p-4 lg:p-5">
            <div className="flex items-start gap-3">
              <span className="text-xl">⏳</span>
              <div>
                <h3 className="font-semibold text-[color:var(--color-gold-bright)]">
                  คลินิกของคุณกำลังรอการอนุมัติ
                </h3>
                <p className="mt-1 text-[0.85rem] text-[color:var(--color-muted-strong)]">
                  ทีมแอดมินจะตรวจสอบใบอนุญาตและรายละเอียดภายใน 1-3 วันทำการ — สามารถเตรียมรายละเอียดแคมเปญไว้ระหว่างรอได้ แต่ยังเผยแพร่ไม่ได้
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KPI tiles */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-5">
          <Stat label="แคมเปญทั้งหมด" value={summary.campaigns.total} sub={`${summary.campaigns.active} active`} />
          <Stat label="ลูกค้าทั้งหมด" value={summary.leads.total} />
          <Stat label="ปิดดีลสำเร็จ" value={summary.leads.success} accent="gold" />
          <Stat label="Conversion" value={`${summary.conversionRate}%`} accent={summary.conversionRate >= 20 ? "gold" : undefined} />
          <Stat label="ค่าคอมรวม" value={formatBaht(summary.commissionTotalDue)} unit="฿" />
        </section>

        {/* Lead status breakdown */}
        <section className="mt-6 rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:mt-10 lg:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-[1.05rem] font-bold lg:text-[1.2rem]">สถานะลูกค้า</h2>
            <Link href="/clinic/leads" className="text-[0.82rem] text-[color:var(--color-gold-bright)] hover:underline">
              จัดการทั้งหมด →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[0.78rem]">
            <Pill label="ใหม่"        value={summary.leads.new}       tone="default" />
            <Pill label="ติดต่อแล้ว"  value={summary.leads.contacted} tone="info" />
            <Pill label="สำเร็จ"      value={summary.leads.success}   tone="gold" />
            <Pill label="ไม่สำเร็จ"   value={summary.leads.failed}    tone="muted" />
          </div>
        </section>

        {/* Recent leads */}
        <section className="mt-6 rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:mt-6 lg:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-[1.05rem] font-bold lg:text-[1.2rem]">ลูกค้าล่าสุด</h2>
            <Link href="/clinic/leads" className="text-[0.82rem] text-[color:var(--color-gold-bright)] hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="mt-3 text-[0.88rem] text-[color:var(--color-muted)]">
              ยังไม่มีลูกค้า — สร้างแคมเปญเพื่อเริ่มรับลูกค้าจาก Sale
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-[color:var(--color-border-soft)]">
              {recentLeads.map((l) => (
                <li key={l.id} className="flex items-center justify-between py-3 text-[0.88rem]">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{l.customerName}</div>
                    <div className="truncate text-[0.76rem] text-[color:var(--color-muted)]">
                      {l.campaignTitle ?? "—"} · {l.customerPhone}
                    </div>
                  </div>
                  <LeadStatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Shortcuts */}
        <section className="mt-6 grid gap-3 lg:mt-6 lg:grid-cols-2 lg:gap-5">
          <Link
            href="/clinic/campaigns"
            className="block rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 transition-colors hover:border-[color:var(--color-gold-muted)] lg:p-7"
          >
            <h3 className="font-bold lg:text-[1.1rem]">จัดการแคมเปญ</h3>
            <p className="mt-1 text-[0.85rem] text-[color:var(--color-muted)]">
              เพิ่ม / ปิด / แก้ราคา / ดูสถิติ
            </p>
          </Link>

          <Link
            href="/clinic/leads"
            className="block rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 transition-colors hover:border-[color:var(--color-gold-muted)] lg:p-7"
          >
            <h3 className="font-bold lg:text-[1.1rem]">รายชื่อลูกค้า</h3>
            <p className="mt-1 text-[0.85rem] text-[color:var(--color-muted)]">
              อัปเดตสถานะ / ติดต่อกลับ / ปิดเคส
            </p>
          </Link>
        </section>
      </div>

      <Footer />
    </main>
  );
}

function Stat({
  label,
  value,
  unit,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  unit?: string;
  sub?: string;
  accent?: "gold";
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-4 lg:p-5">
      <div className="text-[0.74rem] text-[color:var(--color-muted)] lg:text-[0.82rem]">{label}</div>
      <div
        className={`mt-1.5 font-display text-[1.35rem] font-bold lg:text-[1.6rem] ${
          accent === "gold" ? "text-[color:var(--color-gold-bright)]" : "text-[color:var(--color-foreground)]"
        }`}
      >
        {value}
        {unit && <span className="ml-1 text-[0.85rem] font-medium text-[color:var(--color-muted)]">{unit}</span>}
      </div>
      {sub && <div className="mt-0.5 text-[0.7rem] text-[color:var(--color-muted)]">{sub}</div>}
    </div>
  );
}

function Pill({ label, value, tone }: { label: string; value: number; tone: "default" | "info" | "gold" | "muted" }) {
  const styles =
    tone === "gold"
      ? "border-[color:var(--color-gold)] text-[color:var(--color-gold-bright)] bg-[color:var(--color-gold)]/5"
      : tone === "info"
      ? "border-[color:var(--color-verified)] text-[color:var(--color-verified)] bg-[color:var(--color-verified-soft)]"
      : tone === "muted"
      ? "border-[color:var(--color-border-default)] text-[color:var(--color-muted)] bg-transparent"
      : "border-[color:var(--color-border-default)] text-[color:var(--color-foreground)] bg-[color:var(--color-surface-elevated)]";
  return (
    <div className={`rounded-xl border px-2 py-3 ${styles}`}>
      <div className="text-[1.15rem] font-bold">{value}</div>
      <div className="mt-0.5 text-[0.7rem]">{label}</div>
    </div>
  );
}

function TierChip({ tier }: { tier: "free" | "verified" | "premier" }) {
  const map = {
    premier:  { label: "★ Premier",  color: "border-[color:var(--color-gold)] text-[color:var(--color-gold-bright)]" },
    verified: { label: "✓ Verified", color: "border-[color:var(--color-verified)] text-[color:var(--color-verified)]" },
    free:     { label: "Free",       color: "border-[color:var(--color-border-default)] text-[color:var(--color-muted-strong)]" },
  };
  const s = map[tier];
  return <span className={`rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium ${s.color}`}>{s.label}</span>;
}

function StatusChip({ status }: { status: "pending" | "approved" | "rejected" | "blocked" }) {
  const map = {
    pending:  { label: "รออนุมัติ", color: "text-[color:var(--color-gold-bright)]" },
    approved: { label: "อนุมัติแล้ว", color: "text-[color:var(--color-verified)]" },
    rejected: { label: "ไม่ผ่าน",     color: "text-[color:var(--color-hot)]" },
    blocked:  { label: "ระงับ",       color: "text-[color:var(--color-hot)]" },
  };
  const s = map[status];
  return <span className={`text-[0.78rem] font-medium ${s.color}`}>{s.label}</span>;
}

function LeadStatusBadge({ status }: { status: string }) {
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
