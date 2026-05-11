import { and, desc, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";
import {
  db,
  jobs,
  applications,
  candidateProfiles,
  clinicProfiles,
} from "@/db";

// ═══════════════════════════════════════════════════════════════════════════
// Public job board
// ═══════════════════════════════════════════════════════════════════════════
export async function getOpenJobs(limit = 30) {
  return db
    .select({
      id: jobs.id,
      title: jobs.title,
      description: jobs.description,
      employmentType: jobs.employmentType,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      location: jobs.location,
      isRemote: jobs.isRemote,
      isFeatured: jobs.isFeatured,
      requiredSkills: jobs.requiredSkills,
      createdAt: jobs.createdAt,
      clinicId: clinicProfiles.id,
      clinicName: clinicProfiles.clinicName,
      clinicProvince: clinicProfiles.province,
      clinicTier: clinicProfiles.subscriptionTier,
    })
    .from(jobs)
    .innerJoin(clinicProfiles, eq(clinicProfiles.id, jobs.clinicId))
    .where(and(
      eq(jobs.status, "open"),
      eq(clinicProfiles.status, "approved"),
      or(isNull(jobs.closesAt), gt(jobs.closesAt, new Date())),
    ))
    .orderBy(desc(jobs.isFeatured), desc(jobs.createdAt))
    .limit(limit);
}

export async function getJobById(jobId: string) {
  return db
    .select({
      job: jobs,
      clinic: {
        id: clinicProfiles.id,
        clinicName: clinicProfiles.clinicName,
        province: clinicProfiles.province,
        district: clinicProfiles.district,
        phone: clinicProfiles.phone,
        tier: clinicProfiles.subscriptionTier,
        lineOfficial: clinicProfiles.lineOfficial,
      },
    })
    .from(jobs)
    .innerJoin(clinicProfiles, eq(clinicProfiles.id, jobs.clinicId))
    .where(and(eq(jobs.id, jobId), eq(clinicProfiles.status, "approved")))
    .limit(1)
    .then((r) => r[0] ?? null);
}

// ═══════════════════════════════════════════════════════════════════════════
// Candidate
// ═══════════════════════════════════════════════════════════════════════════
export async function getCandidateByUserId(userId: string) {
  return db.query.candidateProfiles.findFirst({
    where: eq(candidateProfiles.userId, userId),
  });
}

export async function getCandidateApplications(candidateId: string, limit = 50) {
  return db
    .select({
      id: applications.id,
      status: applications.status,
      createdAt: applications.createdAt,
      jobId: jobs.id,
      jobTitle: jobs.title,
      jobStatus: jobs.status,
      clinicName: clinicProfiles.clinicName,
    })
    .from(applications)
    .innerJoin(jobs, eq(jobs.id, applications.jobId))
    .innerJoin(clinicProfiles, eq(clinicProfiles.id, jobs.clinicId))
    .where(eq(applications.candidateId, candidateId))
    .orderBy(desc(applications.createdAt))
    .limit(limit);
}

export async function hasApplied(candidateId: string, jobId: string): Promise<boolean> {
  const r = await db.query.applications.findFirst({
    where: and(eq(applications.candidateId, candidateId), eq(applications.jobId, jobId)),
    columns: { id: true },
  });
  return !!r;
}

// ═══════════════════════════════════════════════════════════════════════════
// Clinic's job management
// ═══════════════════════════════════════════════════════════════════════════
export async function getClinicJobs(clinicId: string) {
  return db
    .select({
      id: jobs.id,
      title: jobs.title,
      employmentType: jobs.employmentType,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      status: jobs.status,
      isFeatured: jobs.isFeatured,
      createdAt: jobs.createdAt,
      applicationCount: sql<number>`(select count(*)::int from applications where applications.job_id = ${jobs.id})`.as("application_count"),
    })
    .from(jobs)
    .where(eq(jobs.clinicId, clinicId))
    .orderBy(desc(jobs.createdAt));
}
