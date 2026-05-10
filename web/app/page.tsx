import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { SearchBar } from "@/components/home/search-bar";
import { LocationRow } from "@/components/home/location-row";
import { Categories } from "@/components/home/categories";
import { TierFilter } from "@/components/home/tier-filter";
import { ClinicCard } from "@/components/home/clinic-card";
import { BottomNav } from "@/components/home/bottom-nav";
import { getDiscoveryClinics } from "@/lib/queries/home";

export const revalidate = 60; // ISR: rebuild every 60s

export default async function HomePage() {
  const clinics = await getDiscoveryClinics();

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />
      <Hero />
      <SearchBar />
      <LocationRow />
      <Categories />
      <TierFilter />

      <section className="space-y-3 px-5 pt-3 pb-2">
        {clinics.length === 0 ? (
          <p className="py-12 text-center text-[0.9rem] text-[color:var(--color-muted)]">
            ยังไม่มีคลินิกในระบบ
          </p>
        ) : (
          clinics.map((c) => <ClinicCard key={c.id} clinic={c} />)
        )}
      </section>

      <BottomNav />
    </main>
  );
}
