import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

export const dynamic = "force-static";

const SECTIONS = [
  {
    id: "start",
    title: "🚀 เริ่มต้น",
    items: [
      {
        q: "ต้องสมัครยังไง?",
        a: "เข้าสู่ระบบด้วย LINE → ไปที่ `/sale/setup` → กรอกข้อมูลบัญชีรับเงิน → รอ admin อนุมัติ 1-2 วันทำการ ฟรี ไม่มีค่าสมัคร",
      },
      {
        q: "ต้องมีคุณสมบัติอะไรบ้าง?",
        a: "ไม่มีข้อกำหนดพิเศษ — อายุ 18+, มีบัญชีธนาคารหรือ PromptPay, ติดต่อสื่อสารได้ภาษาไทย",
      },
      {
        q: "อนุมัติแล้วทำอะไรต่อ?",
        a: "ไปที่ Sale Dashboard → section 'ลิงก์อ้างอิงของคุณ' → เลือกแคมเปญ → กด Copy link → แชร์ลงช่องทางที่คุณถนัด (LINE, FB, IG, TikTok)",
      },
    ],
  },
  {
    id: "commission",
    title: "💰 ค่าคอมมิชชั่น",
    items: [
      {
        q: "ค่าคอมต่อเคสเท่าไหร่?",
        a: "ขึ้นอยู่กับแคมเปญของคลินิก — ปกติ 200-1,500 ฿/เคส โบท็อกซ์เฉลี่ย 500฿ ศัลยกรรมจมูก 1,000-1,500฿",
      },
      {
        q: "นับยังไงว่าเป็นเคสของเรา?",
        a: "ลูกค้ากรอกฟอร์ม lead ผ่านลิงก์อ้างอิงของคุณ (URL มี ?ref=<sale_id>) — ระบบจะ track อัตโนมัติ",
      },
      {
        q: "ลูกค้ามาแล้ว แต่ยังไม่ได้ค่าคอม?",
        a: "ค่าคอมจะถูกสร้างเมื่อคลินิกกด mark lead เป็น 'สำเร็จ' (ปิดดีลจริง) เท่านั้น — สถานะ 'ติดต่อแล้ว' ยังไม่นับ",
      },
      {
        q: "Status ของ commission?",
        a: "Pending (รอ admin) → Approved (พร้อมถอน) → Awaiting Payout (ขอถอนแล้ว) → Paid (ได้รับเงิน)",
      },
    ],
  },
  {
    id: "payout",
    title: "🏦 การถอนเงิน",
    items: [
      {
        q: "ขอถอนได้เมื่อไหร่?",
        a: "เมื่อมี commission สถานะ Approved อย่างน้อย 1 รายการ — ไม่มียอดขั้นต่ำ ถอนได้ทั้งหมด",
      },
      {
        q: "ใช้เวลานานแค่ไหน?",
        a: "หลังกดขอถอน → admin ตรวจสอบ 1-3 วันทำการ → โอนเข้าบัญชี/PromptPay ที่ผูกไว้",
      },
      {
        q: "ขอถอน 2 ครั้งพร้อมกันได้ไหม?",
        a: "ไม่ได้ — มีคำขอที่รออนุมัติได้ครั้งละ 1 ใบเท่านั้น รออันแรกได้รับอนุมัติก่อน",
      },
      {
        q: "เปลี่ยนบัญชีรับเงินยังไง?",
        a: "Sale Dashboard → โปรไฟล์ & บัญชีรับเงิน → แก้ข้อมูลธนาคาร/PromptPay → บันทึก (มีผลกับการถอนครั้งต่อไป)",
      },
    ],
  },
  {
    id: "tips",
    title: "💡 Tips หาลูกค้าให้ได้ผล",
    items: [
      {
        q: "เลือกแคมเปญยังไงให้ขายดี",
        a: "1) ดูค่าคอมต่อเคส 2) เลือกคลินิกที่ rating สูง (Premier > Verified > Free) 3) เลือกหัตถการที่ network คุณสนใจ — เพื่อนๆ ในกลุ่ม Facebook ไหน หรือ followers IG ของคุณคุยเรื่องไหนบ่อย",
      },
      {
        q: "แชร์ที่ไหนได้บ้าง?",
        a: "LINE OA / กลุ่ม LINE / Facebook group / Instagram bio / TikTok bio / Twitter / Discord — ห้ามใช้ spam ใน comment คนอื่น",
      },
      {
        q: "ทำ content ยังไงให้คนสนใจ?",
        a: "เล่าประสบการณ์จริง (ของตัวเองหรือคนรู้จัก) + before/after (ขออนุญาตก่อน) + บอกราคาโปร + ใส่ลิงก์ของคุณ + เปิดให้ตอบ DM ปรึกษาก่อนตัดสินใจ",
      },
      {
        q: "Conversion rate ปกติเท่าไหร่?",
        a: "Sale มือใหม่ 5-10%, Sale มีประสบการณ์ 15-25%, Sale ดาวเด่น 30%+ — ถ้าได้ 100 lead ปกติปิดได้ 5-30 เคส",
      },
    ],
  },
  {
    id: "rules",
    title: "⚠️ Do's & Don'ts",
    items: [
      {
        q: "ห้ามทำอะไรบ้าง?",
        a: "❌ ห้ามกรอก lead ปลอม (โดน ban + ตัด commission)\n❌ ห้าม spam comment คนอื่น\n❌ ห้ามอ้างว่าเป็นแพทย์/ผู้เชี่ยวชาญถ้าไม่ใช่\n❌ ห้ามรับเงินจากลูกค้าโดยตรง — ต้องผ่าน platform เท่านั้น",
      },
      {
        q: "ควรทำอะไร?",
        a: "✓ ตอบคำถามตามความจริง\n✓ แนะนำคลินิกที่ตรงกับความต้องการลูกค้า (ไม่ใช่ค่าคอมสูงสุด)\n✓ ติดตามดูแลหลังจอง — ลูกค้ามีปัญหา → แจ้งคลินิก",
      },
      {
        q: "ถ้าลูกค้ามีปัญหากับคลินิก?",
        a: "แจ้ง admin ที่ LINE @surbeau หรือ support@surbeau.com — ระบบ verify คลินิกอยู่แล้ว แต่หากเจอปัญหาเราจะตรวจสอบและแก้ไข",
      },
    ],
  },
  {
    id: "premium",
    title: "⭐ ระบบ Premium (Phase 2)",
    items: [
      {
        q: "Premium Sale ต่างจาก Free ยังไง?",
        a: "ตอนนี้ยังไม่มีระดับ Premium สำหรับ Sale — ทุกคนเข้าระบบเดียวกัน รับค่าคอมเท่ากันตามแคมเปญ (จะมีในอนาคต)",
      },
      {
        q: "อยากเป็นผู้สมัครงานสายความงามด้วย?",
        a: "ลงทะเบียน Candidate (300฿/ปี) ที่ `/candidate/setup` — สมัครงานคลินิกได้ไม่จำกัด + โปรไฟล์ Featured",
      },
    ],
  },
];

