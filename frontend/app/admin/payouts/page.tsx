import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { ApproveRejectButtons } from "@/components/admin/action-buttons";
import { getPendingPayouts } from "@/lib/queries/admin";
import { approvePayout, rejectPayout } from "@/lib/actions/admin";
import { formatBaht } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/admin/payouts");
  if (session.user.role !== "admin") redirect("/");

  const pending = await getPendingPayouts();
  const totalAmount = pending.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <h1 className="text-[1.7rem] font-extrabold lg:text-[2.2rem]">
          คำขอ<span className="text-gold-gradient">ถอนเงิน</span>
        </h1>
        <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
          {pending.length} คำขอ · รวม <b className="text-[color:var(--color-gold-bright)]">{formatBaht(totalAmount)} ฿</b>
        </p>

        <AdminNav current="/admin/payouts" />

        <section className="mt-6 space-y-3 lg:mt-8">
          {pending.length === 0 ? (
            <p className="rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] py-12 text-center text-[0.9rem] text-[color:var(--color-muted)]">
              ไม่มีคำขอถอนเงินที่รอตรวจสอบ ✓
            </p>
          ) : (
            pending.map((p) => (
              <article
                key={p.payoutId}
                className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <h3 className="text-[1.05rem] font-bold">{p.userName}</h3>
                      <span className="font-display text-[1.4rem] font-bold text-[color:var(--color-gold-bright)]">
                        {formatBaht(Number(p.amount))} ฿
                      </span>
                    </div>
                    <div className="mt-1 text-[0.82rem] text-[color:var(--color-muted-strong)]">
                      {p.userEmail}
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-2 text-[0.85rem] lg:grid-cols-2">
                      <Detail label="โอนเข้าบัญชี">
                        {p.bankName ? (
                          <>
                            {p.bankName}<br />
                            <span className="text-[color:var(--color-muted)]">{p.bankAccountNo} · {p.bankAccountName}</span>
                          </>
                        ) : (
                          "—"
                        )}
                      </Detail>
                      <Detail label="PromptPay">{p.promptpay ?? "—"}</Detail>
                      {p.note && <Detail label="หมายเหตุ" full>“{p.note}”</Detail>}
                    </dl>

                    <p className="mt-3 text-[0.74rem] text-[color:var(--color-muted)]">
                      ส่งคำขอเมื่อ {new Date(p.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="lg:shrink-0">
                    <ApproveRejectButtons
                      id={p.payoutId}
                      approveAction={approvePayout}
                      rejectAction={rejectPayout}
                      approveLabel="อนุมัติ (จ่ายแล้ว)"
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}

function Detail({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "lg:col-span-2" : ""}>
      <dt className="text-[0.72rem] uppercase tracking-wider text-[color:var(--color-muted)]">{label}</dt>
      <dd className="text-[color:var(--color-foreground)]">{children}</dd>
    </div>
  );
}
