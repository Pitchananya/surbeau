import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { SearchBar } from "@/components/home/search-bar";
import { LocationRow } from "@/components/home/location-row";
import { Categories } from "@/components/home/categories";
import { TierFilter } from "@/components/home/tier-filter";
import { ClinicCard } from "@/components/home/clinic-card";
import { BottomNav } from "@/components/home/bottom-nav";
import { Footer } from "@/components/home/footer";
import { getDiscoveryClinics } from "@/lib/queries/home";

export const revalidate = 60;

export default async function HomePage() {
  const clinics = await getDiscoveryClinics();

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />

      <div className="mx-auto w-full max-w-md lg:max-w-none">
        <Hero />
        <SearchBar />
        <LocationRow />
        <Categories />
        <TierFilter />

        <section className="space-y-3 px-5 pt-3 pb-2 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-6 lg:space-y-0 lg:px-8 lg:pt-8 lg:pb-16">
          {clinics.length === 0 ? (
            <p className="py-12 text-center text-[0.9rem] text-[color:var(--color-muted)] lg:col-span-3">
              ยังไม่มีคลินิกในระบบ
            </p>
          ) : (
            clinics.map((c) => <ClinicCard key={c.id} clinic={c} />)
          )}
        </section>
      </div>

      <BottomNav />
      <Footer />
    </main>
  );
}
