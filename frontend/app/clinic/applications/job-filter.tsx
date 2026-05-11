"use client";

import { useRouter, useSearchParams } from "next/navigation";

type JobOption = { id: string; title: string };

export function JobFilterSelect({ jobs }: { jobs: JobOption[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("job") ?? "";

  return (
    <select
      value={current}
      onChange={(e) => {
        const next = new URLSearchParams(params.toString());
        if (e.target.value) next.set("job", e.target.value);
        else next.delete("job");
        router.replace(`/clinic/applications?${next.toString()}`);
      }}
      className="w-full rounded-full border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] px-4 py-2 text-[0.85rem] focus:border-[color:var(--color-gold)] focus:outline-none lg:w-72"
    >
      <option value="">ทุกตำแหน่ง</option>
      {jobs.map((j) => (
        <option key={j.id} value={j.id}>{j.title}</option>
      ))}
    </select>
  );
}
