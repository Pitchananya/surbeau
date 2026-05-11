import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  ApproveRejectButtons,
  TierSelect,
} from "@/components/admin/action-buttons";
import {
  getPendingClinics,
  getApprovedClinics,
} from "@/lib/queries/admin";
import { approveClinic, rejectClinic, setClinicTier } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminClinicsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/admin/clinics");
  if (session.user.role !== "admin") redirect("/");

  const [pending, approved] = await Promise.all([
    getPendingClinics(),
    getApprovedClinics(),
  ]);

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <h1 className="text-[1.7rem] font-extrabold lg:text-[2.2rem]">
          จัดการ<span className="text-gold-gradient">คลินิก</span>
        </h1>

        <AdminNav current="/admin/clinics" />

        {/* Pending */}
        <section className="mt-6 lg:mt-8">
          <h2 className="text-[1.15rem] font-bold lg:text-[1.3rem]">
            รออนุมัติ <span className="text-[color:var(--color-muted)]">({pending.length})</span>
          </h2>

          <div className="mt-3 space-y-3">
            {pending.length === 0 ? (
              <p className="rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] py-8 text-center text-[0.88rem] text-[color:var(--color-muted)]">
                ไม่มีคลินิกที่รออนุมัติ ✓
              </p>
            ) : (
              pending.map((c) => (
                <article
                  key={c.clinicId}
                  className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[1.05rem] font-bold">{c.clinicName}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 text-[0.82rem] text-[color:var(--color-muted-strong)]">
                        <span>{c.userEmail}</span>
                        {c.phone && <span>· {c.phone}</span>}
                      </div>
                      <dl className="mt-4 grid grid-cols-1 gap-2 text-[0.85rem] lg:grid-cols-2">
                        <Detail label="ที่อยู่">{[c.district, c.province].filter(Boolean).join(", ") || "—"}</Detail>
                        <Detail label="เลขใบอนุญาต">{c.licenseNo || "—"}</Detail>
                        <Detail label="LINE Official">{c.lineOfficial || "—"}</Detail>
                      </dl>
                      <p className="mt-3 text-[0.74rem] text-[color:var(--color-muted)]">
                        สมัครเมื่อ {new Date(c.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="lg:shrink-0">
                      <ApproveRejectButtons
                        id={c.clinicId}
                        approveAction={approveClinic}
                        rejectAction={rejectClinic}
                      />
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Approved — tier management */}
        <section className="mt-10">
          <h2 className="text-[1.15rem] font-bold lg:text-[1.3rem]">
            คลินิกที่อนุมัติแล้ว <span className="text-[color:var(--color-muted)]">({approved.length})</span>
          </h2>
          <p className="mt-1 text-[0.82rem] text-[color:var(--color-muted)]">
            ปรับ tier เพื่อจัดอันดับการแสดงผลในหน้าค้นหา
          </p>

          <div className="mt-3 overflow-hidden rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)]">
            <table className="w-full text-left text-[0.88rem]">
              <thead className="border-b border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-elevated)] text-[0.72rem] uppercase tracking-wider text-[color:var(--color-muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">ชื่อคลินิก</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">จังหวัด</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">★ Rating</th>
                  <th className="px-5 py-3 font-medium">Tier</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((c) => (
                  <tr key={c.clinicId} className="border-b border-[color:var(--color-border-soft)] last:border-0">
                    <td className="px-5 py-3 font-medium">{c.clinicName}</td>
                    <td className="hidden px-5 py-3 text-[color:var(--color-muted-strong)] md:table-cell">{c.province ?? "—"}</td>
                    <td className="hidden px-5 py-3 text-[color:var(--color-muted-strong)] md:table-cell">
                      {Number(c.ratingAvg).toFixed(1)} ({c.ratingCount})
                    </td>
                    <td className="px-5 py-3">
                      <TierSelect clinicId={c.clinicId} currentTier={c.tier} setTier={setClinicTier} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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
