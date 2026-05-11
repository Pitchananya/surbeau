import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { JobCard } from "@/components/jobs/job-card";
import { getOpenJobs } from "@/lib/queries/jobs";

export const revalidate = 60;

export default async function JobBoardPage() {
  const jobs = await getOpenJobs(30);

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-14">
        <div>
          <span className="text-[0.7rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            BEAUTY CAREERS
          </span>
          <h1 className="mt-2 text-[2rem] font-extrabold leading-tight lg:text-[3rem]">
            งานสายความ<span className="text-gold-gradient">งาม</span>
          </h1>
          <p className="mt-2 max-w-2xl text-[0.95rem] text-[color:var(--color-muted-strong)] lg:text-[1.1rem]">
            ตำแหน่งงานจากคลินิกพันธมิตรของเรา — พยาบาล, ผู้ช่วยแพทย์, นัก injector, นัก laser และอื่นๆ
          </p>
          <p className="mt-3 text-[0.85rem] text-[color:var(--color-muted)]">
            <b className="text-[color:var(--color-foreground)]">{jobs.length}</b> ตำแหน่งเปิดรับ
          </p>
        </div>

        <section className="mt-8 space-y-3 lg:mt-10 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
          {jobs.length === 0 ? (
            <p className="rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] py-12 text-center text-[0.9rem] text-[color:var(--color-muted)] lg:col-span-2">
              ยังไม่มีตำแหน่งเปิดรับในขณะนี้
            </p>
          ) : (
            jobs.map((j) => <JobCard key={j.id} job={j} />)
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
