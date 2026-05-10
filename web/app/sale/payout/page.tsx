import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { getSaleSummary, getSalePayoutHistory } from "@/lib/queries/sale";
import { formatBaht } from "@/lib/utils";
import { PayoutButton } from "./payout-button";

export const dynamic = "force-dynamic";

export default async function SalePayoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/sale/payout");

  const summary = await getSaleSummary(session.user.id);
  if (!summary) redirect("/sale/setup");
  if (summary.status !== "approved") redirect("/sale");

  const history = await getSalePayoutHistory(summary.saleId, 20);

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-4xl lg:px-8 lg:py-12">
        <Link href="/sale" className="inline-flex items-center gap-1 text-[0.85rem] text-[color:var(--color-muted-strong)] hover:text-[color:var(--color-gold-bright)]">
          <ChevronLeft className="h-4 w-4" />
          กลับ Dashboard
        </Link>

        <h1 className="mt-3 text-[1.7rem] font-extrabold lg:text-[2.2rem]">
          ขอถอน<span className="text-gold-gradient">ค่าคอม</span>
        </h1>
        <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
          ระบบจะโอนเข้าบัญชีที่บันทึกไว้ในโปรไฟล์ภายใน 1-3 วันทำการหลัง Admin อนุมัติ
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <PayoutButton
              approvedAmount={summary.commissions.approved}
              hasPending={!!summary.pendingPayout}
            />
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-[1.05rem] font-bold lg:text-[1.2rem]">ประวัติคำขอ</h2>
            {history.length === 0 ? (
              <p className="mt-3 text-[0.88rem] text-[color:var(--color-muted)]">
                ยังไม่มีประวัติ
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {history.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="font-display text-[1.05rem] font-bold text-[color:var(--color-gold-bright)]">
                        {formatBaht(Number(p.amount))} ฿
                      </div>
                      <div className="text-[0.76rem] text-[color:var(--color-muted)]">
                        {new Date(p.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                        {p.bankName ? ` · ${p.bankName}` : p.promptpay ? " · PromptPay" : ""}
                      </div>
                    </div>
                    <PayoutBadge status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function PayoutBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const map = {
    pending:  { label: "รออนุมัติ", color: "border-[color:var(--color-gold-deep)] text-[color:var(--color-gold-bright)] bg-[color:var(--color-gold)]/5" },
    approved: { label: "จ่ายแล้ว",   color: "border-[color:var(--color-gold)] text-[color:var(--color-gold-bright)] bg-[color:var(--color-gold)]/10" },
    rejected: { label: "ไม่อนุมัติ", color: "border-[color:var(--color-hot)]/40 text-[color:var(--color-hot)] bg-[color:var(--color-hot-soft)]" },
  };
  const s = map[status];
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.72rem] font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}
