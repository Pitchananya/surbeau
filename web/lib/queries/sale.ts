import { and, desc, eq, sql, sum } from "drizzle-orm";
import { db, saleProfiles, leads, commissions, payoutRequests, campaigns } from "@/db";

export async function getSaleByUserId(userId: string) {
  return db.query.saleProfiles.findFirst({
    where: eq(saleProfiles.userId, userId),
  });
}

export type SaleSummary = {
  saleId: string;
  status: "pending" | "approved" | "rejected" | "blocked";
  leads: { total: number; new: number; contacted: number; success: number; failed: number };
  commissions: { total: number; pending: number; approved: number; awaiting_payout: number; paid: number };
  pendingPayout: { id: string; amount: number; createdAt: Date } | null;
};

export async function getSaleSummary(userId: string): Promise<SaleSummary | null> {
  const sale = await getSaleByUserId(userId);
  if (!sale) return null;

  // Lead counts grouped by status — single round-trip
  const leadStats = await db
    .select({
      status: leads.status,
      count: sql<number>`count(*)::int`,
    })
    .from(leads)
    .where(eq(leads.saleId, sale.id))
    .groupBy(leads.status);

  // Commission sums grouped by status
  const comStats = await db
    .select({
      status: commissions.status,
      total: sum(commissions.amount).mapWith(Number),
    })
    .from(commissions)
    .where(eq(commissions.saleId, sale.id))
    .groupBy(commissions.status);

  const pending = await db.query.payoutRequests.findFirst({
    where: and(eq(payoutRequests.saleId, sale.id), eq(payoutRequests.status, "pending")),
    orderBy: [desc(payoutRequests.createdAt)],
  });

  const leadCounts = { total: 0, new: 0, contacted: 0, success: 0, failed: 0 };
  for (const r of leadStats) {
    leadCounts[r.status as keyof typeof leadCounts] = r.count;
    leadCounts.total += r.count;
  }

  const comTotals = { total: 0, pending: 0, approved: 0, awaiting_payout: 0, paid: 0 };
  for (const r of comStats) {
    if (r.status === "cancelled") continue;
    const v = r.total ?? 0;
    comTotals[r.status as keyof typeof comTotals] = v;
    comTotals.total += v;
  }

  return {
    saleId: sale.id,
    status: sale.status,
    leads: leadCounts,
    commissions: comTotals,
    pendingPayout: pending
      ? { id: pending.id, amount: Number(pending.amount), createdAt: pending.createdAt }
      : null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Sale's leads (paginated)
// ═══════════════════════════════════════════════════════════════════════════
export async function getSaleLeads(saleId: string, limit = 20) {
  return db
    .select({
      id: leads.id,
      customerName: leads.customerName,
      customerPhone: leads.customerPhone,
      status: leads.status,
      createdAt: leads.createdAt,
      campaignTitle: campaigns.title,
    })
    .from(leads)
    .leftJoin(campaigns, eq(campaigns.id, leads.campaignId))
    .where(eq(leads.saleId, saleId))
    .orderBy(desc(leads.createdAt))
    .limit(limit);
}

// ═══════════════════════════════════════════════════════════════════════════
// Sale's payout history
// ═══════════════════════════════════════════════════════════════════════════
export async function getSalePayoutHistory(saleId: string, limit = 10) {
  return db.query.payoutRequests.findMany({
    where: eq(payoutRequests.saleId, saleId),
    orderBy: [desc(payoutRequests.createdAt)],
    limit,
  });
}
