import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { getClinicByUserId } from "@/lib/queries/clinic-dashboard";
import { ClinicSetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

export default async function ClinicSetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/clinic/setup");

  const existing = await getClinicByUserId(session.user.id);
  if (existing) redirect("/clinic");

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-8 lg:max-w-2xl lg:px-8 lg:py-14">
        <div className="mb-6">
          <span className="text-[0.7rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            REGISTER CLINIC
          </span>
          <h1 className="mt-2 text-[1.8rem] font-extrabold leading-tight lg:text-[2.4rem]">
            ลงทะเบียน<span className="text-gold-gradient">คลินิก</span>
          </h1>
          <p className="mt-2 text-[0.92rem] text-[color:var(--color-muted-strong)] lg:text-[1rem]">
            เริ่มสร้างแคมเปญและรับลูกค้าผ่านเครือข่าย Sale ของ Sur Beau
          </p>
        </div>

        <ClinicSetupForm />
      </div>

      <Footer />
    </main>
  );
}
