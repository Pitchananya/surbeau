import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { ToggleBlockButton } from "@/components/admin/action-buttons";
import { getUsers } from "@/lib/queries/admin";
import { setUserStatus } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ role?: string; status?: string }>;

export default async function AdminUsersPage(props: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/admin/users");
  if (session.user.role !== "admin") redirect("/");

  const { role: roleFilter, status: statusFilter } = await props.searchParams;

  const users = await getUsers({
    role: ["admin", "sale", "clinic", "customer"].includes(roleFilter ?? "")
      ? (roleFilter as "admin" | "sale" | "clinic" | "customer")
      : undefined,
    status: ["active", "pending", "blocked"].includes(statusFilter ?? "")
      ? (statusFilter as "active" | "pending" | "blocked")
      : undefined,
  });

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <h1 className="text-[1.7rem] font-extrabold lg:text-[2.2rem]">
          จัดการ<span className="text-gold-gradient">ผู้ใช้</span>
        </h1>
        <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
          {users.length} คน
        </p>

        <AdminNav current="/admin/users" />

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2 text-[0.78rem]">
          <FilterLink param="role" value="" current={roleFilter} label="ทุก role" />
          <FilterLink param="role" value="sale" current={roleFilter} label="Sale" />
          <FilterLink param="role" value="clinic" current={roleFilter} label="Clinic" />
          <FilterLink param="role" value="customer" current={roleFilter} label="Customer" />
          <FilterLink param="role" value="admin" current={roleFilter} label="Admin" />
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] lg:mt-8">
          <table className="w-full text-left text-[0.88rem]">
            <thead className="border-b border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-elevated)] text-[0.72rem] uppercase tracking-wider text-[color:var(--color-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">ชื่อ / Email</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Role</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[color:var(--color-muted)]">
                    ไม่พบผู้ใช้
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-[color:var(--color-border-soft)] last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[0.78rem] text-[color:var(--color-muted)]">
                        {u.email}
                        {u.phone && <span> · {u.phone}</span>}
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.role === "admin" ? (
                        <span className="text-[0.78rem] text-[color:var(--color-muted)]">protected</span>
                      ) : (
                        <ToggleBlockButton
                          userId={u.id}
                          currentStatus={u.status}
                          setStatus={setUserStatus}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>

      <Footer />
    </main>
  );
}

function FilterLink({
  param,
  value,
  current,
  label,
}: {
  param: string;
  value: string;
  current: string | undefined;
  label: string;
}) {
  const isActive = (current ?? "") === value;
  const href = value ? (`/admin/users?${param}=${value}` as const) : ("/admin/users" as const);
  return (
    <a
      href={href}
      className={`rounded-full border px-3 py-1 transition-colors ${
        isActive
          ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]"
          : "border-[color:var(--color-border-default)] text-[color:var(--color-muted-strong)] hover:border-[color:var(--color-gold-muted)]"
      }`}
    >
      {label}
    </a>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin:    "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]",
    sale:     "border-[color:var(--color-verified)] bg-[color:var(--color-verified-soft)] text-[color:var(--color-verified)]",
    clinic:   "border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] text-[color:var(--color-foreground)]",
    customer: "border-[color:var(--color-border-default)] text-[color:var(--color-muted-strong)]",
  };
  return <span className={`rounded-full border px-2 py-0.5 text-[0.72rem] font-medium ${map[role] ?? map.customer}`}>{role}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:  "text-[color:var(--color-verified)]",
    pending: "text-[color:var(--color-gold-bright)]",
    blocked: "text-[color:var(--color-hot)]",
  };
  return <span className={`text-[0.78rem] font-medium ${map[status] ?? ""}`}>{status}</span>;
}
