import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { VerifyButton } from "@/components/admin/verify-button";
import { getCandidatesForKYC } from "@/lib/queries/admin";
import { setCandidateVerified } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ filter?: string }>;

type LicenseFile = { type?: string; url?: string; uploaded_at?: string };

export default async function AdminCandidatesPage(props: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/admin/candidates");
  if (session.user.role !== "admin") redirect("/");

  const { filter } = await props.searchParams;
  const verifiedFilter = filter === "unverified" ? false : filter === "verified" ? true : undefined;

  const candidates = await getCandidatesForKYC({ verified: verifiedFilter });

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <h1 className="text-[1.7rem] font-extrabold lg:text-[2.2rem]">
          KYC — <span className="text-gold-gradient">Candidate Verify</span>
        </h1>
        <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
          ตรวจสอบใบอนุญาตวิชาชีพ — กด Verify เมื่อเอกสารถูกต้อง
        </p>

        <AdminNav current="/admin/candidates" />

        {/* Filter chips */}
        <div className="mt-4 flex gap-2 text-[0.78rem]">
          <FilterChip current={filter} value="" label={`ทั้งหมด (${candidates.length})`} />
          <FilterChip current={filter} value="unverified" label="ยังไม่ verify" />
          <FilterChip current={filter} value="verified" label="Verified ✓" />
        </div>

        <section className="mt-6 space-y-3 lg:mt-8">
          {candidates.length === 0 ? (
            <p className="rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] py-12 text-center text-[0.9rem] text-[color:var(--color-muted)]">
              ไม่พบ candidate ตามตัวกรองนี้
            </p>
          ) : (
            candidates.map((c) => {
              const licenseList = (c.licenseFiles as LicenseFile[]) ?? [];
              return (
                <article
                  key={c.candidateId}
                  className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h3 className="text-[1.05rem] font-bold">{c.userName}</h3>
                        <span className="text-[0.82rem] text-[color:var(--color-muted)]">
                          {c.userEmail}
                        </span>
                      </div>
                      {c.headline && (
                        <p className="mt-1 text-[0.88rem] text-[color:var(--color-gold-bright)]">
                          {c.headline}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 text-[0.82rem] text-[color:var(--color-muted-strong)]">
                        {c.experienceYears !== null && (
                          <span>ประสบการณ์ {c.experienceYears} ปี</span>
                        )}
                        {c.userPhone && <span>{c.userPhone}</span>}
                      </div>

                      {c.bio && (
                        <p className="mt-3 text-[0.85rem] text-[color:var(--color-muted-strong)]">
                          {c.bio}
                        </p>
                      )}

                      {/* Skills + specialties */}
                      {(c.skills.length > 0 || c.specialties.length > 0) && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {c.skills.map((s) => (
                            <span
                              key={`s-${s}`}
                              className="rounded-full border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-2 py-0.5 text-[0.7rem] text-[color:var(--color-muted-strong)]"
                            >
                              {s}
                            </span>
                          ))}
                          {c.specialties.map((s) => (
                            <span
                              key={`sp-${s}`}
                              className="rounded-full border border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5 px-2 py-0.5 text-[0.7rem] text-[color:var(--color-gold-bright)]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* License files */}
                      <div className="mt-4">
                        <h4 className="text-[0.78rem] font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
                          ใบอนุญาตวิชาชีพ ({licenseList.length})
                        </h4>
                        {licenseList.length === 0 ? (
                          <p className="mt-2 text-[0.85rem] text-[color:var(--color-hot)]">
                            ⚠ ยังไม่ได้อัปโหลดเอกสาร
                          </p>
                        ) : (
                          <ul className="mt-2 space-y-1.5">
                            {licenseList.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-[0.85rem]">
                                <span className="rounded border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-2 py-0.5 text-[0.72rem] text-[color:var(--color-muted-strong)]">
                                  {f.type ?? "เอกสาร"}
                                </span>
                                {f.url ? (
                                  <a
                                    href={f.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[color:var(--color-gold-bright)] hover:underline"
                                  >
                                    📄 เปิดดูเอกสาร →
                                  </a>
                                ) : (
                                  <span className="text-[color:var(--color-muted)]">no URL</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <p className="mt-4 text-[0.72rem] text-[color:var(--color-muted)]">
                        สมัครเมื่อ {new Date(c.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="lg:shrink-0">
                      <VerifyButton
                        candidateId={c.candidateId}
                        isVerified={c.isVerified}
                        setVerified={setCandidateVerified}
                      />
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}

function FilterChip({
  current,
  value,
  label,
}: {
  current: string | undefined;
  value: string;
  label: string;
}) {
  const isActive = (current ?? "") === value;
  const href = value ? (`/admin/candidates?filter=${value}` as const) : ("/admin/candidates" as const);
  return (
    <Link
      href={href as never}
      className={`rounded-full border px-3 py-1 transition-colors ${
        isActive
          ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold-bright)]"
          : "border-[color:var(--color-border-default)] text-[color:var(--color-muted-strong)] hover:border-[color:var(--color-gold-muted)]"
      }`}
    >
      {label}
    </Link>
  );
}
