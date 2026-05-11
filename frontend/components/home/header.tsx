import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { BrandLockup } from "@/components/brand/logo";

const NAV_ITEMS = [
  { href: "/", label: "ค้นหาคลินิก" },
  { href: "/jobs", label: "หางาน" },
  { href: "/promo", label: "โปรร้อน" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/for-clinic", label: "สำหรับคลินิก" },
];

export function Header() {
  return (
    <>
      {/* Mobile header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-3 lg:hidden">
        <BrandLockup />
        <Link
          href="/auth/login"
          className="rounded-full border border-[color:var(--color-gold-deep)] px-4 py-1.5 text-[0.78rem] font-medium text-[color:var(--color-gold-bright)] transition-colors hover:bg-[color:var(--color-gold-deep)]/10"
        >
          เข้าสู่ระบบ
        </Link>
      </header>

      {/* Desktop top nav */}
      <header className="hidden lg:block">
        <div className="border-b border-[color:var(--color-border-soft)] bg-[color:var(--color-background)]/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-8">
            <div className="flex items-center gap-10">
              <BrandLockup />
              <nav>
                <ul className="flex items-center gap-7 text-[0.88rem] text-[color:var(--color-muted-strong)]">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="transition-colors hover:text-[color:var(--color-gold-bright)]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-1.5 text-[0.85rem] text-[color:var(--color-muted-strong)] transition-colors hover:text-[color:var(--color-gold-bright)]"
              >
                <MapPin className="h-3.5 w-3.5 text-[color:var(--color-gold)]" />
                <span>กรุงเทพมหานคร</span>
              </button>
              <button
                type="button"
                aria-label="ค้นหา"
                className="rounded-full border border-[color:var(--color-border-default)] p-2 text-[color:var(--color-muted-strong)] transition-colors hover:border-[color:var(--color-gold-muted)] hover:text-[color:var(--color-gold-bright)]"
              >
                <Search className="h-4 w-4" />
              </button>
              <Link
                href="/auth/login"
                className="rounded-full border border-[color:var(--color-gold-deep)] px-5 py-1.5 text-[0.85rem] font-medium text-[color:var(--color-gold-bright)] transition-colors hover:bg-[color:var(--color-gold-deep)]/10"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/auth/login?next=/clinic/register"
                className="rounded-full bg-[color:var(--color-gold)] px-5 py-1.5 text-[0.85rem] font-semibold text-black transition-colors hover:bg-[color:var(--color-gold-bright)]"
              >
                ลงทะเบียนคลินิก
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
