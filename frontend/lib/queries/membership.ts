import { and, desc, eq, gt, or, sql } from "drizzle-orm";
import { db, memberships } from "@/db";

export type ActiveMembershipSummary = {
  id: string;
  plan: "free" | "premium_year";
  status: "pending" | "active" | "expired" | "cancelled";
  amount: number;
  paidAt: Date;
  expiresAt: Date;
  daysLeft: number;
};

export async function getActiveOrPendingMembership(userId: string): Promise<ActiveMembershipSummary | null> {
  const m = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, userId),
      or(eq(memberships.status, "active"), eq(memberships.status, "pending")),
    ),
    orderBy: [desc(memberships.createdAt)],
  });
  if (!m) return null;

  const daysLeft = Math.max(
    0,
    Math.ceil((m.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
  );

  return {
    id: m.id,
    plan: m.plan,
    status: m.status,
    amount: Number(m.amount),
    paidAt: m.paidAt,
    expiresAt: m.expiresAt,
    daysLeft,
  };
}
