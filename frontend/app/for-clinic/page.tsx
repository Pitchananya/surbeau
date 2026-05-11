import Link from "next/link";
import { Check, Megaphone, Users, BarChart3, Shield, Sparkles } from "lucide-react";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

export const dynamic = "force-static";

const BENEFITS = [
  {
    icon: Users,
    title: "ลูกค้าตรงสาย คุณภาพดี",
    desc: "Sale ที่ผ่านการคัดเลือกจาก admin เป็นคนแนะนำลูกค้ามาให้ — ไม่ใช่ traffic เปะปะจาก ad ทั่วไป",
  },
  {
    icon: Shield,
    title: "จ่ายค่าคอมเฉพาะที่ปิดดีล",
    desc: "ไม่มีค่าโฆษณาเหมาจ่าย — Sale ได้เฉพาะตอนคุณ mark ดีลสำเร็จเท่านั้น",
  },
  {
    icon: BarChart3,
    title: "Dashboard เรียลไทม์",
    desc: "ดูจำนวน lead, conversion, ค่าคอมรวม, ประสิทธิภาพแคมเปญ — ปรับกลยุทธ์ตามจริง",
  },
  {
    icon: Megaphone,
    title: "ลงโปรไม่จำกัด",
    desc: "สร้างกี่แคมเปญก็ได้ ปรับราคา / commission ได้ตลอด ปิด-เปิดได้ทุกเมื่อ",
  },
  {
    icon: Sparkles,
    title: "Premier Partner badge",
    desc: "ขึ้นทอป featured + showcase ใหญ่ — ลูกค้าเห็นก่อนคลินิกอื่น",
  },
  {
    icon: Check,
    title: "ไม่มีค่าสมัคร เริ่ม Free",
    desc: "ลงทะเบียน + รอ admin verify ฟรี — อัปเกรด tier เมื่อพร้อม",
  },
];

const STEPS = [
  { n: "1", title: "ลงทะเบียนคลินิก", desc: "กรอกข้อมูลคลินิก + เลขใบอนุญาต — รอ admin verify 1-3 วัน" },
  { n: "2", title: "สร้างแคมเปญ", desc: "ตั้งราคาโปร + ค่าคอมต่อเคส — Sale ในระบบเห็นทันที" },
  { n: "3", title: "Sale แชร์ลิงก์", desc: "Sale แชร์ลิงก์อ้างอิงให้ลูกค้า — ผ่านลิงก์ = นับเป็นของ Sale คนนั้น" },
  { n: "4", title: "รับ lead → ปิดดีล", desc: "ลูกค้ากรอกฟอร์ม → คุณเห็นที่ dashboard → ติดต่อกลับ → mark success" },
];

type Plan = {
  name: string;
  price: string;
  priceSub: string;
  highlight?: boolean;
  features: { label: string; included: boolean }[];
  cta: { label: string; href: string };
};

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "0",
    priceSub: "ตลอดชีพ",
    features: [
      { label: "ลงทะเบียนคลินิกในระบบ", included: true },
      { label: "สร้างแคมเปญไม่จำกัด", included: true },
      { label: "รับ lead จากเครือข่าย Sale", included: true },
      { label: "Dashboard พื้นฐาน", included: true },
      { label: "Verified badge ✓", included: false },
      { label: "Featured ขึ้นทอป", included: false },
      { label: "Analytics ขั้นสูง", included: false },
      { label: "Priority support", included: false },
    ],
    cta: { label: "เริ่มฟรีเลย", href: "/clinic/setup" },
  },
  {
    name: "Verified",
    price: "3,000",
    priceSub: "/เดือน",
    highlight: true,
    features: [
      { label: "ทุกอย่างของ Free", included: true },
      { label: "✓ Verified badge", included: true },
      { label: "ขึ้นก่อนคลินิก Free ในผลค้นหา", included: true },
      { label: "Analytics: conversion, CTR, ROI", included: true },
      { label: "Boosted posts (ฟรี 2 โพสต์/เดือน)", included: true },
      { label: "Featured ขึ้นทอป", included: false },
      { label: "AI-recommended ทุกหมวด", included: false },
      { label: "Priority support", included: false },
    ],
    cta: { label: "อัปเกรด Verified", href: "/clinic/setup" },
  },
  {
    name: "Premier",
    price: "9,000",
    priceSub: "/เดือน",
    features: [
      { label: "ทุกอย่างของ Verified", included: true },
      { label: "★ Premier badge + ขึ้นทอป", included: true },
      { label: "Featured hero ในหน้าแรก", included: true },
      { label: "AI-recommended ทุกหมวด", included: true },
      { label: "Boosted posts ไม่จำกัด", included: true },
      { label: "Candidate shortlist (Phase 2)", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "Priority support 24/7", included: true },
    ],
    cta: { label: "ติดต่อทีมขาย", href: "/contact-sales" },
  },
];

