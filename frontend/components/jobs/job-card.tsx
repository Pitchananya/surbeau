import Link from "next/link";
import { MapPin, Briefcase, Sparkles } from "lucide-react";
import { formatBaht } from "@/lib/utils";

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "งานประจำ",
  part_time: "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "ฝึกงาน",
};

export type JobCardData = {
  id: string;
  title: string;
  description: string | null;
  employmentType: "full_time" | "part_time" | "contract" | "freelance" | "internship";
  salaryMin: string | null;
  salaryMax: string | null;
  location: string | null;
  isRemote: boolean;
  isFeatured: boolean;
  requiredSkills: string[];
  clinicId: string;
  clinicName: string;
  clinicProvince: string | null;
};

export function JobCard({ job }: { job: JobCardData }) {
  return (
    <Link
      href={`/jobs/${job.id}` as never}
      className="block rounded-2xl border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[color:var(--color-gold-muted)] hover:shadow-[0_12px_40px_-12px_rgba(212,168,90,0.2)] lg:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[1.05rem] font-bold lg:text-[1.15rem]">{job.title}</h3>
            {job.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/5 px-2 py-0.5 text-[0.7rem] text-[color:var(--color-gold-bright)]">
                <Sparkles className="h-3 w-3" /> Featured
              </span>
            )}
          </div>
          <p className="mt-1 text-[0.88rem] text-[color:var(--color-muted-strong)]">
            {job.clinicName}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {(job.salaryMin || job.salaryMax) && (
            <div className="font-display text-[0.95rem] font-bold text-[color:var(--color-gold-bright)] lg:text-[1.05rem]">
              {salaryRange(job.salaryMin, job.salaryMax)} <span className="text-[0.75rem]">฿</span>
            </div>
          )}
        </div>
      </div>

      {job.description && (
        <p className="mt-3 line-clamp-2 text-[0.85rem] text-[color:var(--color-muted-strong)]">
          {job.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.78rem] text-[color:var(--color-muted-strong)]">
        <span className="inline-flex items-center gap-1">
          <Briefcase className="h-3 w-3 text-[color:var(--color-gold)]" />
          {EMPLOYMENT_LABELS[job.employmentType] ?? job.employmentType}
        </span>
        {(job.location || job.clinicProvince) && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[color:var(--color-gold)]" />
            {job.isRemote ? "ทำงานทางไกล" : job.location || job.clinicProvince}
          </span>
        )}
      </div>

      {job.requiredSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.requiredSkills.slice(0, 5).map((s) => (
            <span
              key={s}
              className="rounded-full border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-2 py-0.5 text-[0.7rem] text-[color:var(--color-muted-strong)]"
            >
              {s}
            </span>
          ))}
          {job.requiredSkills.length > 5 && (
            <span className="text-[0.7rem] text-[color:var(--color-muted)]">
              +{job.requiredSkills.length - 5}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

function salaryRange(min: string | null, max: string | null): string {
  if (min && max) {
    if (min === max) return formatBaht(Number(min));
    return `${formatBaht(Number(min))} - ${formatBaht(Number(max))}`;
  }
  if (min) return `${formatBaht(Number(min))}+`;
  if (max) return `สูงสุด ${formatBaht(Number(max))}`;
  return "";
}
