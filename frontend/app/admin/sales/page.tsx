import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { ApproveRejectButtons } from "@/components/admin/action-buttons";
import { getPendingSales } from "@/lib/queries/admin";
import { approveSale, rejectSale } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminSalesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/admin/sales");
  if (session.user.role !== "admin") redirect("/");

  const pendingSales = await getPendingSales();

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <h1 className="text-[1.7rem] font-extrabold lg:text-[2.2rem]">
          อนุมัติ<span className="text-gold-gradient">ใบสมัคร Sale</span>
        </h1>
        <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
          {pendingSales.length} ใบสมัครรอตรวจสอบ
        </p>

        <AdminNav current="/admin/sales" />

        <section className="mt-6 space-y-3 lg:mt-8">
          {pendingSales.length === 0 ? (
            <p className="rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] py-12 text-center text-[0.9rem] text-[color:var(--color-muted)]">
              ไม่มีใบสมัครที่รอตรวจสอบ ✓
            </p>
          ) : (
            pendingSales.map((s) => (
              <article
                key={s.saleId}
                className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[1.05rem] font-bold">{s.userName}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 text-[0.82rem] text-[color:var(--color-muted-strong)]">
                      <span>{s.userEmail}</span>
                      {s.userPhone && <span>· {s.userPhone}</span>}
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-2 text-[0.85rem] lg:grid-cols-2">
                      <Detail label="ธนาคาร">
                        {s.bankName ? `${s.bankName} · ${s.bankAccountNo}` : "—"}
                      </Detail>
                      <Detail label="PromptPay">{s.promptpay ?? "—"}</Detail>
                      {s.bio && <Detail label="Bio" full>{s.bio}</Detail>}
                    </dl>

                    <p className="mt-3 text-[0.74rem] text-[color:var(--color-muted)]">
                      สมัครเมื่อ {new Date(s.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="lg:shrink-0">
                    <ApproveRejectButtons
                      id={s.saleId}
                      approveAction={approveSale}
                      rejectAction={rejectSale}
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
