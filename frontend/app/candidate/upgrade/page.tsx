import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { getCandidateByUserId } from "@/lib/queries/jobs";
import { getActiveOrPendingMembership } from "@/lib/queries/membership";
import { SubmitPaymentForm } from "./submit-form";

const PREMIUM_AMOUNT = 300;

export const dynamic = "force-dynamic";

export default async function CandidateUpgradePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/candidate/upgrade");

  const candidate = await getCandidateByUserId(session.user.id);
  if (!candidate) redirect("/candidate/setup");

  const existing = await getActiveOrPendingMembership(session.user.id);
  if (existing?.status === "active") redirect("/candidate");

  const promptpayId = process.env.PLATFORM_PROMPTPAY_ID;

  let qrDataUrl: string | null = null;
  if (promptpayId) {
    const payload = generatePayload(promptpayId, { amount: PREMIUM_AMOUNT });
    qrDataUrl = await QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: { dark: "#0b0a08", light: "#f5f0e6" },
    });
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-4xl lg:px-8 lg:py-12">
        <Link
          href="/candidate"
          className="inline-flex items-center gap-1 text-[0.85rem] text-[color:var(--color-muted-strong)] hover:text-[color:var(--color-gold-bright)]"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับ Dashboard
        </Link>

        <div className="mt-3">
          <span className="text-[0.7rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            UPGRADE TO PREMIUM
          </span>
          <h1 className="mt-1 text-[1.8rem] font-extrabold leading-tight lg:text-[2.4rem]">
            อัปเกรดเป็น <span className="text-gold-gradient">Premium</span>
          </h1>
          <p className="mt-2 text-[0.92rem] text-[color:var(--color-muted-strong)] lg:text-[1rem]">
            300฿/ปี — สมัครงานพรีเมียมไม่จำกัด · โปรไฟล์ขึ้น Featured · เห็นงานก่อนคนอื่น
          </p>
        </div>

        {existing?.status === "pending" && (
          <div className="mt-6 rounded-2xl border border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5 p-5">
            <h2 className="font-semibold text-[color:var(--color-gold-bright)]">
              ⏳ คุณมีคำขอที่รอ admin ตรวจสอบอยู่
            </h2>
            <p className="mt-2 text-[0.88rem] text-[color:var(--color-muted-strong)]">
              ปกติใช้เวลา &lt; 24 ชม. — เมื่อ admin ยืนยัน Premium จะเปิดใช้งานทันที
            </p>
            <Link
              href="/candidate"
              className="mt-3 inline-block text-[0.85rem] text-[color:var(--color-gold-bright)] hover:underline"
            >
              กลับ Dashboard →
            </Link>
          </div>
        )}

        {!existing && (
          <div className="mt-8 grid gap-6 lg:grid-cols-5 lg:gap-10">
            {/* QR + payment info */}
            <div className="lg:col-span-3">
              <h2 className="text-[1.05rem] font-bold lg:text-[1.2rem]">
                1. สแกน QR ด้วยแอปธนาคาร
              </h2>

              {qrDataUrl ? (
                <div className="mt-4 flex flex-col items-center gap-3 rounded-3xl border border-[color:var(--color-gold-deep)] bg-[color:var(--color-surface)] p-6 lg:flex-row lg:items-start lg:gap-6">
                  <img
                    src={qrDataUrl}
                    alt="PromptPay QR"
                    width={240}
                    height={240}
                    className="rounded-xl bg-white"
                  />
                  <dl className="grid w-full grid-cols-2 gap-3 text-[0.88rem] lg:grid-cols-1">
                    <Field label="PromptPay">{maskPromptPay(promptpayId!)}</Field>
                    <Field label="จำนวน" big>
                      <span className="font-display text-[1.5rem] font-bold text-[color:var(--color-gold-bright)]">
                        300 ฿
                      </span>
                    </Field>
                    <Field label="ระยะเวลา" full>1 ปี ตั้งแต่วันที่ admin ยืนยัน</Field>
                  </dl>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-[color:var(--color-hot)]/40 bg-[color:var(--color-hot-soft)] p-5 text-[0.88rem] text-[color:var(--color-hot)]">
                  ⚠ ยังไม่ได้ตั้งค่า <code>PLATFORM_PROMPTPAY_ID</code> ใน .env.local
                </div>
              )}

              <ol className="mt-6 space-y-3 text-[0.88rem] text-[color:var(--color-muted-strong)]">
                <li className="flex gap-3">
                  <span className="shrink-0 rounded-full bg-[color:var(--color-gold)] px-2 py-0.5 text-[0.72rem] font-bold text-black">1</span>
                  เปิดแอปธนาคาร → สแกน QR → ยืนยันโอน 300฿
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 rounded-full bg-[color:var(--color-gold)] px-2 py-0.5 text-[0.72rem] font-bold text-black">2</span>
                  จด <b>หมายเลขอ้างอิงการโอน</b> จาก slip
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 rounded-full bg-[color:var(--color-gold)] px-2 py-0.5 text-[0.72rem] font-bold text-black">3</span>
                  กรอกในฟอร์มด้านขวา → admin ตรวจสอบ &lt; 24 ชม.
                </li>
              </ol>
            </div>

            {/* Submission form */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <h2 className="text-[1.05rem] font-bold lg:text-[1.2rem]">
                  2. ยืนยันการชำระเงิน
                </h2>
                <div className="mt-4 rounded-3xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-7">
                  <SubmitPaymentForm />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature list */}
        <section className="mt-12">
          <h2 className="text-[1.15rem] font-bold lg:text-[1.3rem]">สิทธิประโยชน์ Premium</h2>
          <ul className="mt-3 grid gap-2 text-[0.9rem] text-[color:var(--color-muted-strong)] lg:grid-cols-2">
            <Feature>สมัครงานพรีเมียมไม่จำกัด</Feature>
            <Feature>โปรไฟล์ติด Featured ในผลการค้นหา</Feature>
            <Feature>ส่ง resume ฉบับเต็ม + portfolio</Feature>
            <Feature>เห็นตำแหน่งใหม่ก่อนคนอื่น 24 ชม.</Feature>
            <Feature>Priority support</Feature>
            <Feature>หมดอายุ 1 ปี — ต่ออายุได้</Feature>
          </ul>
        </section>
      </div>

      <Footer />
    </main>
  );
}

function Field({
  label,
  full,
  big,
  children,
}: {
  label: string;
  full?: boolean;
  big?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "col-span-2 lg:col-span-1" : ""}>
      <dt className="text-[0.72rem] uppercase tracking-wider text-[color:var(--color-muted)]">
        {label}
      </dt>
      <dd className={big ? "mt-0.5" : "mt-0.5 text-[color:var(--color-foreground)]"}>{children}</dd>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="shrink-0 pt-0.5 text-[color:var(--color-gold)]">✓</span>
      <span>{children}</span>
    </li>
  );
}

function maskPromptPay(id: string): string {
  if (id.length === 10) {
    // Phone format: 081-xxx-x123
    return `${id.slice(0, 3)}-xxx-x${id.slice(8)}`;
  }
  if (id.length === 13) {
    // National ID: x-xxxx-xxxxx-x1-2
    return `x-xxxx-xxxxx-${id.slice(10)}`;
  }
  return id;
}
