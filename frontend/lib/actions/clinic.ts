"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  db,
  users,
  clinicProfiles,
  campaigns,
  leads,
  commissions,
} from "@/db";

// ═══════════════════════════════════════════════════════════════════════════
// Clinic signup (FR-20)
// ═══════════════════════════════════════════════════════════════════════════
export type ClinicSignupState =
  | { ok: false; error: string; fields?: Record<string, string> }
  | { ok: true };

export async function signupClinic(
  _prev: ClinicSignupState | null,
  fd: FormData,
): Promise<ClinicSignupState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const clinicName  = String(fd.get("clinic_name") || "").trim();
  const licenseNo   = String(fd.get("license_no") || "").trim();
  const phone       = String(fd.get("phone") || "").trim();
  const address     = String(fd.get("address") || "").trim();
  const province    = String(fd.get("province") || "").trim();
  const district    = String(fd.get("district") || "").trim();
  const lineOfficial = String(fd.get("line_official") || "").trim();
  const facebookUrl = String(fd.get("facebook_url") || "").trim();
  const instagramUrl = String(fd.get("instagram_url") || "").trim();

  const fields: Record<string, string> = {};
  if (!clinicName || clinicName.length < 2)  fields.clinic_name = "ชื่อคลินิกอย่างน้อย 2 ตัวอักษร";
  if (!/^[0-9+\-\s]{7,20}$/.test(phone))     fields.phone = "เบอร์โทรไม่ถูกต้อง";
  if (!province)                              fields.province = "กรอกจังหวัด";

  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "กรอกข้อมูลไม่ครบ", fields };
  }

  const existing = await db.query.clinicProfiles.findFirst({
    where: eq(clinicProfiles.userId, session.user.id),
    columns: { id: true },
  });
  if (existing) return { ok: false, error: "คุณลงทะเบียนคลินิกไปแล้ว" };

  await db.transaction(async (tx) => {
    await tx.insert(clinicProfiles).values({
      userId: session.user.id,
      clinicName,
      licenseNo: licenseNo || null,
      phone,
      address: address || null,
      province,
      district: district || null,
      lineOfficial: lineOfficial || null,
      facebookUrl: facebookUrl || null,
      instagramUrl: instagramUrl || null,
      status: "pending",
    });
    await tx.update(users)
      .set({ role: "clinic", phone, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));
  });

  revalidatePath("/clinic");
  redirect("/clinic");
}

// ═══════════════════════════════════════════════════════════════════════════
// Create campaign (FR-22, FR-21 requires approved clinic)
// ═══════════════════════════════════════════════════════════════════════════
export type CampaignFormState =
  | { ok: false; error: string; fields?: Record<string, string> }
  | { ok: true; campaignId: string };

export async function createCampaign(
  _prev: CampaignFormState | null,
  fd: FormData,
): Promise<CampaignFormState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const clinic = await db.query.clinicProfiles.findFirst({
    where: and(
      eq(clinicProfiles.userId, session.user.id),
      eq(clinicProfiles.status, "approved"),
    ),
  });
  if (!clinic) {
    return { ok: false, error: "คลินิกของคุณยังไม่ได้รับการอนุมัติ — สร้างแคมเปญไม่ได้" };
  }

  const title       = String(fd.get("title") || "").trim();
  const description = String(fd.get("description") || "").trim();
  const normalPriceRaw = String(fd.get("normal_price") || "").trim();
  const promoPriceRaw  = String(fd.get("promo_price") || "").trim();
  const commissionRaw  = String(fd.get("commission_per_success") || "").trim();
  const startDateRaw   = String(fd.get("start_date") || "").trim();
  const endDateRaw     = String(fd.get("end_date") || "").trim();
  const maxSlotsRaw    = String(fd.get("max_slots") || "").trim();

  const fields: Record<string, string> = {};
  if (!title || title.length < 2) fields.title = "ชื่อแคมเปญอย่างน้อย 2 ตัวอักษร";

  const normalPrice = normalPriceRaw ? Number(normalPriceRaw) : null;
  const promoPrice  = promoPriceRaw  ? Number(promoPriceRaw)  : null;
  const commission  = Number(commissionRaw);

  if (!commissionRaw || isNaN(commission) || commission < 0)
    fields.commission_per_success = "ค่าคอมต้องเป็นจำนวนเต็มหรือทศนิยม >= 0";
  if (normalPrice !== null && (isNaN(normalPrice) || normalPrice < 0))
    fields.normal_price = "ราคาปกติต้อง >= 0";
  if (promoPrice !== null && (isNaN(promoPrice) || promoPrice < 0))
    fields.promo_price = "ราคาโปรต้อง >= 0";
  if (normalPrice !== null && promoPrice !== null && promoPrice > normalPrice)
    fields.promo_price = "ราคาโปรต้องน้อยกว่าหรือเท่ากับราคาปกติ";

  const maxSlots = maxSlotsRaw ? Number(maxSlotsRaw) : null;
  if (maxSlots !== null && (isNaN(maxSlots) || maxSlots < 1 || !Number.isInteger(maxSlots)))
    fields.max_slots = "จำนวนสล็อตต้องเป็นจำนวนเต็มบวก";

  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "กรอกข้อมูลไม่ครบหรือไม่ถูกต้อง", fields };
  }

  const [created] = await db
    .insert(campaigns)
    .values({
      clinicId: clinic.id,
      title,
      description: description || null,
      normalPrice: normalPrice !== null ? normalPrice.toFixed(2) : null,
      promoPrice: promoPrice !== null ? promoPrice.toFixed(2) : null,
      commissionPerSuccess: commission.toFixed(2),
      maxSlots,
      startDate: startDateRaw || null,
      endDate: endDateRaw || null,
      isActive: true,
    })
    .returning({ id: campaigns.id });

  revalidatePath("/clinic");
  revalidatePath("/clinic/campaigns");
  revalidatePath("/");
  return { ok: true, campaignId: created.id };
}

