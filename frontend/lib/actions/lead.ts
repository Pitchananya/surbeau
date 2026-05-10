"use server";

import { and, eq } from "drizzle-orm";
import { db, leads, campaigns, saleProfiles } from "@/db";
import { revalidatePath } from "next/cache";

export type LeadFormState =
  | { ok: false; error: string; fields?: Record<string, string> }
  | { ok: true; leadId: string };

export async function createLead(_prev: LeadFormState | null, fd: FormData): Promise<LeadFormState> {
  const campaignId    = String(fd.get("campaign_id") || "").trim();
  const saleId        = String(fd.get("sale_id") || "").trim();
  const customerName  = String(fd.get("customer_name") || "").trim();
  const customerPhone = String(fd.get("customer_phone") || "").trim();
  const note          = String(fd.get("note") || "").trim();

  const fields: Record<string, string> = {};
  if (!campaignId)                                fields.campaign_id = "ต้องระบุแคมเปญ";
  if (!saleId)                                    fields.sale_id = "ต้องเข้าผ่านลิงก์ Sale";
  if (!customerName || customerName.length < 2)   fields.customer_name = "ชื่อต้องอย่างน้อย 2 ตัวอักษร";
  if (!/^[0-9+\-\s]{7,20}$/.test(customerPhone))  fields.customer_phone = "เบอร์ไม่ถูกต้อง";

  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "กรอกข้อมูลไม่ครบหรือไม่ถูกต้อง", fields };
  }

  // verify referenced records are valid + active/approved
  const campaign = await db.query.campaigns.findFirst({
    where: and(eq(campaigns.id, campaignId), eq(campaigns.isActive, true)),
    columns: { id: true, clinicId: true },
  });
  if (!campaign) return { ok: false, error: "แคมเปญไม่พร้อมรับลูกค้า" };

  const sale = await db.query.saleProfiles.findFirst({
    where: and(eq(saleProfiles.id, saleId), eq(saleProfiles.status, "approved")),
    columns: { id: true },
  });
  if (!sale) return { ok: false, error: "ลิงก์ Sale ไม่ถูกต้องหรือยังไม่ได้รับอนุมัติ" };

  const [created] = await db
    .insert(leads)
    .values({
      campaignId,
      saleId,
      customerName: customerName.slice(0, 200),
      customerPhone: customerPhone.slice(0, 50),
      note: note.slice(0, 500) || null,
    })
    .returning({ id: leads.id });

  revalidatePath("/clinic"); // refresh clinic dashboard if any clinic owner is viewing
  return { ok: true, leadId: created.id };
}
