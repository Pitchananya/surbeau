import Link from "next/link";
import { Sparkles, TrendingUp, Shield, Coins, Users, Clock } from "lucide-react";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

export const dynamic = "force-static";

const BENEFITS = [
  {
    icon: Coins,
    title: "ค่าคอมต่อเคส 200-1,500 ฿",
    desc: "ขึ้นกับโปรของแต่ละคลินิก — แค่ลูกค้าจองสำเร็จก็ได้เงิน",
  },
  {
    icon: TrendingUp,
    title: "ไม่จำกัดยอด",
    desc: "ยิ่งแนะนำมาก ยิ่งได้มาก ไม่มีเพดาน ไม่มีค่าธรรมเนียม",
  },
  {
    icon: Clock,
    title: "ลิงก์อ้างอิงพร้อมใช้",
    desc: "Copy ลิงก์ของตัวเองแชร์ LINE/FB/IG — ระบบติดตามให้ทุกเคส",
  },
  {
    icon: Shield,
    title: "โอนเข้าบัญชี / PromptPay",
    desc: "ขอถอนได้เมื่อ commission อนุมัติแล้ว — ไม่ต้องรอเดือนละครั้ง",
  },
  {
    icon: Users,
    title: "คลินิกพันธมิตรคัดสรร",
    desc: "เฉพาะคลินิกที่ผ่าน admin verify — ดีต่อลูกค้า ดีต่อชื่อเสียงคุณ",
  },
  {
    icon: Sparkles,
    title: "Dashboard เรียลไทม์",
    desc: "ดูสถานะ lead, ยอดสะสม, ประวัติการถอน ได้ทุกเมื่อ",
  },
];

const STEPS = [
  {
    n: "1",
    title: "สมัครและรอ admin อนุมัติ",
    desc: "กรอกข้อมูลบัญชีรับเงิน — ใช้เวลา 1-2 วันทำการ ไม่มีค่าใช้จ่าย",
  },
  {
    n: "2",
    title: "เลือกแคมเปญที่ตรงกับ network",
    desc: "ดูลิสต์โปรของคลินิกพันธมิตร แล้ว copy ลิงก์ของคุณ",
  },
  {
    n: "3",
    title: "แชร์ลิงก์ — รับ commission ทุกเคส",
    desc: "ลูกค้ากรอกฟอร์มผ่านลิงก์ → คลินิกปิดดีล → คุณได้ค่าคอม",
  },
];