export default function ForClinicPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      {/* Hero */}
      <section className="mx-auto w-full max-w-md px-5 pt-8 pb-12 lg:max-w-7xl lg:px-8 lg:pt-20 lg:pb-24">
        <div className="lg:max-w-3xl">
          <span className="text-[0.78rem] font-medium tracking-[0.28em] text-[color:var(--color-gold)]">
            FOR · CLINIC · PARTNERS
          </span>
          <h1 className="mt-3 text-[2.2rem] font-extrabold leading-[1.05] tracking-tight lg:text-[4rem]">
            ขยายฐานลูกค้า
            <br />
            <span className="text-gold-gradient">จ่ายเฉพาะที่ปิดดีล</span>
          </h1>
          <p className="mt-5 text-[1rem] leading-relaxed text-[color:var(--color-muted-strong)] lg:text-[1.25rem]">
            ลงทะเบียนคลินิกฟรี — เครือข่าย Sale ของเราหาลูกค้าให้คุณ
            <b className="text-[color:var(--color-foreground)]"> ค่าคอมจ่ายเฉพาะตอนคุณยืนยันว่าปิดดีลสำเร็จ </b>
            ไม่มีค่าโฆษณาล่วงหน้า ไม่มีความเสี่ยง
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/clinic/setup"
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-gold)] px-7 py-3.5 text-[0.95rem] font-semibold text-black transition-colors hover:bg-[color:var(--color-gold-bright)] lg:px-9 lg:py-4 lg:text-[1.05rem]"
            >
              ลงทะเบียนคลินิก →
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center rounded-full border border-[color:var(--color-gold-deep)] px-7 py-3.5 text-[0.95rem] font-medium text-[color:var(--color-gold-bright)] transition-colors hover:bg-[color:var(--color-gold-deep)]/10 lg:px-9 lg:py-4"
            >
              ดูราคา
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto w-full max-w-md px-5 pb-12 lg:max-w-7xl lg:px-8 lg:pb-20">
        <div className="mb-8 lg:mb-12">
          <span className="text-[0.74rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            WHY · PARTNER · WITH · US
          </span>
          <h2 className="mt-2 text-[1.8rem] font-extrabold lg:text-[2.5rem]">
            ทำไมคลินิก<span className="text-gold-gradient">เลือก Sur Beau</span>
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

      {/* How it works */}
      <section className="mx-auto w-full max-w-md px-5 pb-12 lg:max-w-7xl lg:px-8 lg:pb-20">
        <div className="mb-8 lg:mb-12">
          <span className="text-[0.74rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            HOW · IT · WORKS
          </span>
          <h2 className="mt-2 text-[1.8rem] font-extrabold lg:text-[2.5rem]">
            เริ่มต้นใน <span className="text-gold-gradient">4 ขั้น</span>
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-6"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-gold)] font-display text-[1.2rem] font-bold text-black">
                {s.n}
              </span>
              <h3 className="mt-4 text-[1.05rem] font-bold">{s.title}</h3>
              <p className="mt-2 text-[0.88rem] text-[color:var(--color-muted-strong)]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto w-full max-w-md px-5 pb-12 lg:max-w-7xl lg:px-8 lg:pb-20">
        <div className="mb-8 lg:mb-12">
          <span className="text-[0.74rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            PRICING
          </span>
          <h2 className="mt-2 text-[1.8rem] font-extrabold lg:text-[2.5rem]">
            แพ็กเกจสำหรับ<span className="text-gold-gradient">คลินิก</span>
          </h2>
          <p className="mt-3 text-[0.95rem] text-[color:var(--color-muted-strong)]">
            ค่าสมัครรายเดือน — ยกเลิกได้ทุกเมื่อ ไม่มี contract
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          {PLANS.map((p) => (
            <article
              key={p.name}
              className={`relative rounded-3xl border p-6 lg:p-8 ${
                p.highlight
                  ? "border-[color:var(--color-gold)] bg-gradient-to-br from-[color:var(--color-gold)]/10 to-transparent"
                  : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface)]"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--color-gold)] px-3 py-0.5 text-[0.72rem] font-bold text-black">
                  POPULAR
                </span>
              )}
              <h3 className="text-[1.3rem] font-bold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-[2.5rem] font-bold text-[color:var(--color-foreground)] lg:text-[3rem]">
                  {p.price}
                </span>
                <span className="text-[0.95rem] text-[color:var(--color-muted)]">฿{p.priceSub}</span>
              </div>

              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li
                    key={f.label}
                    className={`flex items-start gap-2 text-[0.88rem] ${
                      f.included
                        ? "text-[color:var(--color-foreground)]"
                        : "text-[color:var(--color-muted)] line-through"
                    }`}
                  >
                    <span
                      className={`shrink-0 pt-0.5 ${
                        f.included
                          ? "text-[color:var(--color-gold)]"
                          : "text-[color:var(--color-muted)]"
                      }`}
                    >
                      {f.included ? "✓" : "—"}
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>

              <Link
                href={p.cta.href as never}
                className={`mt-8 block w-full rounded-full px-5 py-3 text-center text-[0.92rem] font-semibold transition-colors ${
                  p.highlight
                    ? "bg-[color:var(--color-gold)] text-black hover:bg-[color:var(--color-gold-bright)]"
                    : "border border-[color:var(--color-gold-deep)] text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold)]/10"
                }`}
              >
                {p.cta.label}
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-[0.85rem] text-[color:var(--color-muted)]">
          ทุกแพ็กเกจ <b className="text-[color:var(--color-foreground)]">ไม่รวมค่าคอมต่อเคส</b> ที่จ่ายให้ Sale —
          คลินิกกำหนดจำนวนเองในแต่ละแคมเปญ
        </p>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto w-full max-w-md px-5 pb-16 lg:max-w-7xl lg:px-8 lg:pb-24">
        <div className="rounded-3xl border border-[color:var(--color-gold)] bg-gradient-to-br from-[color:var(--color-gold)]/15 to-transparent p-8 text-center lg:p-14">
          <h2 className="text-[1.6rem] font-extrabold lg:text-[2.2rem]">
            พร้อมรับ<span className="text-gold-gradient">ลูกค้าเพิ่ม</span>วันนี้
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[0.95rem] text-[color:var(--color-muted-strong)] lg:text-[1.05rem]">
            สมัคร Free — เริ่มสร้างแคมเปญแรกของคุณภายใน 10 นาที — ขั้นตอน admin verify ใช้เวลา 1-3 วันทำการ
          </p>
          <Link
            href="/clinic/setup"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-gold)] px-8 py-3.5 text-[0.95rem] font-semibold text-black transition-colors hover:bg-[color:var(--color-gold-bright)] lg:px-10 lg:py-4 lg:text-[1.05rem]"
          >
            ลงทะเบียนคลินิกเลย — ฟรี →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
