import Link from "next/link";
import { CrownGlyph } from "@/components/brand/logo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

export const dynamic = "force-static";

const STATS = [
  { value: "100+", label: "คลินิกพันธมิตร" },
  { value: "500+", label: "Sale เครือข่าย" },
  { value: "10,000+", label: "ลูกค้าที่ดูแล" },
  { value: "4.8 ★", label: "คะแนนรีวิวเฉลี่ย" },
];

const VALUES = [
  {
    emoji: "🛡",
    title: "Trust",
    desc: "คลินิกทุกแห่งผ่าน admin verify ใบอนุญาตวิชาชีพ — ลูกค้าจองด้วยความมั่นใจ Sale แนะนำด้วยความสบายใจ",
  },
  {
    emoji: "💎",
    title: "Transparency",
    desc: "ราคาที่แสดง คือราคาที่จ่าย ค่าคอมที่ตกลง คือค่าคอมที่ได้ — ไม่มีค่าธรรมเนียมแฝง ไม่มี contract บังคับ",
  },
  {
    emoji: "🚀",
    title: "Growth",
    desc: "Sale ที่ดี → คลินิกได้ลูกค้า → ลูกค้าได้บริการดี → ทุกคนเติบโตไปด้วยกัน",
  },
];

const VISION_POINTS = [
  {
    title: "Phase 1 — Sale Referral Platform",
    status: "ใช้งานได้แล้ว",
    desc: "Sale แนะนำลูกค้าให้คลินิก รับค่าคอมต่อเคส admin ดูแลคุณภาพ end-to-end",
    active: true,
  },
  {
    title: "Phase 2 — Beauty Job Marketplace",
    status: "Beta — กำลังทดสอบ",
    desc: "ตำแหน่งงานสายความงาม: พยาบาล, ผู้ช่วยแพทย์, นัก injector, นัก laser — KYC ใบอนุญาตในระบบ",
    active: true,
  },
  {
    title: "Phase 3 — AI Recommendation",
    status: "Q4 2026",
    desc: "AI matching ลูกค้ากับคลินิกที่ใช่ตามความต้องการ, รีวิว, ผลงาน — ใช้ vector embedding + machine learning",
    active: false,
  },
  {
    title: "Phase 4 — In-app Communication",
    status: "2027",
    desc: "Chat ในแอประหว่าง Sale, คลินิก, Candidate — ลด friction การประสานงาน",
    active: false,
  },
];

