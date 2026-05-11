import { and, desc, eq, gte, ilike, inArray, lte, or, sql, type SQL } from "drizzle-orm";
import { db, campaigns, clinicProfiles } from "@/db";
import type { ClinicCardData, ClinicBadge } from "@/lib/types";

const TIER_GRADIENT: Record<string, string> = {
  premier:  "linear-gradient(135deg, #2a1538 0%, #4a1a55 50%, #1d0d28 100%)",
  verified: "linear-gradient(135deg, #1a2818 0%, #2d3a25 50%, #0f1a0d 100%)",
  free:     "linear-gradient(135deg, #1a1a1a 0%, #262626 50%, #0d0d0d 100%)",
};

const ALT_PREMIER = "linear-gradient(135deg, #0d2438 0%, #1a3a55 50%, #0a1a2a 100%)";

// Category → keyword list for fuzzy title matching (FR-02)
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  botox:     ["โบท็อกซ์", "botox", "filler", "ฟิลเลอร์"],
  laser:     ["เลเซอร์", "laser", "หน้าใส"],
  nose:      ["จมูก", "rhinoplasty", "nose"],
  eye:       ["ตา 2 ชั้น", "ตา", "eye"],
  acne:      ["สิว", "acne", "หลุมสิว"],
  slimming:  ["สลายไขมัน", "slimming", "ลดน้ำหนัก", "สัดส่วน"],
  treatment: ["ทรีตเมนต์", "treatment", "ผิวหน้า"],
  dental:    ["ทันตกรรม", "dental", "ฟัน", "จัดฟัน"],
  lifting:   ["ยกกระชับ", "lifting", "facelift", "v-line"],
  skin:      ["ผิว", "skin", "whitening", "ขาว", "กระ"],
};

export type DiscoveryFilters = {
  q?: string;
  province?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tier?: "free" | "verified" | "premier";
  sort?: "featured" | "rating" | "price_asc" | "price_desc";
};

/**
 * Discover approved clinics with active campaigns.
 * One row per clinic — cheapest promo price drives "from" price.
 */
export async function getDiscoveryClinics(
  filters: DiscoveryFilters = {},
  limit = 12,
): Promise<ClinicCardData[]> {
  const conditions: SQL[] = [eq(clinicProfiles.status, "approved")];

  if (filters.tier) {
    conditions.push(eq(clinicProfiles.subscriptionTier, filters.tier));
  }
  if (filters.province) {
    conditions.push(ilike(clinicProfiles.province, `%${filters.province}%`));
  }
  if (filters.q) {
    const like = `%${filters.q}%`;
    const cond = or(
      ilike(clinicProfiles.clinicName, like),
      ilike(campaigns.title, like),
      ilike(campaigns.description, like),
    );
    if (cond) conditions.push(cond);
  }
  if (filters.category && CATEGORY_KEYWORDS[filters.category]) {
    const keywords = CATEGORY_KEYWORDS[filters.category];
    const cond = or(...keywords.map((kw) => ilike(campaigns.title, `%${kw}%`)));
    if (cond) conditions.push(cond);
  }
  if (filters.minPrice !== undefined && !Number.isNaN(filters.minPrice)) {
    conditions.push(gte(campaigns.promoPrice, filters.minPrice.toFixed(2)));
  }
  if (filters.maxPrice !== undefined && !Number.isNaN(filters.maxPrice)) {
    conditions.push(lte(campaigns.promoPrice, filters.maxPrice.toFixed(2)));
  }

  // Sort: tier weight is primary unless user asked for a specific sort
  const tierWeight = sql`case ${clinicProfiles.subscriptionTier}
    when 'premier'  then 3
    when 'verified' then 2
    else 1 end`;

  let orderBy;
  switch (filters.sort) {
    case "price_asc":
      orderBy = [
        desc(tierWeight),
        sql`min(${campaigns.promoPrice}) asc nulls last`,
      ];
      break;
    case "price_desc":
      orderBy = [desc(tierWeight), sql`min(${campaigns.promoPrice}) desc nulls last`];
      break;
    case "rating":
      orderBy = [desc(clinicProfiles.ratingAvg), desc(tierWeight)];
      break;
    default:
      orderBy = [desc(tierWeight), desc(clinicProfiles.ratingAvg)];
  }

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
    .where(and(...conditions))
    .groupBy(clinicProfiles.id)
    .orderBy(...orderBy)
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
      distanceKm: 0.4 + i * 0.6,
      district: r.district ?? "",
      tags: tagsForTier(tier, i),
      badges,
      imageGradient:
        tier === "premier" && i === 1 ? ALT_PREMIER : TIER_GRADIENT[tier],
    };
  });
}

// Distinct list of provinces for filter dropdown
export async function getProvinces(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ province: clinicProfiles.province })
    .from(clinicProfiles)
    .where(eq(clinicProfiles.status, "approved"));
  return rows
    .map((r) => r.province)
    .filter((p): p is string => p !== null && p !== "")
    .sort();
}

function tagsForTier(tier: string, i: number): string[] {
  if (tier === "premier") return i === 0 ? ["โบท็อกซ์", "ฟิลเลอร์"] : ["เลเซอร์", "คอร์ส 3 ครั้ง"];
  if (tier === "verified") return ["ศัลยกรรม", "ผ่อน 10 เดือน"];
  return ["ทรีตเมนต์"];
}
