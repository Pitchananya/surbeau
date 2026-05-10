import { and, desc, eq } from "drizzle-orm";
import { db, campaigns, clinicProfiles } from "@/db";

export async function getClinicWithCampaigns(clinicId: string) {
  const clinic = await db.query.clinicProfiles.findFirst({
    where: and(eq(clinicProfiles.id, clinicId), eq(clinicProfiles.status, "approved")),
  });
  if (!clinic) return null;

  const list = await db.query.campaigns.findMany({
    where: and(eq(campaigns.clinicId, clinicId), eq(campaigns.isActive, true)),
    orderBy: [desc(campaigns.isFeatured), desc(campaigns.createdAt)],
  });

  return { clinic, campaigns: list };
}
