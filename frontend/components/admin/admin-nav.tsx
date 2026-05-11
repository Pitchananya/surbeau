import Link from "next/link";

const ADMIN_TABS = [
  { href: "/admin", label: "ภาพรวม" },
  { href: "/admin/sales", label: "Sales" },
  { href: "/admin/clinics", label: "คลินิก" },
  { href: "/admin/candidates", label: "Candidates (KYC)" },
  { href: "/admin/memberships", label: "Premium" },
  { href: "/admin/payouts", label: "การถอนเงิน" },
  { href: "/admin/users", label: "ผู้ใช้" },
];

export function AdminNav({ current }: { current: string }) {
  return (
    <nav className="no-scrollbar -mx-5 mt-3 flex gap-1 overflow-x-auto px-5 lg:mx-0 lg:overflow-visible lg:px-0">
      {ADMIN_TABS.map((t) => {
        const isActive = current === t.href;
        return (
          <Link
            key={t.href}
            href={t.href as never}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-[0.82rem] font-medium transition-all lg:px-5 lg:py-2 lg:text-[0.88rem] ${
              isActive
                ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]"
                : "border-[color:var(--color-border-default)] bg-transparent text-[color:var(--color-muted-strong)] hover:border-[color:var(--color-gold-muted)]"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
