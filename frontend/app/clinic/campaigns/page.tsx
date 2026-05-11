import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Plus, ExternalLink } from "lucide-react";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import {
  getClinicByUserId,
  getClinicCampaigns,
} from "@/lib/queries/clinic-dashboard";
import { formatBaht } from "@/lib/utils";
import { ToggleActiveButton } from "./toggle-button";

export const dynamic = "force-dynamic";

export default async function ClinicCampaignsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/clinic/campaigns");

  const clinic = await getClinicByUserId(session.user.id);
  if (!clinic) redirect("/clinic/setup");

  const campaigns = await getClinicCampaigns(clinic.id);
  const canCreate = clinic.status === "approved";

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-7xl lg:px-8 lg:py-12">
        <Link
          href="/clinic"
          className="inline-flex items-center gap-1 text-[0.85rem] text-[color:var(--color-muted-strong)] hover:text-[color:var(--color-gold-bright)]"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับ Dashboard
        </Link>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <h1 className="text-[1.7rem] font-extrabold lg:text-[2.2rem]">
              จัดการ<span className="text-gold-gradient">แคมเปญ</span>
            </h1>
            <p className="mt-1 text-[0.92rem] text-[color:var(--color-muted-strong)]">
              {campaigns.length} แคมเปญ · {campaigns.filter((c) => c.isActive).length} ใช้งานอยู่
            </p>
          </div>
          {canCreate && (
            <Link
              href="/clinic/campaigns/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-gold)] px-5 py-2.5 text-[0.88rem] font-semibold text-black transition-colors hover:bg-[color:var(--color-gold-bright)]"
            >
              <Plus className="h-4 w-4" />
              สร้างใหม่
            </Link>
          )}
        </div>

        {!canCreate && (
          <div className="mt-6 rounded-2xl border border-[color:var(--color-gold-deep)] bg-[color:var(--color-gold)]/5 p-4 text-[0.88rem] text-[color:var(--color-muted-strong)]">
            ⏳ คลินิกของคุณยังรอการอนุมัติ — สร้างแคมเปญได้หลังได้รับการอนุมัติจาก Admin
          </div>
        )}

        <section className="mt-6 space-y-3 lg:mt-8">
          {campaigns.length === 0 ? (
            <p className="rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] py-12 text-center text-[0.9rem] text-[color:var(--color-muted)]">
              ยังไม่มีแคมเปญ {canCreate && "— กดปุ่ม “สร้างใหม่” เพื่อเริ่มต้น"}
            </p>
          ) : (
            campaigns.map((c) => {
              const conversion =
                c.leadCount > 0 ? Math.round((c.successCount / c.leadCount) * 1000) / 10 : 0;
              return (
                <article
                  key={c.id}
                  className="rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 lg:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[1.05rem] font-bold lg:text-[1.15rem]">{c.title}</h3>
                        {c.isFeatured && (
                          <span className="rounded-full border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/5 px-2 py-0.5 text-[0.7rem] text-[color:var(--color-gold-bright)]">
                            🔥 Featured
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.82rem] text-[color:var(--color-muted-strong)]">
                        {c.promoPrice && (
                          <span>
                            โปรโม:{" "}
                            <b className="text-[color:var(--color-gold-bright)]">
                              {formatBaht(Number(c.promoPrice))} ฿
                            </b>
                            {c.normalPrice && (
                              <span className="ml-1 text-[color:var(--color-muted)] line-through">
                                {formatBaht(Number(c.normalPrice))}
                              </span>
                            )}
                          </span>
                        )}
                        <span>
                          ค่าคอม/เคส:{" "}
                          <b className="text-[color:var(--color-foreground)]">
                            {formatBaht(Number(c.commissionPerSuccess))} ฿
                          </b>
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <ToggleActiveButton campaignId={c.id} isActive={c.isActive} />
                      <Link
                        href={`/clinics/${c.id}` as never}
                        className="rounded-full border border-[color:var(--color-border-default)] p-2 text-[color:var(--color-muted-strong)] transition-colors hover:border-[color:var(--color-gold-muted)] hover:text-[color:var(--color-gold-bright)]"
                        title="ดูหน้าสาธารณะ"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[color:var(--color-border-soft)] pt-4 text-center">
                    <Mini label="ลูกค้าทั้งหมด" value={c.leadCount} />
                    <Mini label="สำเร็จ" value={c.successCount} accent="gold" />
                    <Mini label="Conversion" value={`${conversion}%`} />
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

function Mini({ label, value, accent }: { label: string; value: number | string; accent?: "gold" }) {
  return (
    <div>
      <div
        className={`font-display text-[1.15rem] font-bold ${
          accent === "gold" ? "text-[color:var(--color-gold-bright)]" : "text-[color:var(--color-foreground)]"
        }`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[0.72rem] text-[color:var(--color-muted)]">{label}</div>
    </div>
  );
}
