import { and, desc, eq, sql, sum } from "drizzle-orm";
import {
  db,
  users,
  saleProfiles,
  clinicProfiles,
  campaigns,
  leads,
  commissions,
  payoutRequests,
  candidateProfiles,
  memberships,
} from "@/db";

export type AdminSummary = {
  users: { total: number; sale: number; clinic: number; admin: number; customer: number };
  pendingApprovals: { sales: number; clinics: number };
  campaignsActive: number;
  leadsTotal: number;
  leadsToday: number;
  leadsSuccess: number;
  commissionsPending: number;
  commissionsPaid: number;
  payoutRequestsPending: number;
};

export async function getAdminSummary(): Promise<AdminSummary> {
  const userStats = await db
    .select({
      role: users.role,
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .groupBy(users.role);

  const userCounts = { total: 0, sale: 0, clinic: 0, admin: 0, customer: 0 };
  for (const r of userStats) {
    userCounts[r.role as keyof typeof userCounts] = r.count;
    userCounts.total += r.count;
  }

  const [{ pendingSales }] = await db
    .select({ pendingSales: sql<number>`count(*)::int` })
    .from(saleProfiles)
    .where(eq(saleProfiles.status, "pending"));

  const [{ pendingClinics }] = await db
    .select({ pendingClinics: sql<number>`count(*)::int` })
    .from(clinicProfiles)
    .where(eq(clinicProfiles.status, "pending"));

  const [{ campaignsActive }] = await db
    .select({ campaignsActive: sql<number>`count(*)::int` })
    .from(campaigns)
    .where(eq(campaigns.isActive, true));

  const [{ leadsTotal }] = await db
    .select({ leadsTotal: sql<number>`count(*)::int` })
    .from(leads);

  const [{ leadsToday }] = await db
    .select({ leadsToday: sql<number>`count(*)::int` })
    .from(leads)
    .where(sql`date(${leads.createdAt}) = current_date`);

  const [{ leadsSuccess }] = await db
    .select({ leadsSuccess: sql<number>`count(*)::int` })
    .from(leads)
    .where(eq(leads.status, "success"));

  const comStats = await db
    .select({
      status: commissions.status,
      total: sum(commissions.amount).mapWith(Number),
    })
    .from(commissions)
    .groupBy(commissions.status);

  let commissionsPending = 0;
  let commissionsPaid = 0;
  for (const r of comStats) {
    if (r.status === "pending" || r.status === "approved" || r.status === "awaiting_payout")
      commissionsPending += r.total ?? 0;
    else if (r.status === "paid") commissionsPaid += r.total ?? 0;
  }

  const [{ payoutRequestsPending }] = await db
    .select({ payoutRequestsPending: sql<number>`count(*)::int` })
    .from(payoutRequests)
    .where(eq(payoutRequests.status, "pending"));

  return {
    users: userCounts,
    pendingApprovals: { sales: pendingSales, clinics: pendingClinics },
    campaignsActive,
    leadsTotal,
    leadsToday,
    leadsSuccess,
    commissionsPending,
    commissionsPaid,
    payoutRequestsPending,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Pending Sales (FR-31)
// ═══════════════════════════════════════════════════════════════════════════
export async function getPendingSales() {
  return db
    .select({
      saleId: saleProfiles.id,
      userId: saleProfiles.userId,
      status: saleProfiles.status,
      bankName: saleProfiles.bankName,
      bankAccountNo: saleProfiles.bankAccountNo,
      promptpay: saleProfiles.promptpay,
      bio: saleProfiles.bio,
      createdAt: saleProfiles.createdAt,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.phone,
    })
    .from(saleProfiles)
    .innerJoin(users, eq(users.id, saleProfiles.userId))
    .where(eq(saleProfiles.status, "pending"))
    .orderBy(desc(saleProfiles.createdAt));
}

// ═══════════════════════════════════════════════════════════════════════════
// Pending Clinics (FR-31)
// ═══════════════════════════════════════════════════════════════════════════
export async function getPendingClinics() {
  return db
    .select({
      clinicId: clinicProfiles.id,
      userId: clinicProfiles.userId,
      status: clinicProfiles.status,
      clinicName: clinicProfiles.clinicName,
      licenseNo: clinicProfiles.licenseNo,
      province: clinicProfiles.province,
      district: clinicProfiles.district,
      phone: clinicProfiles.phone,
      lineOfficial: clinicProfiles.lineOfficial,
      tier: clinicProfiles.subscriptionTier,
      createdAt: clinicProfiles.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(clinicProfiles)
    .innerJoin(users, eq(users.id, clinicProfiles.userId))
    .where(eq(clinicProfiles.status, "pending"))
    .orderBy(desc(clinicProfiles.createdAt));
}

// All approved/active clinics (for tier management)
export async function getApprovedClinics(limit = 50) {
  return db
    .select({
      clinicId: clinicProfiles.id,
      clinicName: clinicProfiles.clinicName,
      province: clinicProfiles.province,
      tier: clinicProfiles.subscriptionTier,
      ratingAvg: clinicProfiles.ratingAvg,
      ratingCount: clinicProfiles.ratingCount,
    })
    .from(clinicProfiles)
    .where(eq(clinicProfiles.status, "approved"))
    .orderBy(desc(clinicProfiles.subscriptionTier), desc(clinicProfiles.ratingAvg))
    .limit(limit);
}

// ═══════════════════════════════════════════════════════════════════════════
// Pending payouts (FR-34)
// ═══════════════════════════════════════════════════════════════════════════
export async function getPendingPayouts() {
  return db
    .select({
      payoutId: payoutRequests.id,
      saleId: payoutRequests.saleId,
      amount: payoutRequests.amount,
      bankName: payoutRequests.bankName,
      bankAccountNo: payoutRequests.bankAccountNo,
      bankAccountName: payoutRequests.bankAccountName,
      promptpay: payoutRequests.promptpay,
      note: payoutRequests.note,
      createdAt: payoutRequests.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(payoutRequests)
    .innerJoin(saleProfiles, eq(saleProfiles.id, payoutRequests.saleId))
    .innerJoin(users, eq(users.id, saleProfiles.userId))
    .where(eq(payoutRequests.status, "pending"))
    .orderBy(desc(payoutRequests.createdAt));
}

// ═══════════════════════════════════════════════════════════════════════════
// Users list (FR-32)
// ═══════════════════════════════════════════════════════════════════════════
export async function getUsers(filter?: {
  role?: "admin" | "sale" | "clinic" | "customer" | "candidate";
  status?: "active" | "pending" | "blocked";
}) {
  const conditions = [];
  if (filter?.role)   conditions.push(eq(users.role, filter.role));
  if (filter?.status) conditions.push(eq(users.status, filter.status));

  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(100);
}

// ═══════════════════════════════════════════════════════════════════════════
// Candidates for KYC review (Phase 2)
// ═══════════════════════════════════════════════════════════════════════════
export async function getCandidatesForKYC(filter?: { verified?: boolean }) {
  const conditions = [];
  if (filter?.verified !== undefined) {
    conditions.push(eq(candidateProfiles.isVerified, filter.verified));
  }

  return db
    .select({
      candidateId: candidateProfiles.id,
      userId: candidateProfiles.userId,
      headline: candidateProfiles.headline,
      bio: candidateProfiles.bio,
      experienceYears: candidateProfiles.experienceYears,
      skills: candidateProfiles.skills,
      specialties: candidateProfiles.specialties,
      licenseFiles: candidateProfiles.licenseFiles,
      portfolio: candidateProfiles.portfolio,
      isVerified: candidateProfiles.isVerified,
      createdAt: candidateProfiles.createdAt,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.phone,
    })
    .from(candidateProfiles)
    .innerJoin(users, eq(users.id, candidateProfiles.userId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(candidateProfiles.createdAt))
    .limit(100);
}

// ═══════════════════════════════════════════════════════════════════════════
// Pending memberships (Phase 2)
// ═══════════════════════════════════════════════════════════════════════════
export async function getPendingMemberships() {
  return db
    .select({
      membershipId: memberships.id,
      userId: memberships.userId,
      plan: memberships.plan,
      amount: memberships.amount,
      paymentMethod: memberships.paymentMethod,
      paymentRef: memberships.paymentRef,
      expiresAt: memberships.expiresAt,
      createdAt: memberships.createdAt,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.phone,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.status, "pending"))
    .orderBy(desc(memberships.createdAt));
}
