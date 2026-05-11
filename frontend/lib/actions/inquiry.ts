"use server";

import { revalidatePath } from "next/cache";
import { db, contactInquiries } from "@/db";

export type InquiryState =
  | { ok: false; error: string; fields?: Record<string, string> }
  | { ok: true };

export async function submitContactSales(
  _prev: InquiryState | null,
  fd: FormData,
): Promise<InquiryState> {
  const name         = String(fd.get("name") || "").trim();
  const clinicName   = String(fd.get("clinic_name") || "").trim();
  const email        = String(fd.get("email") || "").trim();
  const phone        = String(fd.get("phone") || "").trim();
  const planInterest = String(fd.get("plan_interest") || "").trim();
  const message      = String(fd.get("message") || "").trim();

  const fields: Record<string, string> = {};
  if (!name || name.length < 2) fields.name = "ชื่ออย่างน้อย 2 ตัวอักษร";
  if (!clinicName) fields.clinic_name = "กรอกชื่อคลินิก";
  if (!email && !phone) {
    fields.email = "ต้องกรอก email หรือเบอร์อย่างน้อย 1 อย่าง";
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = "รูปแบบ email ไม่ถูกต้อง";
  }
  if (phone && !/^[0-9+\-\s]{7,20}$/.test(phone)) {
    fields.phone = "เบอร์โทรไม่ถูกต้อง";
  }

  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "กรอกข้อมูลไม่ครบ", fields };
  }

  await db.insert(contactInquiries).values({
    kind: planInterest === "premier" ? "clinic_premier" : "clinic_general",
    name: name.slice(0, 200),
    organization: clinicName.slice(0, 200),
    email: email || null,
    phone: phone || null,
    planInterest: planInterest || null,
    message: message.slice(0, 2000) || null,
    status: "new",
  });

  revalidatePath("/admin/inquiries");
  return { ok: true };
}
