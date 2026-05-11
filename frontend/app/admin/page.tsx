import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminSummary } from "@/lib/queries/admin";
import { formatBaht } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/admin");
  if (session.user.role !== "admin") redirect("/");

  const summary = await getAdminSummary();
  const hasPending =
    summary.pendingApprovals.sales > 0 ||
    summary.pendingApprovals.clinics > 0 ||
    summary.payoutRequestsPending > 0;

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <div>
          <span className="text-[0.7rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            ADMIN CONSOLE
          </span>
          <h1 className="mt-1 text-[1.7rem] font-extrabold lg:text-[2.2rem]">
            ภาพรวม<span className="text-gold-gradient">ระบบ</span>
          </h1>
        </div>

        <AdminNav current="/admin" />

        {hasPending && (
          <div className="mt-6 rounded-2xl border border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5 p-4 lg:p-5">
            <h2 className="font-semibold text-[color:var(--color-gold-bright)]">
              ⏳ มีงานรอดำเนินการ
            </h2>
            <div className="mt-2 flex flex-wrap gap-2 text-[0.85rem]">
              {summary.pendingApprovals.sales > 0 && (
                <Link
                  href="/admin/sales"
                  className="rounded-full border border-[color:var(--color-gold-deep)] px-3 py-1 text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold-deep)]/20"
                >
                  Sales รอ {summary.pendingApprovals.sales} คน →
                </Link>
              )}
              {summary.pendingApprovals.clinics > 0 && (
                <Link
                  href="/admin/clinics"
                  className="rounded-full border border-[color:var(--color-gold-deep)] px-3 py-1 text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold-deep)]/20"
                >
                  คลินิกรอ {summary.pendingApprovals.clinics} แห่ง →
                </Link>
              )}
              {summary.payoutRequestsPending > 0 && (
                <Link
                  href="/admin/payouts"
                  className="rounded-full border border-[color:var(--color-gold-deep)] px-3 py-1 text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold-deep)]/20"
                >
                  ถอนเงินรอ {summary.payoutRequestsPending} คำขอ →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Users overview */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-5">
          <Stat label="ผู้ใช้ทั้งหมด" value={summary.users.total} />
          <Stat label="Sale"          value={summary.users.sale} />
          <Stat label="คลินิก"        value={summary.users.clinic} />
          <Stat label="Customer"      value={summary.users.customer} />
          <Stat label="Admin"         value={summary.users.admin} />
        </section>

        {/* Lead / commission stats */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:mt-6 lg:grid-cols-4 lg:gap-5">
          <Stat label="ลูกค้าวันนี้" value={summary.leadsToday} accent="gold" />
          <Stat label="ลูกค้าทั้งหมด" value={summary.leadsTotal} />
          <Stat label="ปิดดีลสำเร็จ" value={summary.leadsSuccess} accent="gold" />
          <Stat label="แคมเปญ active" value={summary.campaignsActive} />
        </section>

        <section className="mt-6 grid gap-3 lg:mt-6 lg:grid-cols-2 lg:gap-5">
          <div className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-7">
            <h3 className="text-[0.85rem] text-[color:var(--color-muted)]">ค่าคอมยังไม่จ่าย (รวม)</h3>
            <p className="mt-1 font-display text-[2rem] font-bold text-[color:var(--color-gold-bright)] lg:text-[2.4rem]">
              {formatBaht(summary.commissionsPending)} <span className="text-[1rem]">฿</span>
            </p>
            <p className="mt-1 text-[0.78rem] text-[color:var(--color-muted)]">
              รวม pending + approved + awaiting_payout
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-7">
            <h3 className="text-[0.85rem] text-[color:var(--color-muted)]">ค่าคอมที่จ่ายแล้ว (รวม)</h3>
            <p className="mt-1 font-display text-[2rem] font-bold lg:text-[2.4rem]">
              {formatBaht(summary.commissionsPaid)} <span className="text-[1rem]">฿</span>
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
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
      </div>
    </div>
  );
}
