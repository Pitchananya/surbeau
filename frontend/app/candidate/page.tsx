import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import {
  getCandidateByUserId,
  getCandidateApplications,
} from "@/lib/queries/jobs";

export const dynamic = "force-dynamic";

export default async function CandidateDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/candidate");

  const candidate = await getCandidateByUserId(session.user.id);
  if (!candidate) redirect("/candidate/setup");

  const apps = await getCandidateApplications(candidate.id, 50);

  const statusCount = {
    pending: apps.filter((a) => a.status === "pending").length,
    shortlisted: apps.filter((a) => a.status === "shortlisted").length,
    interviewing: apps.filter((a) => a.status === "interviewing").length,
    hired: apps.filter((a) => a.status === "hired").length,
  };

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <div className="mb-6 lg:mb-10">
          <span className="text-[0.7rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            CANDIDATE DASHBOARD
          </span>
          <h1 className="mt-1 text-[1.7rem] font-extrabold lg:text-[2.2rem]">
            สวัสดี, <span className="text-gold-gradient">{session.user.name}</span>
          </h1>
          {candidate.headline && (
            <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
              {candidate.headline}
            </p>
          )}
          {!candidate.isVerified && (
            <p className="mt-2 inline-block rounded-full border border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5 px-3 py-1 text-[0.78rem] text-[color:var(--color-gold-bright)]">
              ⏳ ยังไม่ได้ verify ใบอนุญาต — โอกาสถูกเลือกจะน้อยกว่า
            </p>
          )}
        </div>

        {/* Application status overview */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          <Stat label="ใบสมัครทั้งหมด" value={apps.length} />
          <Stat label="รอพิจารณา" value={statusCount.pending} />
          <Stat label="ถูกคัดเลือก" value={statusCount.shortlisted + statusCount.interviewing} accent="gold" />
          <Stat label="ได้งาน" value={statusCount.hired} accent="gold" />
        </section>

        <section className="mt-6 rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:mt-10 lg:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-[1.05rem] font-bold lg:text-[1.2rem]">ใบสมัครของฉัน</h2>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-[0.82rem] text-[color:var(--color-gold-bright)] hover:underline"
            >
              <Briefcase className="h-3 w-3" />
              ดูตำแหน่งงาน
            </Link>
          </div>

          {apps.length === 0 ? (
            <p className="mt-3 text-[0.88rem] text-[color:var(--color-muted)]">
              ยังไม่ได้สมัครงาน — <Link href="/jobs" className="text-[color:var(--color-gold-bright)] hover:underline">เริ่มดูตำแหน่งงาน</Link>
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-[color:var(--color-border-soft)]">
              {apps.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 py-3 text-[0.88rem]">
                  <div className="min-w-0">
                    <Link
                      href={`/jobs/${a.jobId}` as never}
                      className="truncate font-medium hover:text-[color:var(--color-gold-bright)]"
                    >
                      {a.jobTitle}
                    </Link>
                    <div className="mt-0.5 truncate text-[0.78rem] text-[color:var(--color-muted)]">
                      {a.clinicName} · {new Date(a.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </div>
                  </div>
                  <AppStatus status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Membership upgrade CTA */}
        <section className="mt-6 rounded-2xl border border-[color:var(--color-gold-deep)] bg-gradient-to-br from-[color:var(--color-gold)]/8 to-transparent p-5 lg:mt-6 lg:p-7">
          <h3 className="font-bold text-[color:var(--color-gold-bright)] lg:text-[1.1rem]">
            ⭐ Premium Membership — 300฿/ปี
          </h3>
          <p className="mt-1 text-[0.85rem] text-[color:var(--color-muted-strong)]">
            สมัครงานพรีเมียมไม่จำกัด · โปรไฟล์ติด Featured · ส่งเรซูเม่ฉบับเต็ม · เห็นข้อมูลก่อนคนอื่น
          </p>
          <button
            type="button"
            disabled
            className="mt-3 inline-block rounded-full bg-[color:var(--color-surface-elevated)] px-5 py-2 text-[0.85rem] font-medium text-[color:var(--color-muted)]"
          >
            สมัครสมาชิก (ระบบจ่ายเงินกำลังจะเปิด)
          </button>
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
  value: number;
  accent?: "gold";
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-4 lg:p-5">
      <div className="text-[0.74rem] text-[color:var(--color-muted)] lg:text-[0.82rem]">{label}</div>
      <div
        className={`mt-1.5 font-display text-[1.4rem] font-bold lg:text-[1.75rem] ${
          accent === "gold" ? "text-[color:var(--color-gold-bright)]" : "text-[color:var(--color-foreground)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function AppStatus({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pending:      { label: "รอพิจารณา",  color: "border-[color:var(--color-border-default)] text-[color:var(--color-muted-strong)]" },
    shortlisted:  { label: "Shortlisted", color: "border-[color:var(--color-verified)] text-[color:var(--color-verified)]" },
    interviewing: { label: "สัมภาษณ์",   color: "border-[color:var(--color-verified)] text-[color:var(--color-verified)]" },
    hired:        { label: "ได้งาน!",    color: "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]" },
    rejected:     { label: "ไม่ผ่าน",   color: "border-[color:var(--color-hot)]/40 text-[color:var(--color-hot)]" },
    withdrawn:    { label: "ถอน",         color: "border-[color:var(--color-border-default)] text-[color:var(--color-muted)]" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}
