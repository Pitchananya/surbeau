"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  db,
  users,
  candidateProfiles,
  clinicProfiles,
  jobs,
  applications,
} from "@/db";

// ═══════════════════════════════════════════════════════════════════════════
// Candidate signup
// ═══════════════════════════════════════════════════════════════════════════
export type CandidateSignupState =
  | { ok: false; error: string; fields?: Record<string, string> }
  | { ok: true };

export async function signupCandidate(
  _prev: CandidateSignupState | null,
  fd: FormData,
): Promise<CandidateSignupState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const phone           = String(fd.get("phone") || "").trim();
  const headline        = String(fd.get("headline") || "").trim();
  const bio             = String(fd.get("bio") || "").trim();
  const experienceYears = String(fd.get("experience_years") || "").trim();
  const skillsRaw       = String(fd.get("skills") || "").trim();
  const specialtiesRaw  = String(fd.get("specialties") || "").trim();

  const fields: Record<string, string> = {};
  if (!/^[0-9+\-\s]{7,20}$/.test(phone)) fields.phone = "เบอร์โทรไม่ถูกต้อง";
  if (!headline || headline.length < 5)  fields.headline = "เขียนแนะนำตัวสั้นๆ อย่างน้อย 5 ตัวอักษร";

  const yrs = experienceYears ? Number(experienceYears) : null;
  if (yrs !== null && (isNaN(yrs) || yrs < 0 || yrs > 60))
    fields.experience_years = "ประสบการณ์ 0-60 ปี";

  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "กรอกข้อมูลไม่ครบ", fields };
  }

  const existing = await db.query.candidateProfiles.findFirst({
    where: eq(candidateProfiles.userId, session.user.id),
    columns: { id: true },
  });
  if (existing) return { ok: false, error: "คุณลงทะเบียนเป็น Candidate ไปแล้ว" };

  const splitTags = (s: string) =>
    s.split(/[,\n]/).map((t) => t.trim()).filter(Boolean).slice(0, 20);

  await db.transaction(async (tx) => {
    await tx.insert(candidateProfiles).values({
      userId: session.user.id,
      headline,
      bio: bio || null,
      experienceYears: yrs,
      skills: splitTags(skillsRaw),
      specialties: splitTags(specialtiesRaw),
    });
    // Promote role only if currently customer (don't downgrade admin/clinic/sale)
    await tx.update(users)
      .set({ phone, updatedAt: new Date() })
      .where(and(eq(users.id, session.user.id), eq(users.role, "customer")));
    await tx.update(users)
      .set({ role: "candidate" })
      .where(and(eq(users.id, session.user.id), eq(users.role, "customer")));
  });

  revalidatePath("/candidate");
  redirect("/candidate");
}

// ═══════════════════════════════════════════════════════════════════════════
// Create job (clinic-only)
// ═══════════════════════════════════════════════════════════════════════════
export type JobFormState =
  | { ok: false; error: string; fields?: Record<string, string> }
  | { ok: true; jobId: string };

export async function createJob(
  _prev: JobFormState | null,
  fd: FormData,
): Promise<JobFormState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const clinic = await db.query.clinicProfiles.findFirst({
    where: and(
      eq(clinicProfiles.userId, session.user.id),
      eq(clinicProfiles.status, "approved"),
    ),
  });
  if (!clinic) return { ok: false, error: "คลินิกของคุณยังไม่ได้รับการอนุมัติ" };

  const title         = String(fd.get("title") || "").trim();
  const description   = String(fd.get("description") || "").trim();
  const employment    = String(fd.get("employment_type") || "full_time").trim();
  const location      = String(fd.get("location") || "").trim();
  const skillsRaw     = String(fd.get("required_skills") || "").trim();
  const salaryMinRaw  = String(fd.get("salary_min") || "").trim();
  const salaryMaxRaw  = String(fd.get("salary_max") || "").trim();
  const isRemote      = fd.get("is_remote") === "on";

  const fields: Record<string, string> = {};
  if (!title || title.length < 3) fields.title = "ชื่อตำแหน่งอย่างน้อย 3 ตัวอักษร";

  const validEmployment = ["full_time", "part_time", "contract", "freelance", "internship"];
  if (!validEmployment.includes(employment)) fields.employment_type = "ประเภทการจ้างไม่ถูกต้อง";

  const salaryMin = salaryMinRaw ? Number(salaryMinRaw) : null;
  const salaryMax = salaryMaxRaw ? Number(salaryMaxRaw) : null;
  if (salaryMin !== null && (isNaN(salaryMin) || salaryMin < 0))
    fields.salary_min = "เงินเดือนขั้นต่ำต้อง >= 0";
  if (salaryMax !== null && (isNaN(salaryMax) || salaryMax < 0))
    fields.salary_max = "เงินเดือนสูงสุดต้อง >= 0";
  if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin)
    fields.salary_max = "เงินเดือนสูงสุดต้อง >= ขั้นต่ำ";

  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "กรอกข้อมูลไม่ครบ", fields };
  }

  const requiredSkills = skillsRaw
    .split(/[,\n]/).map((t) => t.trim()).filter(Boolean).slice(0, 15);

  const [created] = await db
    .insert(jobs)
    .values({
      clinicId: clinic.id,
      title,
      description: description || null,
      requiredSkills,
      employmentType: employment as "full_time" | "part_time" | "contract" | "freelance" | "internship",
      salaryMin: salaryMin !== null ? salaryMin.toFixed(2) : null,
      salaryMax: salaryMax !== null ? salaryMax.toFixed(2) : null,
      location: location || null,
      isRemote,
      status: "open",
    })
    .returning({ id: jobs.id });

  revalidatePath("/clinic/jobs");
  revalidatePath("/jobs");
  return { ok: true, jobId: created.id };
}

