import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, ChevronLeft, MapPin } from "lucide-react";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ApplyForm } from "./apply-form";
import { auth } from "@/auth";
import {
  getJobById,
  getCandidateByUserId,
  hasApplied,
} from "@/lib/queries/jobs";
import { formatBaht } from "@/lib/utils";

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "งานประจำ",
  part_time: "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "ฝึกงาน",
};

export const dynamic = "force-dynamic";

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await getJobById(id);
  if (!data) notFound();
  const { job, clinic } = data;

  const session = await auth();
  const candidate = session?.user?.id ? await getCandidateByUserId(session.user.id) : null;
  const applied = candidate ? await hasApplied(candidate.id, job.id) : false;

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1 text-[0.85rem] text-[color:var(--color-muted-strong)] hover:text-[color:var(--color-gold-bright)]"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับงานทั้งหมด
        </Link>

        <div className="grid grid-cols-1 gap-6 pt-4 lg:grid-cols-3 lg:gap-12">
          <article className="lg:col-span-2">
            <header>
              <h1 className="text-[1.7rem] font-extrabold leading-tight lg:text-[2.4rem]">
                {job.title}
              </h1>
              <p className="mt-2 text-[1rem] text-[color:var(--color-gold-bright)] lg:text-[1.15rem]">
                {clinic.clinicName}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.88rem] text-[color:var(--color-muted-strong)]">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[color:var(--color-gold)]" />
                  {EMPLOYMENT_LABELS[job.employmentType] ?? job.employmentType}
                </span>
                {(job.location || clinic.province) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[color:var(--color-gold)]" />
                    {job.isRemote ? "ทำงานทางไกล" : (job.location || clinic.district || clinic.province)}
                  </span>
                )}
                {job.status === "closed" && (
                  <span className="rounded-full border border-[color:var(--color-hot)]/40 bg-[color:var(--color-hot-soft)] px-2 py-0.5 text-[0.72rem] font-medium text-[color:var(--color-hot)]">
                    ปิดรับสมัคร
                  </span>
                )}
              </div>

              {(job.salaryMin || job.salaryMax) && (
                <div className="mt-4 inline-block rounded-2xl border border-[color:var(--color-gold-deep)] bg-gradient-to-br from-[color:var(--color-gold)]/10 to-transparent px-5 py-3">
                  <div className="text-[0.74rem] text-[color:var(--color-muted)]">เงินเดือน (บาท/เดือน)</div>
                  <div className="mt-0.5 font-display text-[1.5rem] font-bold text-[color:var(--color-gold-bright)]">
                    {salaryRange(job.salaryMin, job.salaryMax)}
                  </div>
                </div>
              )}
            </header>

            {job.description && (
              <section className="mt-8">
                <h2 className="text-[1.15rem] font-bold lg:text-[1.3rem]">รายละเอียดงาน</h2>
                <p className="mt-3 whitespace-pre-line text-[0.92rem] leading-relaxed text-[color:var(--color-muted-strong)]">
                  {job.description}
                </p>
              </section>
            )}

            {job.requiredSkills.length > 0 && (
              <section className="mt-8">
                <h2 className="text-[1.15rem] font-bold lg:text-[1.3rem]">ทักษะที่ต้องการ</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5 px-3 py-1 text-[0.85rem] text-[color:var(--color-gold-bright)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8 rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-6">
              <h2 className="text-[1.05rem] font-bold">เกี่ยวกับคลินิก</h2>
              <p className="mt-1 text-[0.88rem] text-[color:var(--color-muted-strong)]">
                {clinic.clinicName}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.82rem] text-[color:var(--color-muted)]">
                {clinic.district && <span>{clinic.district}</span>}
                {clinic.province && <span>· {clinic.province}</span>}
                {clinic.phone && <span>· {clinic.phone}</span>}
              </div>
              <Link
                href={`/clinics/${clinic.id}` as never}
                className="mt-3 inline-block text-[0.82rem] text-[color:var(--color-gold-bright)] hover:underline"
              >
                ดูคลินิก →
              </Link>
            </section>
          </article>

          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              {job.status !== "open" ? (
                <div className="rounded-3xl border border-[color:var(--color-hot)]/40 bg-[color:var(--color-hot-soft)] p-7 text-center">
                  <h3 className="text-[1.05rem] font-bold text-[color:var(--color-hot)]">
                    ตำแหน่งนี้ปิดรับสมัครแล้ว
                  </h3>
                </div>
              ) : !session?.user ? (
                <div className="rounded-3xl border border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5 p-7 text-center">
                  <h3 className="text-[1.05rem] font-bold text-[color:var(--color-gold-bright)]">
                    เข้าสู่ระบบเพื่อสมัครงาน
                  </h3>
                  <Link
                    href={`/auth/login?next=/jobs/${job.id}` as never}
                    className="mt-4 inline-block rounded-full bg-[color:var(--color-gold)] px-6 py-2.5 text-[0.92rem] font-semibold text-black hover:bg-[color:var(--color-gold-bright)]"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </div>
              ) : !candidate ? (
                <div className="rounded-3xl border border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5 p-7 text-center">
                  <h3 className="text-[1.05rem] font-bold">สร้างโปรไฟล์ก่อนสมัคร</h3>
                  <p className="mt-2 text-[0.88rem] text-[color:var(--color-muted-strong)]">
                    คลินิกต้องเห็นโปรไฟล์ของคุณก่อนพิจารณา
                  </p>
                  <Link
                    href="/candidate/setup"
                    className="mt-4 inline-block rounded-full bg-[color:var(--color-gold)] px-6 py-2.5 text-[0.92rem] font-semibold text-black hover:bg-[color:var(--color-gold-bright)]"
                  >
                    สร้างโปรไฟล์ Candidate
                  </Link>
                </div>
              ) : applied ? (
                <div className="rounded-3xl border border-[color:var(--color-verified)] bg-[color:var(--color-verified-soft)] p-7 text-center">
                  <h3 className="text-[1.05rem] font-bold text-[color:var(--color-verified)]">
                    ✓ คุณสมัครตำแหน่งนี้แล้ว
                  </h3>
                  <Link
                    href="/candidate"
                    className="mt-3 inline-block text-[0.85rem] text-[color:var(--color-gold-bright)] hover:underline"
                  >
                    ดูสถานะ →
                  </Link>
                </div>
              ) : (
                <ApplyForm jobId={job.id} />
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function salaryRange(min: string | null, max: string | null): string {
  if (min && max) {
    if (min === max) return `${formatBaht(Number(min))} ฿`;
    return `${formatBaht(Number(min))} - ${formatBaht(Number(max))} ฿`;
  }
  if (min) return `${formatBaht(Number(min))}+ ฿`;
  if (max) return `สูงสุด ${formatBaht(Number(max))} ฿`;
  return "";
}
