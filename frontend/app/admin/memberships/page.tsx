import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { ApproveRejectButtons } from "@/components/admin/action-buttons";
import { getPendingMemberships } from "@/lib/queries/admin";
import { approveMembership, rejectMembership } from "@/lib/actions/admin";
import { formatBaht } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMembershipsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/admin/memberships");
  if (session.user.role !== "admin") redirect("/");

  const pending = await getPendingMemberships();

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <h1 className="text-[1.7rem] font-extrabold lg:text-[2.2rem]">
          คำขอ <span className="text-gold-gradient">Premium</span>
        </h1>
        <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
          {pending.length} คำขอรอตรวจสอบการชำระเงิน
        </p>

        <AdminNav current="/admin/memberships" />

        <section className="mt-6 space-y-3 lg:mt-8">
          {pending.length === 0 ? (
            <p className="rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] py-12 text-center text-[0.9rem] text-[color:var(--color-muted)]">
              ไม่มีคำขอที่รอตรวจสอบ ✓
            </p>
          ) : (
            pending.map((m) => (
              <article
                key={m.membershipId}
                className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <h3 className="text-[1.05rem] font-bold">{m.userName}</h3>
                      <span className="font-display text-[1.4rem] font-bold text-[color:var(--color-gold-bright)]">
                        {formatBaht(Number(m.amount))} ฿
                      </span>
                    </div>
                    <div className="mt-1 text-[0.82rem] text-[color:var(--color-muted-strong)]">
                      {m.userEmail}
                      {m.userPhone && <span> · {m.userPhone}</span>}
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-2 text-[0.85rem] lg:grid-cols-2">
                      <Detail label="แพ็กเกจ">{m.plan === "premium_year" ? "Premium รายปี" : m.plan}</Detail>
                      <Detail label="ช่องทาง">{m.paymentMethod ?? "—"}</Detail>
                      <Detail label="หมายเลขอ้างอิง">
                        <code className="rounded bg-[color:var(--color-surface-elevated)] px-1.5 py-0.5 text-[0.85rem] font-mono">
                          {m.paymentRef ?? "—"}
                        </code>
                      </Detail>
                      <Detail label="จะหมดอายุ">
                        {m.expiresAt.toLocaleDateString("th-TH", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </Detail>
                    </dl>

                    <p className="mt-3 text-[0.74rem] text-[color:var(--color-muted)]">
                      ส่งคำขอเมื่อ {new Date(m.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="lg:shrink-0">
                    <ApproveRejectButtons
                      id={m.membershipId}
                      approveAction={approveMembership}
                      rejectAction={rejectMembership}
                      approveLabel="ยืนยัน Premium"
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        <div className="mt-8 rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-elevated)]/40 p-4 text-[0.82rem] text-[color:var(--color-muted)]">
          💡 <b>วิธีตรวจสอบ</b>: เทียบ <code>หมายเลขอ้างอิง</code> กับ statement ธนาคาร/PromptPay ของแพลตฟอร์ม
          ถ้าตรง → กด "ยืนยัน Premium" Membership จะ active ทันที (1 ปีจากวันยืนยัน)
        </div>
      </div>

      <Footer />
    </main>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.72rem] uppercase tracking-wider text-[color:var(--color-muted)]">{label}</dt>
      <dd className="text-[color:var(--color-foreground)]">{children}</dd>
    </div>
  );
}