// ═══════════════════════════════════════════════════════════════════════════
// Toggle job open/closed
// ═══════════════════════════════════════════════════════════════════════════
export async function toggleJobOpen(jobId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

  const clinic = await db.query.clinicProfiles.findFirst({
    where: eq(clinicProfiles.userId, session.user.id),
    columns: { id: true },
  });
  if (!clinic) return { ok: false, error: "ไม่พบคลินิก" };

  const j = await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
    columns: { id: true, clinicId: true, status: true },
  });
  if (!j || j.clinicId !== clinic.id) return { ok: false, error: "ไม่มีสิทธิ์แก้งานนี้" };

  await db.update(jobs)
    .set({ status: j.status === "open" ? "closed" : "open", updatedAt: new Date() })
    .where(eq(jobs.id, jobId));

  revalidatePath("/clinic/jobs");
  revalidatePath("/jobs");
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// Apply to job (candidate)
// ═══════════════════════════════════════════════════════════════════════════
export type ApplyState =
  | { ok: false; error: string }
  | { ok: true; applicationId: string };

export async function applyJob(
  jobId: string,
  _prev: ApplyState | null,
  fd: FormData,
): Promise<ApplyState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบเพื่อสมัครงาน" };

  const candidate = await db.query.candidateProfiles.findFirst({
    where: eq(candidateProfiles.userId, session.user.id),
    columns: { id: true },
  });
  if (!candidate) return { ok: false, error: "กรุณาสร้างโปรไฟล์ Candidate ก่อน" };

  // Verify job is open
  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.status, "open")),
    columns: { id: true },
  });
  if (!job) return { ok: false, error: "ตำแหน่งนี้ปิดรับสมัครแล้ว" };

  const coverLetter = String(fd.get("cover_letter") || "").trim().slice(0, 2000) || null;
  const resumeUrl   = String(fd.get("resume_url") || "").trim().slice(0, 500) || null;

  try {
    const [created] = await db
      .insert(applications)
      .values({
        jobId,
        candidateId: candidate.id,
        coverLetter,
        resumeUrl,
        status: "pending",
      })
      .returning({ id: applications.id });

    revalidatePath("/candidate");
    revalidatePath(`/jobs/${jobId}`);
    return { ok: true, applicationId: created.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
    if (msg.includes("applications_job_candidate_unique"))
      return { ok: false, error: "คุณสมัครตำแหน่งนี้ไปแล้ว" };
    return { ok: false, error: msg };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Clinic updates application status
// Allowed transitions:
//   pending      → shortlisted | rejected
//   shortlisted  → interviewing | rejected
//   interviewing → hired | rejected
//   hired / rejected / withdrawn = final (no changes)
// ═══════════════════════════════════════════════════════════════════════════
const APP_STATUSES = [
  "pending", "shortlisted", "interviewing", "hired", "rejected", "withdrawn",
] as const;
type AppStatus = (typeof APP_STATUSES)[number];

const FINAL_STATUSES: ReadonlySet<AppStatus> = new Set(["hired", "rejected", "withdrawn"]);

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: AppStatus,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };

  if (!APP_STATUSES.includes(newStatus))
    return { ok: false, error: "สถานะไม่ถูกต้อง" };

  const clinic = await db.query.clinicProfiles.findFirst({
    where: eq(clinicProfiles.userId, session.user.id),
    columns: { id: true },
  });
  if (!clinic) return { ok: false, error: "ไม่พบคลินิก" };

  // Verify the application belongs to one of this clinic's jobs
  const rows = await db
    .select({
      currentStatus: applications.status,
      clinicId: jobs.clinicId,
    })
    .from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (rows.length === 0) return { ok: false, error: "ไม่พบใบสมัคร" };
  const { currentStatus, clinicId } = rows[0];

  if (clinicId !== clinic.id) return { ok: false, error: "ไม่มีสิทธิ์แก้ใบสมัครนี้" };
  if (FINAL_STATUSES.has(currentStatus as AppStatus))
    return { ok: false, error: `สถานะปัจจุบันเปลี่ยนไม่ได้แล้ว` };

  await db.update(applications)
    .set({
      status: newStatus,
      statusUpdatedAt: new Date(),
      statusUpdatedBy: session.user.id,
    })
    .where(eq(applications.id, applicationId));

  revalidatePath("/clinic/applications");
  revalidatePath("/clinic/jobs");
  revalidatePath("/candidate");
  return { ok: true };
}