export default function ForSalePage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      {/* Hero */}
      <section className="mx-auto w-full max-w-md px-5 pt-8 pb-12 lg:max-w-7xl lg:px-8 lg:pt-20 lg:pb-24">
        <div className="lg:max-w-3xl">
          <span className="text-[0.78rem] font-medium tracking-[0.28em] text-[color:var(--color-gold)]">
            BECOME · A · SALE
          </span>
          <h1 className="mt-3 text-[2.2rem] font-extrabold leading-[1.05] tracking-tight lg:text-[4rem]">
            แนะนำลูกค้า
            <br />
            <span className="text-gold-gradient">รับค่าคอมต่อเคส</span>
          </h1>
          <p className="mt-5 text-[1rem] leading-relaxed text-[color:var(--color-muted-strong)] lg:text-[1.25rem]">
            เป็น Sale ของ Sur Beau — แชร์ลิงก์โปรของคลินิกพันธมิตรให้คนรู้จัก
            ทุกครั้งที่ลูกค้าจองสำเร็จ คุณได้ commission ทันที <b className="text-[color:var(--color-foreground)]">ไม่มีค่าสมัคร ไม่มีค่าธรรมเนียม</b>
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/sale/setup"
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-gold)] px-7 py-3.5 text-[0.95rem] font-semibold text-black transition-colors hover:bg-[color:var(--color-gold-bright)] lg:px-9 lg:py-4 lg:text-[1.05rem]"
            >
              สมัครเป็น Sale ฟรี →
            </Link>
            <Link
              href="/auth/login?next=/sale"
              className="inline-flex items-center rounded-full border border-[color:var(--color-gold-deep)] px-7 py-3.5 text-[0.95rem] font-medium text-[color:var(--color-gold-bright)] transition-colors hover:bg-[color:var(--color-gold-deep)]/10 lg:px-9 lg:py-4"
            >
              เข้าสู่ระบบ
            </Link>
          </div>

          <p className="mt-4 text-[0.82rem] text-[color:var(--color-muted)]">
            เข้าสู่ระบบด้วย LINE • ไม่มี email/password ให้จำ
          </p>
        </div>
      </section>

      {/* Earnings highlight */}
      <section className="mx-auto w-full max-w-md px-5 pb-12 lg:max-w-7xl lg:px-8 lg:pb-20">
        <div className="overflow-hidden rounded-3xl border border-[color:var(--color-gold-deep)] bg-gradient-to-br from-[color:var(--color-gold)]/10 via-transparent to-transparent p-7 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
            <Earning amount="500" desc="ค่าคอมเฉลี่ยต่อเคสโบท็อกซ์/ฟิลเลอร์" />
            <Earning amount="1,500" desc="ค่าคอมต่อเคสศัลยกรรมจมูก" highlight />
            <Earning amount="200" desc="ค่าคอมเฉลี่ยต่อเคสทรีตเมนต์" />
          </div>
          <p className="mt-6 text-center text-[0.85rem] text-[color:var(--color-muted)] lg:text-[0.95rem]">
            * ค่าคอมแต่ละแคมเปญต่างกัน — คลินิกพันธมิตรเป็นผู้กำหนดเอง
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-md px-5 pb-12 lg:max-w-7xl lg:px-8 lg:pb-20">
        <div className="mb-8 lg:mb-12">
          <span className="text-[0.74rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            HOW · IT · WORKS
          </span>
          <h2 className="mt-2 text-[1.8rem] font-extrabold lg:text-[2.5rem]">
            เริ่มต้นใน <span className="text-gold-gradient">3 ขั้น</span>
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 lg:gap-8">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-6 lg:p-8"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-gold)] font-display text-[1.2rem] font-bold text-black">
                {s.n}
              </span>
              <h3 className="mt-4 text-[1.1rem] font-bold lg:text-[1.2rem]">{s.title}</h3>
              <p className="mt-2 text-[0.92rem] text-[color:var(--color-muted-strong)]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits grid */}
      <section className="mx-auto w-full max-w-md px-5 pb-12 lg:max-w-7xl lg:px-8 lg:pb-20">
        <div className="mb-8 lg:mb-12">
          <span className="text-[0.74rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            WHY · SUR · BEAU
          </span>
          <h2 className="mt-2 text-[1.8rem] font-extrabold lg:text-[2.5rem]">
            ทำไมถึง<span className="text-gold-gradient">เป็น Sale</span>ที่นี่
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-6"
              >
                <Icon className="h-6 w-6 text-[color:var(--color-gold)]" />
                <h3 className="mt-3 text-[1.02rem] font-bold">{b.title}</h3>
                <p className="mt-1.5 text-[0.88rem] text-[color:var(--color-muted-strong)]">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto w-full max-w-md px-5 pb-16 lg:max-w-7xl lg:px-8 lg:pb-24">
        <div className="rounded-3xl border border-[color:var(--color-gold)] bg-gradient-to-br from-[color:var(--color-gold)]/15 to-transparent p-8 text-center lg:p-14">
          <h2 className="text-[1.6rem] font-extrabold lg:text-[2.2rem]">
            เริ่ม<span className="text-gold-gradient">รายได้แรก</span>วันนี้
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[0.95rem] text-[color:var(--color-muted-strong)] lg:text-[1.05rem]">
            ใช้เวลาสมัครไม่ถึง 5 นาที — รอ admin อนุมัติ 1-2 วัน แล้วเริ่มแชร์ลิงก์ได้เลย
          </p>
          <Link
            href="/sale/setup"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-gold)] px-8 py-3.5 text-[0.95rem] font-semibold text-black transition-colors hover:bg-[color:var(--color-gold-bright)] lg:px-10 lg:py-4 lg:text-[1.05rem]"
          >
            สมัครเลย — ฟรี →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Earning({
  amount,
  desc,
  highlight,
}: {
  amount: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? "text-center lg:scale-110" : "text-center"}>
      <div className="text-[0.74rem] uppercase tracking-wider text-[color:var(--color-muted)]">
        ฿
      </div>
      <div
        className={`font-display text-[2.8rem] font-bold leading-none lg:text-[4rem] ${
          highlight ? "text-gold-gradient" : "text-[color:var(--color-foreground)]"
        }`}
      >
        {amount}
      </div>
      <div className="mt-2 text-[0.85rem] text-[color:var(--color-muted-strong)]">{desc}</div>
    </div>
  );
}
