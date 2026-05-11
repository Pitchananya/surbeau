"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db, memberships } from "@/db";

const PREMIUM_AMOUNT = 300;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export type SubmitState =
  | { ok: false; error: string; fields?: Record<string, string> }
  | { ok: true; membershipId: string };

export async function submitMembershipPayment(
  _prev: SubmitState | null,
  fd: FormData,
): Promise<SubmitState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

  const paymentRef = String(fd.get("payment_ref") || "").trim();
  const paymentMethod = String(fd.get("payment_method") || "promptpay").trim();

  const fields: Record<string, string> = {};
  if (!paymentRef || paymentRef.length < 4)
    fields.payment_ref = "กรอกหมายเลขอ้างอิงการโอน (อย่างน้อย 4 ตัวอักษร)";

  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "กรอกข้อมูลไม่ครบ", fields };
  }

  // Already has active or pending membership?
  const existing = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, session.user.id),
    ),
    columns: { id: true, status: true },
    orderBy: (m, { desc: d }) => [d(m.createdAt)],
  });
  if (existing?.status === "active")
    return { ok: false, error: "คุณมี Premium ใช้งานอยู่แล้ว" };
  if (existing?.status === "pending")
    return { ok: false, error: "คุณมีคำขอที่รอ admin ยืนยันอยู่แล้ว" };

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ONE_YEAR_MS);

  try {
    const [created] = await db
      .insert(memberships)
      .values({
        userId: session.user.id,
        plan: "premium_year",
        status: "pending",
        amount: PREMIUM_AMOUNT.toFixed(2),
        paymentMethod,
        paymentRef,
        paidAt: now,
        expiresAt,
      })
      .returning({ id: memberships.id });

    revalidatePath("/candidate");
    revalidatePath("/admin/memberships");
    return { ok: true, membershipId: created.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
    if (msg.includes("memberships_one_pending_per_user"))
      return { ok: false, error: "คุณมีคำขอที่รออยู่แล้ว" };
    if (msg.includes("memberships_one_active_per_user"))
      return { ok: false, error: "คุณมี Premium ใช้งานอยู่แล้ว" };
    return { ok: false, error: msg };
  }
}
