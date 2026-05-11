import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, BadgeCheck } from "lucide-react";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { getClinicByUserId } from "@/lib/queries/clinic-dashboard";
import {
  getClinicApplications,
  getClinicJobsForFilter,
} from "@/lib/queries/jobs";
import { StatusControl } from "./status-control";
import { JobFilterSelect } from "./job-filter";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ job?: string; status?: string }>;

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "",             label: "ทั้งหมด" },
  { value: "pending",      label: "รอพิจารณา" },
  { value: "shortlisted",  label: "Shortlist" },
  { value: "interviewing", label: "สัมภาษณ์" },
  { value: "hired",        label: "ได้งาน" },
  { value: "rejected",     label: "ปฏิเสธ" },
];

export default async function ClinicApplicationsPage(props: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/clinic/applications");

  const clinic = await getClinicByUserId(session.user.id);
  if (!clinic) redirect("/clinic/setup");

  const { job: jobFilter, status: statusFilter } = await props.searchParams;

  const [apps, jobOptions] = await Promise.all([
    getClinicApplications(clinic.id, {
      jobId: jobFilter || undefined,
      status: statusFilter || undefined,
    }),
    getClinicJobsForFilter(clinic.id),
  ]);

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

        <div className="mt-3 lg:flex lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[1.7rem] font-extrabold lg:text-[2.2rem]">
              ใบ<span className="text-gold-gradient">สมัคร</span>
            </h1>
            <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
              {apps.length} ใบสมัคร — กดปุ่มเพื่ออัปเดตสถานะ
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 space-y-3 lg:mt-6 lg:flex lg:items-center lg:gap-4 lg:space-y-0">
          <JobFilterSelect jobs={jobOptions} />

          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:overflow-visible lg:px-0">
            {STATUS_FILTERS.map((s) => {
              const isActive = (statusFilter ?? "") === s.value;
              const next = new URLSearchParams();
              if (jobFilter) next.set("job", jobFilter);
              if (s.value) next.set("status", s.value);
              const href = `/clinic/applications${next.toString() ? "?" + next.toString() : ""}` as const;
              return (
                <Link
                  key={s.value}
                  href={href as never}
                  className={`shrink-0 rounded-full border px-3 py-1 text-[0.78rem] font-medium transition-colors ${
                    isActive
                      ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]"
                      : "border-[color:var(--color-border-default)] text-[color:var(--color-muted-strong)] hover:border-[color:var(--color-gold-muted)]"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Applications list */}
        <section className="mt-6 space-y-3 lg:mt-8 lg:space-y-4">
          {apps.length === 0 ? (
            <p className="rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] py-12 text-center text-[0.9rem] text-[color:var(--color-muted)]">
              ไม่พบใบสมัครตามตัวกรองนี้
            </p>
          ) : (
            apps.map((a) => (
              <article
                key={a.id}
                className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    {/* Job context */}
                    <div className="mb-3">
                      <Link
                        href={`/jobs/${a.jobId}` as never}
                        className="text-[0.75rem] uppercase tracking-wider text-[color:var(--color-muted)] hover:text-[color:var(--color-gold-bright)]"
                      >
                        ตำแหน่ง: {a.jobTitle}
                      </Link>
                    </div>

                    {/* Candidate header */}
                    <div className="flex items-start gap-2">
                      <div>
                        <h3 className="text-[1.05rem] font-bold lg:text-[1.15rem]">
                          {a.candidateHeadline ?? "Candidate"}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem] text-[color:var(--color-muted-strong)]">
                          {a.candidateExperience !== null && (
                            <span>ประสบการณ์ {a.candidateExperience} ปี</span>
                          )}
                          {a.candidateIsVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[color:var(--color-verified)]">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              KYC verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {a.candidateBio && (
                      <p className="mt-3 text-[0.85rem] text-[color:var(--color-muted-strong)]">
                        {a.candidateBio}
                      </p>
                    )}

                    {/* Skills + specialties */}
                    {(a.candidateSkills.length > 0 || a.candidateSpecialties.length > 0) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {a.candidateSkills.map((s) => (
                          <span
                            key={`s-${s}`}
                            className="rounded-full border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-2 py-0.5 text-[0.7rem] text-[color:var(--color-muted-strong)]"
                          >
                            {s}
                          </span>
                        ))}
                        {a.candidateSpecialties.map((s) => (
                          <span
                            key={`sp-${s}`}
                            className="rounded-full border border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5 px-2 py-0.5 text-[0.7rem] text-[color:var(--color-gold-bright)]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Cover letter */}
                    {a.coverLetter && (
                      <details className="mt-4 rounded-xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-elevated)] p-3">
                        <summary className="cursor-pointer text-[0.82rem] font-medium text-[color:var(--color-gold-bright)]">
                          ข้อความถึงคลินิก (Cover Letter)
                        </summary>
                        <p className="mt-2 whitespace-pre-line text-[0.85rem] text-[color:var(--color-muted-strong)]">
                          {a.coverLetter}
                        </p>
                      </details>
                    )}

                    {a.resumeUrl && (
                      <a
                        href={a.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-[0.82rem] text-[color:var(--color-gold-bright)] hover:underline"
                      >
                        📄 ดู Resume / Portfolio →
                      </a>
                    )}

                    <p className="mt-3 text-[0.72rem] text-[color:var(--color-muted)]">
                      สมัครเมื่อ {new Date(a.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Status actions */}
                  <div className="lg:w-56 lg:shrink-0">
                    <StatusControl applicationId={a.id} currentStatus={a.status} />
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