export default function SaleGuidePage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-5xl lg:px-8 lg:py-12">
        <Link
          href="/for-sale"
          className="inline-flex items-center gap-1 text-[0.85rem] text-[color:var(--color-muted-strong)] hover:text-[color:var(--color-gold-bright)]"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับ "หา Sale"
        </Link>

        <div className="mt-4 mb-10 lg:mt-6 lg:mb-14">
          <span className="text-[0.74rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            SALE · GUIDE
          </span>
          <h1 className="mt-2 text-[2rem] font-extrabold leading-tight lg:text-[3rem]">
            คู่มือ <span className="text-gold-gradient">Sale</span>
          </h1>
          <p className="mt-3 text-[0.95rem] text-[color:var(--color-muted-strong)] lg:text-[1.1rem]">
            ทุกอย่างที่ต้องรู้สำหรับการเป็น Sale ที่ Sur Beau — FAQ, Tips, กฎการใช้งาน
          </p>

          {/* Table of contents */}
          <nav className="mt-6 rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-4 lg:p-5">
            <h3 className="text-[0.74rem] font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
              สารบัญ
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="rounded-full border border-[color:var(--color-border-default)] px-3 py-1 text-[0.82rem] text-[color:var(--color-muted-strong)] transition-colors hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold-bright)]"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="space-y-12 lg:space-y-16">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-[1.5rem] font-extrabold lg:text-[1.8rem]">
                {section.title}
              </h2>
              <div className="mt-5 space-y-3">
                {section.items.map((item, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 transition-colors hover:border-[color:var(--color-gold-muted)] lg:p-6"
                  >
                    <summary className="flex cursor-pointer items-start justify-between gap-3 text-[0.98rem] font-semibold text-[color:var(--color-foreground)] lg:text-[1.05rem]">
                      <span>{item.q}</span>
                      <span className="shrink-0 text-[color:var(--color-gold)] transition-transform group-open:rotate-45 lg:text-[1.2rem]">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 whitespace-pre-line text-[0.9rem] leading-relaxed text-[color:var(--color-muted-strong)]">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer CTA */}
        <section className="mt-16 lg:mt-20">
          <div className="rounded-3xl border border-[color:var(--color-gold)] bg-gradient-to-br from-[color:var(--color-gold)]/15 to-transparent p-8 text-center lg:p-12">
            <h2 className="text-[1.4rem] font-extrabold lg:text-[2rem]">
              พร้อมเริ่ม<span className="text-gold-gradient">รายได้แรก</span>?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[0.92rem] text-[color:var(--color-muted-strong)]">
              อ่านเข้าใจแล้ว → สมัครเป็น Sale ฟรี → รอ admin อนุมัติ → เริ่มแชร์ลิงก์
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/sale/setup"
                className="inline-flex items-center rounded-full bg-[color:var(--color-gold)] px-6 py-3 text-[0.9rem] font-semibold text-black hover:bg-[color:var(--color-gold-bright)]"
              >
                สมัครเป็น Sale →
              </Link>
              <Link
                href="/for-sale"
                className="inline-flex items-center rounded-full border border-[color:var(--color-gold-deep)] px-6 py-3 text-[0.9rem] font-medium text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold-deep)]/10"
              >
                ดูค่าคอมตัวอย่าง
              </Link>
            </div>
            <p className="mt-6 text-[0.82rem] text-[color:var(--color-muted)]">
              มีคำถามอื่น? ทักไปที่ LINE Official <b className="text-[color:var(--color-gold-bright)]">@surbeau</b>
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
