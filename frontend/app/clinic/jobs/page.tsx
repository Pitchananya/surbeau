import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Plus, Users } from "lucide-react";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { getClinicByUserId } from "@/lib/queries/clinic-dashboard";
import { getClinicJobs } from "@/lib/queries/jobs";
import { formatBaht } from "@/lib/utils";
import { ToggleJobButton } from "./toggle-button";

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "งานประจำ",
  part_time: "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "ฝึกงาน",
};

export const dynamic = "force-dynamic";

export default async function ClinicJobsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/clinic/jobs");

  const clinic = await getClinicByUserId(session.user.id);
  if (!clinic) redirect("/clinic/setup");

  const jobs = await getClinicJobs(clinic.id);
  const canCreate = clinic.status === "approved";

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

        <div className="mt-3 flex items-end justify-between">
          <div>
            <h1 className="text-[1.7rem] font-extrabold lg:text-[2.2rem]">
              ตำแหน่ง<span className="text-gold-gradient">รับสมัคร</span>
            </h1>
            <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
              {jobs.length} ตำแหน่ง · {jobs.filter((j) => j.status === "open").length} เปิดรับ
            </p>
          </div>
          {canCreate && (
            <Link
              href="/clinic/jobs/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-gold)] px-5 py-2.5 text-[0.88rem] font-semibold text-black transition-colors hover:bg-[color:var(--color-gold-bright)]"
            >
              <Plus className="h-4 w-4" />
              ลงประกาศ
            </Link>
          )}
        </div>

        {!canCreate && (
          <div className="mt-6 rounded-2xl border border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5 p-4 text-[0.88rem] text-[color:var(--color-muted-strong)]">
            ⏳ คลินิกยังรอการอนุมัติ — ลงประกาศได้หลังได้รับการอนุมัติ
          </div>
        )}

        <section className="mt-6 space-y-3 lg:mt-8">
          {jobs.length === 0 ? (
            <p className="rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] py-12 text-center text-[0.9rem] text-[color:var(--color-muted)]">
              ยังไม่มีตำแหน่ง {canCreate && "— กดปุ่ม “ลงประกาศ” เพื่อเริ่ม"}
            </p>
          ) : (
            jobs.map((j) => (
              <article
                key={j.id}
                className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[1.05rem] font-bold lg:text-[1.15rem]">{j.title}</h3>
                      {j.isFeatured && (
                        <span className="rounded-full border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/5 px-2 py-0.5 text-[0.7rem] text-[color:var(--color-gold-bright)]">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[0.82rem] text-[color:var(--color-muted-strong)]">
                      {EMPLOYMENT_LABELS[j.employmentType] ?? j.employmentType}
                      {(j.salaryMin || j.salaryMax) && (
                        <>
                          {" · "}
                          <b className="text-[color:var(--color-gold-bright)]">
                            {salaryRange(j.salaryMin, j.salaryMax)} ฿
                          </b>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ToggleJobButton jobId={j.id} status={j.status} />
                    <Link
                      href={`/jobs/${j.id}` as never}
                      className="text-[0.78rem] text-[color:var(--color-muted-strong)] hover:text-[color:var(--color-gold-bright)]"
                    >
                      ดูประกาศ →
                    </Link>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[color:var(--color-border-soft)] pt-4">
                  <Link
                    href={`/clinic/applications?job=${j.id}` as never}
                    className="inline-flex items-center gap-1.5 text-[0.85rem] text-[color:var(--color-foreground)] hover:text-[color:var(--color-gold-bright)]"
                  >
                    <Users className="h-3.5 w-3.5 text-[color:var(--color-gold)]" />
                    <b>{j.applicationCount}</b> ใบสมัคร →
                  </Link>
                  <span className="text-[0.72rem] text-[color:var(--color-muted)]">
                    ลงประกาศ {new Date(j.createdAt).toLocaleDateString("th-TH", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </span>
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

function salaryRange(min: string | null, max: string | null): string {
  if (min && max) {
    if (min === max) return formatBaht(Number(min));
    return `${formatBaht(Number(min))} - ${formatBaht(Number(max))}`;
  }
  if (min) return `${formatBaht(Number(min))}+`;
  if (max) return `≤ ${formatBaht(Number(max))}`;
  return "";
}