export default function AboutPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      {/* Hero */}
      <section className="mx-auto w-full max-w-md px-5 pt-8 pb-12 lg:max-w-7xl lg:px-8 lg:pt-20 lg:pb-20">
        <div className="text-center lg:max-w-4xl lg:mx-auto">
          <div className="flex justify-center">
            <CrownGlyph className="h-14 w-20 text-[color:var(--color-gold)] lg:h-20 lg:w-28" />
          </div>
          <h1 className="mt-6 font-brand text-[2.5rem] font-semibold text-gold-gradient lg:text-[4.5rem]">
            Sur Beau
          </h1>
          <p className="mt-2 text-[0.85rem] tracking-[0.25em] text-[color:var(--color-muted)] lg:text-[1rem]">
            BEAUTY · CLINIC · PLATFORM
          </p>
          <p className="mt-8 text-[1.05rem] leading-relaxed text-[color:var(--color-muted-strong)] lg:text-[1.25rem]">
            แพลตฟอร์มกลางที่เชื่อม <b className="text-[color:var(--color-foreground)]">คลินิกความงาม</b>,{" "}
            <b className="text-[color:var(--color-foreground)]">Sale ที่เก่ง</b>, และ{" "}
            <b className="text-[color:var(--color-foreground)]">ลูกค้าที่ตรงสาย</b> เข้าด้วยกัน —
            สร้างประสบการณ์การจองที่ไว้ใจได้ในยุคที่ทุกอย่างต้อง verify
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto w-full max-w-md px-5 pb-16 lg:max-w-7xl lg:px-8 lg:pb-24">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-[2rem] font-bold text-gold-gradient lg:text-[3rem]">
                {s.value}
              </div>
              <div className="mt-1 text-[0.85rem] text-[color:var(--color-muted)] lg:text-[0.95rem]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto w-full max-w-md px-5 pb-16 lg:max-w-7xl lg:px-8 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-[0.74rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
              OUR · STORY
            </span>
            <h2 className="mt-2 text-[1.8rem] font-extrabold leading-tight lg:text-[2.5rem]">
              เริ่มจาก<span className="text-gold-gradient">ปัญหาที่เห็น</span>
            </h2>
            <div className="mt-5 space-y-4 text-[0.95rem] leading-relaxed text-[color:var(--color-muted-strong)] lg:text-[1.05rem]">
              <p>
                ตลาดความงามไทยโตเร็ว — แต่ <b className="text-[color:var(--color-foreground)]">ลูกค้าหาคลินิกที่ใช่ยาก</b>{" "}
                ต้อง scroll ดู Facebook page เป็นชั่วโมง ไม่รู้ใครรีวิวจริงไม่จริง
              </p>
              <p>
                ฝั่งคลินิกก็ <b className="text-[color:var(--color-foreground)]">เสียค่า ad เยอะ</b> แต่ traffic
                ไม่ตรงเป้า ลูกค้ามาแล้วไม่ปิดดีล
              </p>
              <p>
                ส่วนคนที่มี network ดี (อินฟลู, beauty advisor, ผู้รู้จักคนเยอะ) <b className="text-[color:var(--color-foreground)]">หา
                ช่องทางได้ค่าตอบแทนจากการแนะนำได้ยาก</b>
              </p>
              <p>
                <b className="text-[color:var(--color-gold-bright)]">Sur Beau</b> เกิดเพื่อตอบโจทย์ 3 ฝ่ายนี้ —
                ทุกคน win-win ผ่านระบบ commission ที่โปร่งใส และ verify ทุกฝ่ายในระบบ
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[color:var(--color-gold-deep)] bg-gradient-to-br from-[color:var(--color-gold)]/10 via-transparent to-transparent p-8 lg:p-12">
            <h3 className="text-[1.05rem] font-bold text-[color:var(--color-gold-bright)] lg:text-[1.2rem]">
              Our Values
            </h3>
            <ul className="mt-5 space-y-5">
              {VALUES.map((v) => (
                <li key={v.title}>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[1.4rem]">{v.emoji}</span>
                    <span className="text-[1.05rem] font-bold lg:text-[1.15rem]">{v.title}</span>
                  </div>
                  <p className="mt-1 pl-9 text-[0.88rem] text-[color:var(--color-muted-strong)]">
                    {v.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="mx-auto w-full max-w-md px-5 pb-16 lg:max-w-7xl lg:px-8 lg:pb-24">
        <div className="mb-8 lg:mb-12">
          <span className="text-[0.74rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            VISION · & · ROADMAP
          </span>
          <h2 className="mt-2 text-[1.8rem] font-extrabold lg:text-[2.5rem]">
            ก้าวต่อ<span className="text-gold-gradient">ของเรา</span>
          </h2>
        </div>

        <ol className="space-y-4 lg:space-y-5">
          {VISION_POINTS.map((v, i) => (
            <li
              key={i}
              className={`relative rounded-2xl border p-6 lg:p-7 ${
                v.active
                  ? "border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5"
                  : "border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] opacity-90"
              }`}
            >
              <div className="flex flex-col items-start gap-1 lg:flex-row lg:items-center lg:justify-between">
                <h3 className="text-[1.05rem] font-bold lg:text-[1.15rem]">{v.title}</h3>
                <span
                  className={`shrink-0 rounded-full border px-3 py-0.5 text-[0.72rem] font-medium ${
                    v.active
                      ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]"
                      : "border-[color:var(--color-border-default)] text-[color:var(--color-muted)]"
                  }`}
                >
                  {v.status}
                </span>
              </div>
              <p className="mt-2 text-[0.9rem] text-[color:var(--color-muted-strong)]">{v.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Team */}
      <section className="mx-auto w-full max-w-md px-5 pb-16 lg:max-w-7xl lg:px-8 lg:pb-24">
        <div className="rounded-3xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-8 text-center lg:p-14">
          <span className="text-[0.74rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
            THE · TEAM
          </span>
          <h2 className="mt-2 text-[1.6rem] font-extrabold lg:text-[2.2rem]">
            ทีม<span className="text-gold-gradient">ผู้สร้าง</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[0.95rem] text-[color:var(--color-muted-strong)] lg:text-[1.05rem]">
            ทีมเล็กที่หลงใหลในวงการความงาม + เทคโนโลยี — engineer, designer, beauty industry insider
            ทำงานร่วมกันเพื่อสร้างแพลตฟอร์มที่ทุกคนใช้แล้วชอบ
          </p>
          <p className="mt-6 text-[0.85rem] text-[color:var(--color-muted)]">
            อยากเป็นส่วนหนึ่งของทีม? เรากำลังหาคนด้วย —{" "}
            <a href="mailto:careers@surbeau.com" className="text-[color:var(--color-gold-bright)] hover:underline">
              careers@surbeau.com
            </a>
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto w-full max-w-md px-5 pb-16 lg:max-w-7xl lg:px-8 lg:pb-24">
        <div className="rounded-3xl border border-[color:var(--color-gold)] bg-gradient-to-br from-[color:var(--color-gold)]/15 to-transparent p-8 text-center lg:p-14">
          <h2 className="text-[1.6rem] font-extrabold lg:text-[2.2rem]">
            พร้อมเริ่มต้น<span className="text-gold-gradient">ไปด้วยกัน</span>?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[0.95rem] text-[color:var(--color-muted-strong)] lg:text-[1.05rem]">
            ไม่ว่าคุณจะเป็น Sale, คลินิก, หรือลูกค้า — Sur Beau พร้อมเป็นพื้นที่ที่ทุกคนเติบโตได้
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/for-sale"
              className="inline-flex items-center rounded-full bg-[color:var(--color-gold)] px-6 py-3 text-[0.92rem] font-semibold text-black hover:bg-[color:var(--color-gold-bright)]"
            >
              เป็น Sale →
            </Link>
            <Link
              href="/for-clinic"
              className="inline-flex items-center rounded-full border border-[color:var(--color-gold-deep)] px-6 py-3 text-[0.92rem] font-medium text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold-deep)]/10"
            >
              ลงทะเบียนคลินิก →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-[color:var(--color-border-default)] px-6 py-3 text-[0.92rem] font-medium text-[color:var(--color-muted-strong)] hover:border-[color:var(--color-gold-muted)]"
            >
              ดูคลินิก →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
