import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Phone } from "lucide-react";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import {
  getClinicByUserId,
  getClinicLeads,
} from "@/lib/queries/clinic-dashboard";
import { LeadStatusControl } from "./lead-status-control";

export const dynamic = "force-dynamic";

export default async function ClinicLeadsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/clinic/leads");

  const clinic = await getClinicByUserId(session.user.id);
  if (!clinic) redirect("/clinic/setup");

  const allLeads = await getClinicLeads(clinic.id, 100);

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <Link
          href="/clinic"
          className="inline-flex items-center gap-1 text-[0.85rem] text-[color:var(--color-muted-strong)] hover:text-[color:var(--color-gold-bright)]"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับ Dashboard
        </Link>

        <h1 className="mt-3 text-[1.7rem] font-extrabold lg:text-[2.2rem]">
          ลูก<span className="text-gold-gradient">ค้า</span>
        </h1>
        <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
          {allLeads.length} เคส · กดเปลี่ยนสถานะที่แต่ละบรรทัด — เมื่อกด <b className="text-[color:var(--color-gold-bright)]">สำเร็จ</b> ระบบจะสร้าง Commission ให้ Sale อัตโนมัติ
        </p>

        {allLeads.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] py-12 text-center text-[0.9rem] text-[color:var(--color-muted)]">
            ยังไม่มีลูกค้า — เมื่อ Sale ส่ง lead เข้ามาจะแสดงที่นี่
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] lg:block">
              <table className="w-full text-left text-[0.88rem]">
                <thead className="border-b border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-elevated)] text-[0.78rem] uppercase tracking-wider text-[color:var(--color-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">ลูกค้า</th>
                    <th className="px-5 py-3 font-medium">เบอร์</th>
                    <th className="px-5 py-3 font-medium">แคมเปญ</th>
                    <th className="px-5 py-3 font-medium">เข้ามาเมื่อ</th>
                    <th className="px-5 py-3 font-medium">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {allLeads.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-[color:var(--color-border-soft)] last:border-0 hover:bg-[color:var(--color-surface-elevated)]/40"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium">{l.customerName}</div>
                        {l.note && (
                          <div className="mt-0.5 max-w-xs truncate text-[0.78rem] text-[color:var(--color-muted)]">
                            “{l.note}”
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <a
                          href={`tel:${l.customerPhone}`}
                          className="inline-flex items-center gap-1 text-[color:var(--color-gold-bright)] hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          {l.customerPhone}
                        </a>
                      </td>
                      <td className="px-5 py-4 text-[color:var(--color-muted-strong)]">
                        {l.campaignTitle ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-[color:var(--color-muted)]">
                        {new Date(l.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <LeadStatusControl leadId={l.id} currentStatus={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="mt-6 space-y-3 lg:hidden">
              {allLeads.map((l) => (
                <li
                  key={l.id}
                  className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">{l.customerName}</div>
                      <a
                        href={`tel:${l.customerPhone}`}
                        className="mt-0.5 inline-flex items-center gap-1 text-[0.82rem] text-[color:var(--color-gold-bright)]"
                      >
                        <Phone className="h-3 w-3" />
                        {l.customerPhone}
                      </a>
                    </div>
                    <div className="shrink-0 text-right text-[0.72rem] text-[color:var(--color-muted)]">
                      {new Date(l.createdAt).toLocaleDateString("th-TH", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <div className="mt-2 text-[0.78rem] text-[color:var(--color-muted-strong)]">
                    {l.campaignTitle ?? "—"}
                  </div>
                  {l.note && (
                    <div className="mt-1 text-[0.78rem] text-[color:var(--color-muted)]">
                      “{l.note}”
                    </div>
                  )}
                  <div className="mt-3 border-t border-[color:var(--color-border-soft)] pt-3">
                    <LeadStatusControl leadId={l.id} currentStatus={l.status} />
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
