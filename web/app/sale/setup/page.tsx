import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { getSaleByUserId } from "@/lib/queries/sale";
import { SaleSetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

export default async function SaleSetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/sale/setup");

  // Already a Sale? skip the form
  const existing = await getSaleByUserId(session.user.id);
  if (existing) redirect("/sale");

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-8 lg:max-w-2xl lg:px-8 lg:py-14">
        <div className="mb-6">
          <span className="text-[0.7rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            JOIN AS SALE
          </span>
          <h1 className="mt-2 text-[1.8rem] font-extrabold leading-tight lg:text-[2.4rem]">
            สมัครเป็น <span className="text-gold-gradient">Sale</span>
          </h1>
          <p className="mt-2 text-[0.92rem] text-[color:var(--color-muted-strong)] lg:text-[1rem]">
            แนะนำลูกค้าให้คลินิกพันธมิตร — รับค่าคอมต่อเคสที่ปิดได้สำเร็จ
          </p>
        </div>

        <SaleSetupForm />
      </div>

      <Footer />
    </main>
  );
}