// ═══════════════════════════════════════════════════════════════════════════
// Toggle campaign active (FR-22 — disable)
// ═══════════════════════════════════════════════════════════════════════════
export async function toggleCampaignActive(campaignId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

  const clinic = await db.query.clinicProfiles.findFirst({
    where: eq(clinicProfiles.userId, session.user.id),
    columns: { id: true },
  });
  if (!clinic) return { ok: false, error: "ไม่พบคลินิก" };

  const c = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
    columns: { id: true, clinicId: true, isActive: true },
  });
  if (!c || c.clinicId !== clinic.id)
    return { ok: false, error: "ไม่มีสิทธิ์แก้แคมเปญนี้" };

  await db.update(campaigns)
    .set({ isActive: !c.isActive, updatedAt: new Date() })
    .where(eq(campaigns.id, campaignId));

  revalidatePath("/clinic/campaigns");
  revalidatePath("/clinic");
  revalidatePath("/");
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// Update lead status (FR-24) + auto-create commission on success (FR-25)
// ═══════════════════════════════════════════════════════════════════════════
const LEAD_STATUSES = ["new", "contacted", "success", "failed"] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];

export async function updateLeadStatus(
  leadId: string,
  newStatus: LeadStatus,
): Promise<{ ok: boolean; error?: string; commissionCreated?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

  if (!LEAD_STATUSES.includes(newStatus))
    return { ok: false, error: "สถานะไม่ถูกต้อง" };

  const clinic = await db.query.clinicProfiles.findFirst({
    where: eq(clinicProfiles.userId, session.user.id),
    columns: { id: true },
  });
  if (!clinic) return { ok: false, error: "ไม่พบคลินิก" };

  // Verify the lead belongs to one of this clinic's campaigns
  const lead = await db
    .select({
      id: leads.id,
      status: leads.status,
      saleId: leads.saleId,
      campaignClinicId: campaigns.clinicId,
      commissionAmount: campaigns.commissionPerSuccess,
    })
    .from(leads)
    .innerJoin(campaigns, eq(campaigns.id, leads.campaignId))
    .where(eq(leads.id, leadId))
    .limit(1);

  if (lead.length === 0) return { ok: false, error: "ไม่พบ lead" };
  const l = lead[0];
  if (l.campaignClinicId !== clinic.id)
    return { ok: false, error: "ไม่มีสิทธิ์แก้ lead นี้" };

  // Business rule: once success, can't be changed (matches Flask audit)
  if (l.status === "success" && newStatus !== "success")
    return { ok: false, error: "เปลี่ยนสถานะจาก success ไม่ได้" };

  let commissionCreated = false;

  try {
    await db.transaction(async (tx) => {
      await tx.update(leads)
        .set({
          status: newStatus,
          statusUpdatedAt: new Date(),
          statusUpdatedBy: session.user.id,
        })
        .where(eq(leads.id, leadId));

      if (newStatus === "success") {
        // Idempotent: only create if no existing commission for this lead
        const existing = await tx.query.commissions.findFirst({
          where: eq(commissions.leadId, leadId),
          columns: { id: true },
        });
        if (!existing) {
          await tx.insert(commissions).values({
            saleId: l.saleId,
            leadId,
            amount: l.commissionAmount,
            status: "pending",
          });
          commissionCreated = true;
        }
      }
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }

  revalidatePath("/clinic");
  revalidatePath("/clinic/leads");
  revalidatePath("/sale"); // sale will see new pending commission
  return { ok: true, commissionCreated };
}
