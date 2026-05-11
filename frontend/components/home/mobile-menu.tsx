"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, MapPin, Search } from "lucide-react";
import { BrandLockup } from "@/components/brand/logo";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "ค้นหาคลินิก" },
  { href: "/for-sale", label: "หา Sale" },
  { href: "/promo", label: "โปรร้อน" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/for-clinic", label: "สำหรับคลินิก" },
];

const ACCOUNT_LINKS: NavItem[] = [
  { href: "/sale", label: "Sale Dashboard" },
  { href: "/clinic", label: "Clinic Dashboard" },
  { href: "/candidate", label: "Candidate Dashboard" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="เปิดเมนู"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border-default)] text-[color:var(--color-foreground)] hover:border-[color:var(--color-gold-muted)]"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer */}
          <aside
            role="dialog"
            aria-label="เมนูหลัก"
            className="absolute left-0 top-0 flex h-full w-full max-w-xs flex-col overflow-y-auto border-r border-[color:var(--color-border-default)] bg-[color:var(--color-background)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--color-border-soft)] px-5 py-4">
              <BrandLockup />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                className="-mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Location row */}
            <div className="flex items-center justify-between border-b border-[color:var(--color-border-soft)] px-5 py-3 text-[0.85rem]">
              <span className="flex items-center gap-1.5 text-[color:var(--color-muted-strong)]">
                <MapPin className="h-3.5 w-3.5 text-[color:var(--color-gold)]" />
                กรุงเทพมหานคร
              </span>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border-default)] text-[color:var(--color-muted-strong)] hover:border-[color:var(--color-gold-muted)]"
                aria-label="ค้นหา"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Main nav */}
            <nav className="flex-1 px-3 py-4">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href as never}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-3 text-[0.95rem] font-medium text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-elevated)] hover:text-[color:var(--color-gold-bright)]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="my-4 border-t border-[color:var(--color-border-soft)]" />

              <h3 className="px-3 text-[0.72rem] font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
                Dashboard
              </h3>
              <ul className="mt-2 space-y-1">
                {ACCOUNT_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href as never}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-[0.88rem] text-[color:var(--color-muted-strong)] transition-colors hover:bg-[color:var(--color-surface-elevated)] hover:text-[color:var(--color-gold-bright)]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* CTA footer */}
            <div className="space-y-2 border-t border-[color:var(--color-border-soft)] px-5 py-4">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block w-full rounded-full border border-[color:var(--color-gold-deep)] py-2.5 text-center text-[0.88rem] font-medium text-[color:var(--color-gold-bright)] hover:bg-[color:var(--color-gold-deep)]/10"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/clinic/setup"
                onClick={() => setOpen(false)}
                className="block w-full rounded-full bg-[color:var(--color-gold)] py-2.5 text-center text-[0.88rem] font-semibold text-black hover:bg-[color:var(--color-gold-bright)]"
              >
                ลงทะเบียนคลินิก
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
