import Link from "next/link";
import { CrownGlyph } from "@/components/brand/logo";

const FOOTER_GROUPS = [
  {
    title: "สำหรับลูกค้า",
    links: [
      { label: "ค้นหาคลินิก", href: "/" },
      { label: "โปรร้อนวันนี้", href: "/promo" },
      { label: "หมวดหัตถการ", href: "/categories" },
      { label: "รีวิวจริง", href: "/reviews" },
    ],
  },
  {
    title: "สำหรับคลินิก",
    links: [
      { label: "ลงทะเบียนคลินิก", href: "/auth/login" },
      { label: "แพ็กเกจ Premier", href: "/for-clinic#tiers" },
      { label: "Dashboard", href: "/clinic" },
      { label: "ติดต่อทีมขาย", href: "/contact-sales" },
    ],
  },
  {
    title: "สำหรับ Sale",
    links: [
      { label: "สมัครเป็น Sale", href: "/auth/login" },
      { label: "วิธีคิดค่าคอม", href: "/sale-guide" },
      { label: "Sale Dashboard", href: "/sale" },
      { label: "ขอถอนเงิน", href: "/sale/payout" },
    ],
  },
  {
    title: "บริษัท",
    links: [
      { label: "เกี่ยวกับเรา", href: "/about" },
      { label: "บล็อก", href: "/blog" },
      { label: "ข้อตกลงการใช้งาน", href: "/terms" },
      { label: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 hidden border-t border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)]/40 lg:block">
      <div className="mx-auto max-w-7xl px-8 py-14">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-4">
            <CrownGlyph className="h-9 w-12 text-[color:var(--color-gold)]" />
            <h3 className="mt-3 font-brand text-[1.6rem] font-semibold text-gold-gradient">
              Sur Beau
            </h3>
            <p className="mt-2 max-w-sm text-[0.88rem] text-[color:var(--color-muted)]">
              แพลตฟอร์มกลางที่เชื่อมคลินิกความงาม Sale และลูกค้า — สร้างประสบการณ์การจองที่ไว้ใจได้
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <a
                href="https://line.me"
                aria-label="LINE Official"
                className="rounded-full border border-[color:var(--color-border-default)] p-2 text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
              >
                <span className="text-[0.78rem] font-bold">LINE</span>
              </a>
              <a
                href="https://www.facebook.com"
                aria-label="Facebook"
                className="rounded-full border border-[color:var(--color-border-default)] p-2 text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
              >
                <span className="text-[0.78rem] font-bold">FB</span>
              </a>
              <a
                href="https://www.instagram.com"
                aria-label="Instagram"
                className="rounded-full border border-[color:var(--color-border-default)] p-2 text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
              >
                <span className="text-[0.78rem] font-bold">IG</span>
              </a>
            </div>
          </div>

          {FOOTER_GROUPS.map((g) => (
            <div key={g.title} className="col-span-2">
              <h4 className="mb-4 text-[0.82rem] font-semibold tracking-wider text-[color:var(--color-foreground)]">
                {g.title}
              </h4>
              <ul className="space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[0.85rem] text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-gold-bright)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-[color:var(--color-border-soft)] pt-6 text-[0.78rem] text-[color:var(--color-muted)]">
          <p>© 2026 Sur Beau. All rights reserved.</p>
          <p>Bangkok, Thailand</p>
        </div>
      </div>
    </footer>
  );
}
