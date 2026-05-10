import Link from "next/link";
import { BrandLockup } from "@/components/brand/logo";

export function Header() {
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-3">
      <BrandLockup />
      <Link
        href="/auth/login"
        className="rounded-full border border-[color:var(--color-gold-deep)] px-4 py-1.5 text-[0.78rem] font-medium text-[color:var(--color-gold-bright)] transition-colors hover:bg-[color:var(--color-gold-deep)]/10"
      >
        เข้าสู่ระบบ
      </Link>
    </header>
  );
}
