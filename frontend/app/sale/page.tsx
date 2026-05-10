import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { getSaleSummary, getSaleLeads } from "@/lib/queries/sale";
import { formatBaht } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SaleDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/sale");

  const summary = await getSaleSummary(session.user.id);
  if (!summary) redirect("/sale/setup");

  const recentLeads = await getSaleLeads(summary.saleId, 5);
  const isApproved = summary.status === "approved";

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <div className="mb-6 lg:mb-10">
          <span className="text-[0.7rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            SALE DASHBOARD
          </span>
          <h1 className="mt-1 text-[1.7rem] font-extrabold lg:text-[2.2rem]">
            สวัสดี, <span className="text-gold-gradient">{session.user.name}</span>
          </h1>
        </div>

        {!isApproved && (
          <div className="mb-6 rounded-2xl border border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5 p-4 lg:p-5">
            <div className="flex items-start gap-3">
              <span className="text-xl">⏳</span>
              <div>
                <h3 className="font-semibold text-[color:var(--color-gold-bright)]">
                  ใบสมัครของคุณกำลังรอการอนุมัติ
                </h3>
                <p className="mt-1 text-[0.85rem] text-[color:var(--color-muted-strong)]">
                  ทีมแอดมินจะตรวจสอบใบสมัครและอนุมัติภายใน 1-2 วันทำการ — สามารถเตรียมข้อมูลโปรไฟล์ระหว่างรอได้
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KPI cards */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          <Stat label="ลูกค้าทั้งหมด" value={summary.leads.total} />
          <Stat label="ปิดดีลสำเร็จ" value={summary.leads.success} accent="gold" />
          <Stat
            label="ค่าคอมรอจ่าย"
            value={formatBaht(summary.commissions.approved)}
            unit="฿"
            accent="gold"
          />
          <Stat
            label="ค่าคอมจ่ายแล้ว"
            value={formatBaht(summary.commissions.paid)}
            unit="฿"
          />
        </section>

        {/* Lead status breakdown */}
        <section className="mt-6 rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:mt-10 lg:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-[1.05rem] font-bold lg:text-[1.2rem]">สถานะลูกค้า</h2>
            <Link href="/sale/leads" className="text-[0.82rem] text-[color:var(--color-gold-bright)] hover:underline">
              ดูทั้งหมด →
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
          <h2 className="text-[1.05rem] font-bold lg:text-[1.2rem]">ลูกค้าล่าสุด</h2>
          {recentLeads.length === 0 ? (
            <p className="mt-3 text-[0.88rem] text-[color:var(--color-muted)]">
              ยังไม่มีลูกค้า — แชร์ลิงก์แคมเปญของคุณเพื่อเริ่มหารายได้
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
                  <LeadStatus status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Payout */}
        <section className="mt-6 grid gap-3 lg:mt-6 lg:grid-cols-2 lg:gap-5">
          <Link
            href="/sale/payout"
            className="block rounded-2xl border border-[color:var(--color-gold-deep)] bg-gradient-to-br from-[color:var(--color-gold)]/10 to-transparent p-5 transition-colors hover:border-[color:var(--color-gold)] lg:p-7"
          >
            <h3 className="font-bold text-[color:var(--color-gold-bright)] lg:text-[1.1rem]">
              ขอถอนเงิน
            </h3>
            <p className="mt-1 text-[0.85rem] text-[color:var(--color-muted-strong)]">
              ยอดที่ถอนได้: <b className="text-[color:var(--color-foreground)]">{formatBaht(summary.commissions.approved)} ฿</b>
            </p>
            {summary.pendingPayout && (
              <p className="mt-2 text-[0.78rem] text-[color:var(--color-muted)]">
                ⏳ มีคำขอที่รออนุมัติอยู่ ({formatBaht(summary.pendingPayout.amount)} ฿)
              </p>
            )}
          </Link>

          <Link
            href="/sale/profile"
            className="block rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 transition-colors hover:border-[color:var(--color-gold-muted)] lg:p-7"
          >
            <h3 className="font-bold lg:text-[1.1rem]">โปรไฟล์ &amp; บัญชีรับเงิน</h3>
            <p className="mt-1 text-[0.85rem] text-[color:var(--color-muted)]">
              อัปเดตข้อมูลบัญชี / PromptPay
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
  accent,
}: {
  label: string;
  value: number | string;
  unit?: string;
  accent?: "gold";
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-4 lg:p-5">
      <div className="text-[0.74rem] text-[color:var(--color-muted)] lg:text-[0.82rem]">{label}</div>
      <div
        className={`mt-1.5 font-display text-[1.4rem] font-bold lg:text-[1.75rem] ${
          accent === "gold" ? "text-[color:var(--color-gold-bright)]" : "text-[color:var(--color-foreground)]"
        }`}
      >
        {value}
        {unit && <span className="ml-1 text-[0.85rem] font-medium text-[color:var(--color-muted)]">{unit}</span>}
      </div>
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

function LeadStatus({ status }: { status: string }) {
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
