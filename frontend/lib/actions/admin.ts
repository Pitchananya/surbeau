"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  db,
  users,
  saleProfiles,
  clinicProfiles,
  payoutRequests,
  commissions,
} from "@/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("กรุณาเข้าสู่ระบบ");
  if (session.user.role !== "admin") throw new Error("ต้องเป็น Admin เท่านั้น");
  return session.user;
}

type ActionResult = { ok: boolean; error?: string; message?: string };

// ═══════════════════════════════════════════════════════════════════════════
// Sale approval / rejection (FR-31)
// ═══════════════════════════════════════════════════════════════════════════
export async function approveSale(saleId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.update(saleProfiles)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(saleProfiles.id, saleId));
    revalidatePath("/admin");
    revalidatePath("/admin/sales");
    return { ok: true, message: "อนุมัติ Sale แล้ว" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}

export async function rejectSale(saleId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.update(saleProfiles)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(saleProfiles.id, saleId));
    revalidatePath("/admin");
    revalidatePath("/admin/sales");
    return { ok: true, message: "ปฏิเสธ Sale แล้ว" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Clinic approval / rejection / tier (FR-31)
// ═══════════════════════════════════════════════════════════════════════════
export async function approveClinic(clinicId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.update(clinicProfiles)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(clinicProfiles.id, clinicId));
    revalidatePath("/admin");
    revalidatePath("/admin/clinics");
    revalidatePath("/");
    return { ok: true, message: "อนุมัติคลินิกแล้ว" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}

export async function rejectClinic(clinicId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.update(clinicProfiles)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(clinicProfiles.id, clinicId));
    revalidatePath("/admin");
    revalidatePath("/admin/clinics");
    return { ok: true, message: "ปฏิเสธคลินิกแล้ว" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}

export async function setClinicTier(
  clinicId: string,
  tier: "free" | "verified" | "premier",
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!["free", "verified", "premier"].includes(tier))
      return { ok: false, error: "tier ไม่ถูกต้อง" };
    await db.update(clinicProfiles)
      .set({ subscriptionTier: tier, updatedAt: new Date() })
      .where(eq(clinicProfiles.id, clinicId));
    revalidatePath("/admin/clinics");
    revalidatePath("/");
    return { ok: true, message: `เปลี่ยน tier เป็น ${tier}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// User block / unblock (FR-32)
// ═══════════════════════════════════════════════════════════════════════════
export async function setUserStatus(
  userId: string,
  status: "active" | "blocked",
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (userId === admin.id) return { ok: false, error: "ไม่สามารถ block ตัวเอง" };

    // Prevent blocking other admins
    const target = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    });
    if (!target) return { ok: false, error: "ไม่พบผู้ใช้" };
    if (target.role === "admin")
      return { ok: false, error: "ไม่สามารถ block admin คนอื่น" };

    await db.update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId));
    revalidatePath("/admin/users");
    return { ok: true, message: status === "blocked" ? "Block แล้ว" : "Unblock แล้ว" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Payout approval (FR-34) — mark all awaiting_payout commissions as paid
// ═══════════════════════════════════════════════════════════════════════════
export async function approvePayout(payoutId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const payout = await db.query.payoutRequests.findFirst({
      where: eq(payoutRequests.id, payoutId),
    });
    if (!payout) return { ok: false, error: "ไม่พบคำขอ" };
    if (payout.status !== "pending")
      return { ok: false, error: "คำขอนี้ถูกประมวลผลไปแล้ว" };

    let commissionsPaid = 0;
    await db.transaction(async (tx) => {
      await tx.update(payoutRequests)
        .set({
          status: "approved",
          processedAt: new Date(),
          processedBy: admin.id,
        })
        .where(eq(payoutRequests.id, payoutId));

      const updated = await tx.update(commissions)
        .set({
          status: "paid",
          paidAt: new Date(),
          paidBy: admin.id,
        })
        .where(and(
          eq(commissions.saleId, payout.saleId),
          eq(commissions.status, "awaiting_payout"),
        ))
        .returning({ id: commissions.id });
      commissionsPaid = updated.length;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/payouts");
    revalidatePath("/sale");
    revalidatePath("/sale/payout");
    return { ok: true, message: `อนุมัติแล้ว — mark commission ${commissionsPaid} รายการเป็น paid` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}

export async function rejectPayout(payoutId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const payout = await db.query.payoutRequests.findFirst({
      where: eq(payoutRequests.id, payoutId),
    });
    if (!payout) return { ok: false, error: "ไม่พบคำขอ" };
    if (payout.status !== "pending")
      return { ok: false, error: "คำขอนี้ถูกประมวลผลไปแล้ว" };

    let commissionsRestored = 0;
    await db.transaction(async (tx) => {
      await tx.update(payoutRequests)
        .set({
          status: "rejected",
          processedAt: new Date(),
          processedBy: admin.id,
        })
        .where(eq(payoutRequests.id, payoutId));

      // Restore commissions awaiting_payout → approved
      const restored = await tx.update(commissions)
        .set({ status: "approved" })
        .where(and(
          eq(commissions.saleId, payout.saleId),
          eq(commissions.status, "awaiting_payout"),
        ))
        .returning({ id: commissions.id });
      commissionsRestored = restored.length;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/payouts");
    revalidatePath("/sale");
    return { ok: true, message: `ปฏิเสธแล้ว — คืน commission ${commissionsRestored} รายการกลับเป็น approved` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}
