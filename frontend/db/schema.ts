import { sql, relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ═══════════════════════════════════════════════════════════════════════════
// Enums
// ═══════════════════════════════════════════════════════════════════════════
export const userRole = pgEnum("user_role", ["admin", "sale", "clinic", "customer", "candidate"]);
export const userStatus = pgEnum("user_status", ["active", "pending", "blocked"]);
export const saleStatus = pgEnum("sale_status", ["pending", "approved", "rejected", "blocked"]);
export const clinicStatus = pgEnum("clinic_status", ["pending", "approved", "rejected", "blocked"]);
export const subscriptionTier = pgEnum("subscription_tier", ["free", "verified", "premier"]);
export const leadStatus = pgEnum("lead_status", ["new", "contacted", "success", "failed"]);
export const commissionStatus = pgEnum("commission_status", [
  "pending", "approved", "awaiting_payout", "paid", "cancelled",
]);
export const payoutStatus = pgEnum("payout_status", ["pending", "approved", "rejected"]);

// Phase 2 — Job marketplace
export const jobStatus = pgEnum("job_status", ["open", "closed", "draft"]);
export const applicationStatus = pgEnum("application_status", [
  "pending", "shortlisted", "interviewing", "hired", "rejected", "withdrawn",
]);
export const employmentType = pgEnum("employment_type", [
  "full_time", "part_time", "contract", "freelance", "internship",
]);
export const membershipPlan = pgEnum("membership_plan", ["free", "premium_year"]);
export const membershipStatusEnum = pgEnum("membership_status", ["pending", "active", "expired", "cancelled"]);

// ═══════════════════════════════════════════════════════════════════════════
// users — single source of truth (no Auth.js adapter; we manage upsert in
// signIn callback). FK target for everything else.
// ═══════════════════════════════════════════════════════════════════════════
export const users = pgTable("users", {
  id:          uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email:       text("email").unique(),
  name:        text("name").notNull(),
  phone:       text("phone"),
  image:       text("image"),
  role:        userRole("role").notNull().default("customer"),
  status:      userStatus("status").notNull().default("active"),
  lineUserId:  text("line_user_id").unique(),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════
// sale_profiles
// ═══════════════════════════════════════════════════════════════════════════
export const saleProfiles = pgTable("sale_profiles", {
  id:               uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId:           uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  bio:              text("bio"),
  bankAccountName:  text("bank_account_name"),
  bankAccountNo:    text("bank_account_no"),
  bankName:         text("bank_name"),
  promptpay:        text("promptpay"),
  status:           saleStatus("status").notNull().default("pending"),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════
// clinic_profiles
// ═══════════════════════════════════════════════════════════════════════════
export const clinicProfiles = pgTable("clinic_profiles", {
  id:                uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId:            uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  clinicName:        text("clinic_name").notNull(),
  licenseNo:         text("license_no"),
  address:           text("address"),
  province:          text("province"),
  district:          text("district"),
  latitude:          numeric("latitude", { precision: 10, scale: 7 }),
  longitude:         numeric("longitude", { precision: 10, scale: 7 }),
  phone:             text("phone"),
  lineOfficial:      text("line_official"),
  facebookUrl:       text("facebook_url"),
  instagramUrl:      text("instagram_url"),
  subscriptionTier:  subscriptionTier("subscription_tier").notNull().default("free"),
  ratingAvg:         numeric("rating_avg", { precision: 3, scale: 2 }).notNull().default("0"),
  ratingCount:       integer("rating_count").notNull().default(0),
  status:            clinicStatus("status").notNull().default("pending"),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:         timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════
// campaigns
// ═══════════════════════════════════════════════════════════════════════════
export const campaigns = pgTable("campaigns", {
  id:                    uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId:              uuid("clinic_id").notNull().references(() => clinicProfiles.id, { onDelete: "cascade" }),
  title:                 text("title").notNull(),
  description:           text("description"),
  normalPrice:           numeric("normal_price", { precision: 12, scale: 2 }),
  promoPrice:            numeric("promo_price", { precision: 12, scale: 2 }),
  commissionPerSuccess:  numeric("commission_per_success", { precision: 12, scale: 2 }).notNull(),
  maxSlots:              integer("max_slots"),
  startDate:             date("start_date"),
  endDate:               date("end_date"),
  isActive:              boolean("is_active").notNull().default(true),
  isFeatured:            boolean("is_featured").notNull().default(false),
  createdAt:             timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:             timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════
// leads
// ═══════════════════════════════════════════════════════════════════════════
export const leads = pgTable("leads", {
  id:               uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId:       uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  saleId:           uuid("sale_id").notNull().references(() => saleProfiles.id, { onDelete: "restrict" }),
  customerName:     text("customer_name").notNull(),
  customerPhone:    text("customer_phone").notNull(),
  note:             text("note"),
  status:           leadStatus("status").notNull().default("new"),
  statusUpdatedAt:  timestamp("status_updated_at", { withTimezone: true }),
  statusUpdatedBy:  uuid("status_updated_by").references(() => users.id),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════
// commissions (1-1 with lead via unique lead_id)
// ═══════════════════════════════════════════════════════════════════════════
export const commissions = pgTable("commissions", {
  id:           uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  saleId:       uuid("sale_id").notNull().references(() => saleProfiles.id, { onDelete: "restrict" }),
  leadId:       uuid("lead_id").notNull().unique().references(() => leads.id, { onDelete: "cascade" }),
  amount:       numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status:       commissionStatus("status").notNull().default("pending"),
  approvedAt:   timestamp("approved_at", { withTimezone: true }),
  approvedBy:   uuid("approved_by").references(() => users.id),
  paidAt:       timestamp("paid_at", { withTimezone: true }),
  paidBy:       uuid("paid_by").references(() => users.id),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════
// payout_requests
// ═══════════════════════════════════════════════════════════════════════════
export const payoutRequests = pgTable("payout_requests", {
  id:                uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  saleId:            uuid("sale_id").notNull().references(() => saleProfiles.id, { onDelete: "restrict" }),
  amount:            numeric("amount", { precision: 12, scale: 2 }).notNull(),
  bankAccountName:   text("bank_account_name"),
  bankAccountNo:     text("bank_account_no"),
  bankName:          text("bank_name"),
  promptpay:         text("promptpay"),
  note:              text("note"),
  status:            payoutStatus("status").notNull().default("pending"),
  processedAt:       timestamp("processed_at", { withTimezone: true }),
  processedBy:       uuid("processed_by").references(() => users.id),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  // only ONE pending payout per sale at a time — partial unique index
  uniqueIndex("payout_one_pending_per_sale")
    .on(t.saleId)
    .where(sql`${t.status} = 'pending'`),
]);

// ═══════════════════════════════════════════════════════════════════════════
// clinic_reviews
// ═══════════════════════════════════════════════════════════════════════════
export const clinicReviews = pgTable("clinic_reviews", {
  id:            uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId:      uuid("clinic_id").notNull().references(() => clinicProfiles.id, { onDelete: "cascade" }),
  leadId:        uuid("lead_id").unique().references(() => leads.id, { onDelete: "set null" }),
  reviewerName:  text("reviewer_name").notNull(),
  rating:        smallint("rating").notNull(),
  comment:       text("comment"),
  isVerified:    boolean("is_verified").notNull().default(false),
  isVisible:     boolean("is_visible").notNull().default(true),
  createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════
// Relations
// ═══════════════════════════════════════════════════════════════════════════
export const usersRelations = relations(users, ({ one }) => ({
  saleProfile:   one(saleProfiles,   { fields: [users.id], references: [saleProfiles.userId] }),
  clinicProfile: one(clinicProfiles, { fields: [users.id], references: [clinicProfiles.userId] }),
}));

export const clinicProfilesRelations = relations(clinicProfiles, ({ one, many }) => ({
  user:      one(users, { fields: [clinicProfiles.userId], references: [users.id] }),
  campaigns: many(campaigns),
  reviews:   many(clinicReviews),
}));

export const saleProfilesRelations = relations(saleProfiles, ({ one, many }) => ({
  user:        one(users, { fields: [saleProfiles.userId], references: [users.id] }),
  leads:       many(leads),
  commissions: many(commissions),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  clinic: one(clinicProfiles, { fields: [campaigns.clinicId], references: [clinicProfiles.id] }),
  leads:  many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  campaign:   one(campaigns,     { fields: [leads.campaignId], references: [campaigns.id] }),
  sale:       one(saleProfiles,  { fields: [leads.saleId],     references: [saleProfiles.id] }),
  commission: one(commissions),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  sale: one(saleProfiles, { fields: [commissions.saleId], references: [saleProfiles.id] }),
  lead: one(leads,        { fields: [commissions.leadId], references: [leads.id] }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// Contact inquiries (/contact-sales form)
// ═══════════════════════════════════════════════════════════════════════════
export const inquiryStatus = pgEnum("inquiry_status", [
  "new", "contacted", "qualified", "closed", "spam",
]);
export const inquiryKind = pgEnum("inquiry_kind", [
  "clinic_premier", "clinic_general", "general",
]);

export const contactInquiries = pgTable("contact_inquiries", {
  id:            uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  kind:          inquiryKind("kind").notNull().default("general"),
  name:          text("name").notNull(),
  organization:  text("organization"),
  email:         text("email"),
  phone:         text("phone"),
  message:       text("message"),
  planInterest:  text("plan_interest"),
  status:        inquiryStatus("status").notNull().default("new"),
  notes:         text("notes"),
  handledBy:     uuid("handled_by").references(() => users.id),
  handledAt:     timestamp("handled_at", { withTimezone: true }),
  createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════
// Phase 2 — Job marketplace
// ═══════════════════════════════════════════════════════════════════════════
export const candidateProfiles = pgTable("candidate_profiles", {
  id:               uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId:           uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  bio:              text("bio"),
  headline:         text("headline"),
  skills:           text("skills").array().notNull().default(sql`'{}'::text[]`),
  specialties:      text("specialties").array().notNull().default(sql`'{}'::text[]`),
  experienceYears:  integer("experience_years"),
  licenseFiles:     jsonb("license_files").notNull().default(sql`'[]'::jsonb`),
  portfolio:        jsonb("portfolio").notNull().default(sql`'[]'::jsonb`),
  isVerified:       boolean("is_verified").notNull().default(false),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobs = pgTable("jobs", {
  id:              uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId:        uuid("clinic_id").notNull().references(() => clinicProfiles.id, { onDelete: "cascade" }),
  title:           text("title").notNull(),
  description:     text("description"),
  requiredSkills:  text("required_skills").array().notNull().default(sql`'{}'::text[]`),
  employmentType:  employmentType("employment_type").notNull().default("full_time"),
  salaryMin:       numeric("salary_min", { precision: 12, scale: 2 }),
  salaryMax:       numeric("salary_max", { precision: 12, scale: 2 }),
  location:        text("location"),
  isRemote:        boolean("is_remote").notNull().default(false),
  status:          jobStatus("status").notNull().default("open"),
  isFeatured:      boolean("is_featured").notNull().default(false),
  closesAt:        timestamp("closes_at", { withTimezone: true }),
  createdAt:       timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const applications = pgTable("applications", {
  id:                uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId:             uuid("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  candidateId:       uuid("candidate_id").notNull().references(() => candidateProfiles.id, { onDelete: "cascade" }),
  coverLetter:       text("cover_letter"),
  resumeUrl:         text("resume_url"),
  status:            applicationStatus("status").notNull().default("pending"),
  statusUpdatedAt:   timestamp("status_updated_at", { withTimezone: true }),
  statusUpdatedBy:   uuid("status_updated_by").references(() => users.id),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("applications_job_candidate_unique").on(t.jobId, t.candidateId),
]);

export const memberships = pgTable("memberships", {
  id:             uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId:         uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  plan:           membershipPlan("plan").notNull(),
  status:         membershipStatusEnum("status").notNull().default("active"),
  amount:         numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod:  text("payment_method"),
  paymentRef:     text("payment_ref"),
  paidAt:         timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt:      timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════
// Phase 2 — Relations
// ═══════════════════════════════════════════════════════════════════════════
export const candidateProfilesRelations = relations(candidateProfiles, ({ one, many }) => ({
  user:         one(users, { fields: [candidateProfiles.userId], references: [users.id] }),
  applications: many(applications),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  clinic:       one(clinicProfiles, { fields: [jobs.clinicId], references: [clinicProfiles.id] }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job:       one(jobs, { fields: [applications.jobId], references: [jobs.id] }),
  candidate: one(candidateProfiles, { fields: [applications.candidateId], references: [candidateProfiles.id] }),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// Type helpers
// ═══════════════════════════════════════════════════════════════════════════
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ClinicProfile = typeof clinicProfiles.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type CandidateProfile = typeof candidateProfiles.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
