"use server";

import { and, eq, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, users, saleProfiles, payoutRequests, commissions } from "@/db";

// ═══════════════════════════════════════════════════════════════════════════
// Sale signup — turn a logged-in customer into a pending Sale
// ═══════════════════════════════════════════════════════════════════════════
export type SaleSignupState =
  | { ok: false; error: string; fields?: Record<string, string> }
  | { ok: true };

export async function signupSale(
  _prev: SaleSignupState | null,
  fd: FormData,
): Promise<SaleSignupState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };
  }

  const phone           = String(fd.get("phone") || "").trim();
  const bankAccountName = String(fd.get("bank_account_name") || "").trim();
  const bankAccountNo   = String(fd.get("bank_account_no") || "").trim();
  const bankName        = String(fd.get("bank_name") || "").trim();
  const promptpay       = String(fd.get("promptpay") || "").trim();
  const bio             = String(fd.get("bio") || "").trim();

  const fields: Record<string, string> = {};
  if (!/^[0-9+\-\s]{7,20}$/.test(phone))
    fields.phone = "เบอร์โทรไม่ถูกต้อง";
  // Either bank info OR promptpay must be filled
  const hasBank = bankAccountName && bankAccountNo && bankName;
  const hasPromptpay = !!promptpay;
  if (!hasBank && !hasPromptpay)
    fields.bank_account_no = "กรอกข้อมูลธนาคารหรือ PromptPay อย่างน้อย 1 อย่าง";

  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "กรอกข้อมูลไม่ครบ", fields };
  }

  // Already has sale_profile?
  const existing = await db.query.saleProfiles.findFirst({
    where: eq(saleProfiles.userId, session.user.id),
    columns: { id: true },
  });
  if (existing) {
    return { ok: false, error: "คุณสมัครเป็น Sale ไปแล้ว" };
  }

  await db.transaction(async (tx) => {
    await tx.insert(saleProfiles).values({
      userId: session.user.id,
      bankAccountName: hasBank ? bankAccountName : null,
      bankAccountNo: hasBank ? bankAccountNo : null,
      bankName: hasBank ? bankName : null,
      promptpay: hasPromptpay ? promptpay : null,
      bio: bio || null,
      status: "pending",
    });
    await tx.update(users)
      .set({ role: "sale", phone, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));
  });

  revalidatePath("/sale");
  redirect("/sale");
}

// ═══════════════════════════════════════════════════════════════════════════
// Update sale profile (bank info + bio)
// ═══════════════════════════════════════════════════════════════════════════
export async function updateSaleProfile(
  _prev: SaleSignupState | null,
  fd: FormData,
): Promise<SaleSignupState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const sale = await db.query.saleProfiles.findFirst({
    where: eq(saleProfiles.userId, session.user.id),
    columns: { id: true },
  });
  if (!sale) return { ok: false, error: "ไม่พบโปรไฟล์ Sale" };

  const bankAccountName = String(fd.get("bank_account_name") || "").trim();
  const bankAccountNo   = String(fd.get("bank_account_no") || "").trim();
  const bankName        = String(fd.get("bank_name") || "").trim();
  const promptpay       = String(fd.get("promptpay") || "").trim();
  const bio             = String(fd.get("bio") || "").trim();

  await db.update(saleProfiles)
    .set({
      bankAccountName: bankAccountName || null,
      bankAccountNo: bankAccountNo || null,
      bankName: bankName || null,
      promptpay: promptpay || null,
      bio: bio || null,
      updatedAt: new Date(),
    })
    .where(eq(saleProfiles.id, sale.id));

  revalidatePath("/sale");
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// Request payout — sum approved commissions, create a pending request,
// flip those commissions to awaiting_payout. The DB has a partial unique
// index that prevents two pending payouts per sale.
// ═══════════════════════════════════════════════════════════════════════════
export type PayoutState =
  | { ok: false; error: string }
  | { ok: true; payoutId: string; amount: number };

export async function requestPayout(
  _prev: PayoutState | null,
  fd: FormData,
): Promise<PayoutState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const sale = await db.query.saleProfiles.findFirst({
    where: and(eq(saleProfiles.userId, session.user.id), eq(saleProfiles.status, "approved")),
  });
  if (!sale) return { ok: false, error: "Sale ของคุณยังไม่ได้รับการอนุมัติ" };

  const note = String(fd.get("note") || "").trim().slice(0, 300) || null;

  try {
    const result = await db.transaction(async (tx) => {
      const [{ total }] = await tx
        .select({ total: sum(commissions.amount).mapWith(Number) })
        .from(commissions)
        .where(and(eq(commissions.saleId, sale.id), eq(commissions.status, "approved")));

      const amount = total ?? 0;
      if (amount <= 0) {
        throw new Error("ไม่มีค่าคอมที่อนุมัติแล้วให้ถอน");
      }

      const [created] = await tx
        .insert(payoutRequests)
        .values({
          saleId: sale.id,
          amount: amount.toFixed(2),
          bankAccountName: sale.bankAccountName,
          bankAccountNo: sale.bankAccountNo,
          bankName: sale.bankName,
          promptpay: sale.promptpay,
          note,
          status: "pending",
        })
        .returning({ id: payoutRequests.id });

      await tx
        .update(commissions)
        .set({ status: "awaiting_payout" })
        .where(and(eq(commissions.saleId, sale.id), eq(commissions.status, "approved")));

      return { id: created.id, amount };
    });

    revalidatePath("/sale");
    revalidatePath("/sale/payout");
    return { ok: true, payoutId: result.id, amount: result.amount };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
    if (msg.includes("payout_one_pending_per_sale")) {
      return { ok: false, error: "คุณมีคำขอถอนเงินที่รออนุมัติอยู่แล้ว" };
    }
    return { ok: false, error: msg };
  }
}
