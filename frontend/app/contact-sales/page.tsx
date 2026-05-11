import Link from "next/link";
import { ChevronLeft, Phone, Mail, MessageCircle } from "lucide-react";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ContactSalesForm } from "./contact-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ plan?: string }>;

export default async function ContactSalesPage(props: { searchParams: SearchParams }) {
  const { plan } = await props.searchParams;

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <Link
          href="/for-clinic"
          className="inline-flex items-center gap-1 text-[0.85rem] text-[color:var(--color-muted-strong)] hover:text-[color:var(--color-gold-bright)]"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับ "สำหรับคลินิก"
        </Link>

        <div className="grid gap-10 pt-6 lg:grid-cols-2 lg:gap-16 lg:pt-10">
          {/* Left: info */}
          <div>
            <span className="text-[0.74rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
              CONTACT · SALES
            </span>
            <h1 className="mt-2 text-[2rem] font-extrabold leading-tight lg:text-[3rem]">
              คุยกับ<span className="text-gold-gradient">ทีมขาย</span>
            </h1>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[color:var(--color-muted-strong)] lg:text-[1.05rem]">
              สำหรับคลินิกที่สนใจแพ็กเกจ <b className="text-[color:var(--color-foreground)]">Verified</b> หรือ{" "}
              <b className="text-[color:var(--color-foreground)]">Premier</b> — ทีมขายของเราจะติดต่อกลับเพื่อ:
            </p>

            <ul className="mt-5 space-y-3 text-[0.92rem] text-[color:var(--color-muted-strong)]">
              <Bullet>ปรึกษาแพ็กเกจที่เหมาะกับขนาดคลินิก</Bullet>
              <Bullet>วาง onboarding ให้สาขาหลายแห่งพร้อมกัน</Bullet>
              <Bullet>แนะนำการสร้างแคมเปญแรกที่ดึงดูดลูกค้า</Bullet>
              <Bullet>ดูตัวอย่างผลงานคลินิกพันธมิตรอื่น</Bullet>
              <Bullet>ราคา Enterprise สำหรับเครือข่ายขนาดใหญ่</Bullet>
            </ul>

            <div className="mt-10 rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-6">
              <h3 className="text-[0.95rem] font-bold">ช่องทางติดต่อตรง</h3>
              <p className="mt-1 text-[0.82rem] text-[color:var(--color-muted)]">
                ตอบกลับใน 1 วันทำการ (จันทร์-ศุกร์ 9:00-18:00 น.)
              </p>
              <ul className="mt-4 space-y-3 text-[0.88rem]">
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[0.78rem] text-[color:var(--color-muted)]">LINE Official</div>
                    <div className="font-medium text-[color:var(--color-gold-bright)]">@surbeau</div>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[0.78rem] text-[color:var(--color-muted)]">Email</div>
                    <a href="mailto:sales@surbeau.com" className="font-medium text-[color:var(--color-gold-bright)] hover:underline">
                      sales@surbeau.com
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]">
                    <Phone className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[0.78rem] text-[color:var(--color-muted)]">โทร (Hot line)</div>
                    <a href="tel:020000000" className="font-medium text-[color:var(--color-gold-bright)] hover:underline">
                      02-XXX-XXXX
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: form */}
          <div>
            <div className="rounded-3xl border border-[color:var(--color-gold-deep)] bg-[color:var(--color-surface)] p-6 lg:p-8">
              <h2 className="text-[1.1rem] font-bold lg:text-[1.25rem]">
                📋 กรอกฟอร์ม — ให้ทีมโทรกลับ
              </h2>
              <p className="mt-1 mb-5 text-[0.85rem] text-[color:var(--color-muted)]">
                เร็วสุด 4 ชั่วโมง ในเวลาทำการ
              </p>
              <ContactSalesForm initialPlan={plan} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="shrink-0 pt-0.5 text-[color:var(--color-gold)]">✓</span>
      <span>{children}</span>
    </li>
  );
}
