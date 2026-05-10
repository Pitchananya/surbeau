import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Phone, Star } from "lucide-react";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { LeadForm } from "./lead-form";
import { getClinicWithCampaigns } from "@/lib/queries/clinic";
import { formatBaht } from "@/lib/utils";

type SearchParams = Promise<{ ref?: string; campaign?: string }>;

export const revalidate = 60;

export default async function ClinicDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await props.params;
  const { ref, campaign: campaignParam } = await props.searchParams;

  const data = await getClinicWithCampaigns(id);
  if (!data) notFound();
  const { clinic, campaigns } = data;

  const tier = clinic.subscriptionTier;
  const tierBadge = tier === "premier"
    ? { label: "★ Premier Partner", color: "border-[color:var(--color-gold)] text-[color:var(--color-gold-bright)] bg-[color:var(--color-gold)]/10" }
    : tier === "verified"
    ? { label: "✓ Verified", color: "border-[color:var(--color-verified)] text-[color:var(--color-verified)] bg-[color:var(--color-verified-soft)]" }
    : null;

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md lg:max-w-7xl lg:px-8">
        {/* Back link (mobile only) */}
        <div className="px-5 pt-4 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-1 text-[0.85rem] text-[color:var(--color-muted-strong)] hover:text-[color:var(--color-gold-bright)]">
            <ChevronLeft className="h-4 w-4" />
            กลับหน้าแรก
          </Link>
        </div>

        {/* Desktop breadcrumb */}
        <div className="hidden lg:block lg:pt-8">
          <nav className="text-[0.82rem] text-[color:var(--color-muted)]">
            <Link href="/" className="hover:text-[color:var(--color-gold-bright)]">หน้าแรก</Link>
            <span className="mx-2">›</span>
            <span className="text-[color:var(--color-muted-strong)]">{clinic.clinicName}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-6 px-5 pt-4 pb-12 lg:grid-cols-3 lg:gap-12 lg:px-0 lg:pt-6">
          {/* Main content */}
          <article className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl">
              <div
                className="relative h-56 lg:h-80"
                style={{
                  background:
                    "linear-gradient(135deg, #2a1538 0%, #4a1a55 50%, #1d0d28 100%)",
                }}
              >
                {tierBadge && (
                  <span className={`absolute left-4 top-4 rounded-full border px-3 py-1.5 text-[0.78rem] font-medium backdrop-blur-sm ${tierBadge.color}`}>
                    {tierBadge.label}
                  </span>
                )}
              </div>
            </div>

            <header className="mt-6">
              <h1 className="text-[1.6rem] font-extrabold leading-tight lg:text-[2.2rem]">
                {clinic.clinicName}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.88rem] text-[color:var(--color-muted-strong)]">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[color:var(--color-gold-bright)] text-[color:var(--color-gold-bright)]" />
                  <span className="font-semibold text-[color:var(--color-foreground)]">
                    {Number(clinic.ratingAvg).toFixed(1)}
                  </span>
                  <span>({clinic.ratingCount} รีวิว)</span>
                </span>
                {clinic.district && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[color:var(--color-gold)]" />
                    {clinic.district}
                    {clinic.province && ` · ${clinic.province}`}
                  </span>
                )}
                {clinic.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[color:var(--color-gold)]" />
                    {clinic.phone}
                  </span>
                )}
              </div>
            </header>

            <section className="mt-10">
              <h2 className="mb-4 text-[1.15rem] font-bold lg:text-[1.4rem]">
                แคมเปญที่เปิดอยู่
              </h2>
              {campaigns.length === 0 ? (
                <p className="text-[0.9rem] text-[color:var(--color-muted)]">
                  ยังไม่มีแคมเปญที่เปิดอยู่ในขณะนี้
                </p>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((c) => (
                    <article
                      key={c.id}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 transition-colors hover:border-[color:var(--color-gold-muted)]"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold lg:text-[1.05rem]">{c.title}</h3>
                        {c.description && (
                          <p className="mt-1.5 text-[0.85rem] text-[color:var(--color-muted-strong)]">
                            {c.description}
                          </p>
                        )}
                        {c.isFeatured && (
                          <span className="mt-2 inline-block rounded-full border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/5 px-2.5 py-0.5 text-[0.7rem] text-[color:var(--color-gold-bright)]">
                            🔥 โปรร้อน
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {c.normalPrice && (
                          <div className="text-[0.78rem] text-[color:var(--color-muted)] line-through">
                            {formatBaht(Number(c.normalPrice))}
                          </div>
                        )}
                        {c.promoPrice && (
                          <div className="font-display text-[1.25rem] font-bold text-[color:var(--color-gold-bright)]">
                            {formatBaht(Number(c.promoPrice))} ฿
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </article>

          {/* Lead form sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <LeadForm
                campaigns={campaigns.map((c) => ({
                  id: c.id,
                  title: c.title,
                  promoPrice: c.promoPrice,
                }))}
                saleId={ref ?? null}
                defaultCampaignId={campaignParam ?? null}
              />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
