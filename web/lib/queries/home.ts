import { and, desc, eq, sql } from "drizzle-orm";
import { db, campaigns, clinicProfiles } from "@/db";
import type { ClinicCardData, ClinicBadge } from "@/lib/types";

const TIER_GRADIENT: Record<string, string> = {
  premier:  "linear-gradient(135deg, #2a1538 0%, #4a1a55 50%, #1d0d28 100%)",
  verified: "linear-gradient(135deg, #1a2818 0%, #2d3a25 50%, #0f1a0d 100%)",
  free:     "linear-gradient(135deg, #1a1a1a 0%, #262626 50%, #0d0d0d 100%)",
};

const ALT_PREMIER = "linear-gradient(135deg, #0d2438 0%, #1a3a55 50%, #0a1a2a 100%)";

/**
 * One row per clinic — its cheapest active campaign drives the displayed
 * "from" price. We aggregate at the SQL level instead of fetching all
 * campaigns and reducing in JS.
 */
export async function getDiscoveryClinics(limit = 12): Promise<ClinicCardData[]> {
  const rows = await db
    .select({
      id:               clinicProfiles.id,
      clinicName:       clinicProfiles.clinicName,
      district:         clinicProfiles.district,
      tier:             clinicProfiles.subscriptionTier,
      ratingAvg:        clinicProfiles.ratingAvg,
      ratingCount:      clinicProfiles.ratingCount,
      cheapestPromo:    sql<string | null>`min(${campaigns.promoPrice})`.as("cheapest_promo"),
      featuredCount:    sql<number>`sum(case when ${campaigns.isFeatured} then 1 else 0 end)::int`.as("featured_count"),
    })
    .from(clinicProfiles)
    .leftJoin(
      campaigns,
      and(eq(campaigns.clinicId, clinicProfiles.id), eq(campaigns.isActive, true)),
    )
    .where(eq(clinicProfiles.status, "approved"))
    .groupBy(clinicProfiles.id)
    .orderBy(
      // premier > verified > free (alphabetical works here: free < verified < premier? No — sort manually)
      desc(sql`case ${clinicProfiles.subscriptionTier}
        when 'premier'  then 3
        when 'verified' then 2
        else 1 end`),
      desc(clinicProfiles.ratingAvg),
    )
    .limit(limit);

  return rows.map((r, i): ClinicCardData => {
    const tier = r.tier as ClinicCardData["tier"];
    const badges: ClinicBadge[] = [];
    if (r.featuredCount > 0) badges.push({ kind: "hot" });
    if (tier === "premier") badges.push({ kind: "installment", months: 0 });
    if (tier === "verified") badges.push({ kind: "installment", months: 10 });
    if (tier === "premier" && i === 0) badges.push({ kind: "book-today" });

    return {
      id: r.id,
      name: r.clinicName,
      tier,
      rating: Number(r.ratingAvg),
      reviewCount: r.ratingCount,
      priceFrom: r.cheapestPromo ? Number(r.cheapestPromo) : 0,
      // distance is set client-side once we have geolocation; placeholder for now
      distanceKm: 0.4 + i * 0.6,
      district: r.district ?? "",
      tags: tagsForTier(tier, i),
      badges,
      imageGradient:
        tier === "premier" && i === 1
          ? ALT_PREMIER
          : TIER_GRADIENT[tier],
    };
  });
}

function tagsForTier(tier: string, i: number): string[] {
  if (tier === "premier") return i === 0 ? ["โบท็อกซ์", "ฟิลเลอร์"] : ["เลเซอร์", "คอร์ส 3 ครั้ง"];
  if (tier === "verified") return ["ศัลยกรรม", "ผ่อน 10 เดือน"];
  return ["ทรีตเมนต์"];
}
