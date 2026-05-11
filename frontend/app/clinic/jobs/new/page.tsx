import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { getClinicByUserId } from "@/lib/queries/clinic-dashboard";
import { JobForm } from "./job-form";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/clinic/jobs/new");

  const clinic = await getClinicByUserId(session.user.id);
  if (!clinic) redirect("/clinic/setup");
  if (clinic.status !== "approved") redirect("/clinic");

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-3xl lg:px-8 lg:py-12">
        <Link
          href="/clinic/jobs"
          className="inline-flex items-center gap-1 text-[0.85rem] text-[color:var(--color-muted-strong)] hover:text-[color:var(--color-gold-bright)]"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับ ตำแหน่งทั้งหมด
        </Link>

        <div className="mt-3 mb-6 lg:mb-10">
          <span className="text-[0.7rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            NEW JOB POST
          </span>
          <h1 className="mt-1 text-[1.7rem] font-extrabold lg:text-[2.2rem]">
            ลงประกาศ<span className="text-gold-gradient">รับสมัคร</span>
          </h1>
          <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
            ประกาศจะแสดงในหน้า /jobs และ Candidate สมัครงานได้ทันที
          </p>
        </div>

        <JobForm />
      </div>

      <Footer />
    </main>
  );
}
