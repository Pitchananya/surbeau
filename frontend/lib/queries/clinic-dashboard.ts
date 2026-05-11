import { and, desc, eq, inArray, sql, sum } from "drizzle-orm";
import { db, clinicProfiles, campaigns, leads, commissions } from "@/db";

export async function getClinicByUserId(userId: string) {
  return db.query.clinicProfiles.findFirst({
    where: eq(clinicProfiles.userId, userId),
  });
}

export type ClinicSummary = {
  clinicId: string;
  status: "pending" | "approved" | "rejected" | "blocked";
  clinicName: string;
  tier: "free" | "verified" | "premier";
  campaigns: { total: number; active: number };
  leads: { total: number; new: number; contacted: number; success: number; failed: number };
  commissionTotalDue: number;
  conversionRate: number;
};

export async function getClinicSummary(userId: string): Promise<ClinicSummary | null> {
  const clinic = await getClinicByUserId(userId);
  if (!clinic) return null;

  // Campaign counts
  const [campStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`sum(case when ${campaigns.isActive} then 1 else 0 end)::int`,
    })
    .from(campaigns)
    .where(eq(campaigns.clinicId, clinic.id));

  // Lead counts by status — join via this clinic's campaigns
  const myCampaigns = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(eq(campaigns.clinicId, clinic.id));
  const campaignIds = myCampaigns.map((c) => c.id);

  let leadCounts = { total: 0, new: 0, contacted: 0, success: 0, failed: 0 };
  let commissionTotalDue = 0;

  if (campaignIds.length > 0) {
    const leadStats = await db
      .select({
        status: leads.status,
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .where(inArray(leads.campaignId, campaignIds))
      .groupBy(leads.status);

    for (const r of leadStats) {
      leadCounts[r.status as keyof typeof leadCounts] = r.count;
      leadCounts.total += r.count;
    }

    // Total commission owed (pending + approved + awaiting_payout + paid)
    const [{ total }] = await db
      .select({ total: sum(commissions.amount).mapWith(Number) })
      .from(commissions)
      .innerJoin(leads, eq(leads.id, commissions.leadId))
      .where(inArray(leads.campaignId, campaignIds));
    commissionTotalDue = total ?? 0;
  }

  const conversionRate =
    leadCounts.total > 0 ? Math.round((leadCounts.success / leadCounts.total) * 1000) / 10 : 0;

  return {
    clinicId: clinic.id,
    status: clinic.status,
    clinicName: clinic.clinicName,
    tier: clinic.subscriptionTier,
    campaigns: {
      total: campStats?.total ?? 0,
      active: campStats?.active ?? 0,
    },
    leads: leadCounts,
    commissionTotalDue,
    conversionRate,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Campaign list with lead counts (FR-22, FR-26)
// ═══════════════════════════════════════════════════════════════════════════
export async function getClinicCampaigns(clinicId: string) {
  return db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      normalPrice: campaigns.normalPrice,
      promoPrice: campaigns.promoPrice,
      commissionPerSuccess: campaigns.commissionPerSuccess,
      isActive: campaigns.isActive,
      isFeatured: campaigns.isFeatured,
      createdAt: campaigns.createdAt,
      leadCount: sql<number>`(select count(*)::int from leads where leads.campaign_id = ${campaigns.id})`.as("lead_count"),
      successCount: sql<number>`(select count(*)::int from leads where leads.campaign_id = ${campaigns.id} and leads.status = 'success')`.as("success_count"),
    })
    .from(campaigns)
    .where(eq(campaigns.clinicId, clinicId))
    .orderBy(desc(campaigns.createdAt));
}

// ═══════════════════════════════════════════════════════════════════════════
// Leads across all of this clinic's campaigns (FR-23)
// ═══════════════════════════════════════════════════════════════════════════
export async function getClinicLeads(clinicId: string, limit = 50) {
  const myCampaigns = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(eq(campaigns.clinicId, clinicId));
  const campaignIds = myCampaigns.map((c) => c.id);
  if (campaignIds.length === 0) return [];

  return db
    .select({
      id: leads.id,
      customerName: leads.customerName,
      customerPhone: leads.customerPhone,
      note: leads.note,
      status: leads.status,
      createdAt: leads.createdAt,
      campaignTitle: campaigns.title,
      campaignId: campaigns.id,
    })
    .from(leads)
    .innerJoin(campaigns, eq(campaigns.id, leads.campaignId))
    .where(inArray(leads.campaignId, campaignIds))
    .orderBy(desc(leads.createdAt))
    .limit(limit);
}
