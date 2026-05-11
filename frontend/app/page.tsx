import { Suspense } from "react";
import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { SearchBar } from "@/components/home/search-bar";
import { LocationRow } from "@/components/home/location-row";
import { Categories } from "@/components/home/categories";
import { TierFilter } from "@/components/home/tier-filter";
import { ClinicCard } from "@/components/home/clinic-card";
import { BottomNav } from "@/components/home/bottom-nav";
import { Footer } from "@/components/home/footer";
import { FilterPanel } from "@/components/home/filter-panel";
import {
  getDiscoveryClinics,
  getProvinces,
  type DiscoveryFilters,
} from "@/lib/queries/home";

type SearchParams = Promise<{
  q?: string;
  province?: string;
  category?: string;
  tier?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
}>;

const VALID_TIERS = ["free", "verified", "premier"] as const;
const VALID_SORTS = ["featured", "rating", "price_asc", "price_desc"] as const;

export const dynamic = "force-dynamic";

export default async function HomePage(props: { searchParams: SearchParams }) {
  const sp = await props.searchParams;

  const filters: DiscoveryFilters = {
    q: sp.q?.trim() || undefined,
    province: sp.province?.trim() || undefined,
    category: sp.category?.trim() || undefined,
    tier: VALID_TIERS.includes(sp.tier as (typeof VALID_TIERS)[number])
      ? (sp.tier as (typeof VALID_TIERS)[number])
      : undefined,
    minPrice: sp.min_price ? Number(sp.min_price) : undefined,
    maxPrice: sp.max_price ? Number(sp.max_price) : undefined,
    sort: VALID_SORTS.includes(sp.sort as (typeof VALID_SORTS)[number])
      ? (sp.sort as (typeof VALID_SORTS)[number])
      : undefined,
  };

  const [clinics, provinces] = await Promise.all([
    getDiscoveryClinics(filters, 24),
    getProvinces(),
  ]);

  const hasFilters = !!(
    filters.q || filters.province || filters.category || filters.tier ||
    filters.minPrice !== undefined || filters.maxPrice !== undefined
  );

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md lg:max-w-none">
        <Hero />
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
        <LocationRow />
        <Suspense fallback={null}>
          <Categories />
        </Suspense>
        <Suspense fallback={null}>
          <TierFilter provinces={provinces} />
        </Suspense>

        {/* Desktop: filter sidebar + grid. Mobile: stacked, filter via sheet */}
        <div className="mx-auto w-full max-w-md lg:grid lg:max-w-7xl lg:grid-cols-[260px_1fr] lg:gap-8 lg:px-8 lg:pt-8">
          <Suspense fallback={null}>
            <div className="hidden lg:block">
              <FilterPanel provinces={provinces} />
            </div>
          </Suspense>

          <section className="space-y-3 px-5 pt-3 pb-2 lg:px-0 lg:pt-0 lg:pb-16">
            {hasFilters && (
              <p className="text-[0.85rem] text-[color:var(--color-muted)] lg:text-[0.9rem]">
                พบ <b className="text-[color:var(--color-foreground)]">{clinics.length}</b> คลินิกตรงตามตัวกรอง
              </p>
            )}

            {clinics.length === 0 ? (
              <p className="rounded-2xl border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] py-12 text-center text-[0.9rem] text-[color:var(--color-muted)]">
                {hasFilters
                  ? "ไม่พบคลินิกที่ตรงกับตัวกรอง — ลองล้างตัวกรองหรือเปลี่ยนคำค้น"
                  : "ยังไม่มีคลินิกในระบบ"}
              </p>
            ) : (
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 xl:grid-cols-3">
                {clinics.map((c) => (
                  <ClinicCard key={c.id} clinic={c} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <BottomNav />
      <Footer />
    </main>
  );
}
