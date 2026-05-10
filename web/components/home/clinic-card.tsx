import { Star } from "lucide-react";
import type { ClinicBadge, ClinicCardData } from "@/lib/types";
import { cn, formatBaht, formatDistanceKm } from "@/lib/utils";

export function ClinicCard({ clinic }: { clinic: ClinicCardData }) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] transition-colors hover:border-[color:var(--color-gold-muted)]">
      <div
        className="relative h-44 w-full"
        style={{ background: clinic.imageGradient }}
      >
        <TierBadge tier={clinic.tier} />
        <RatingPill rating={clinic.rating} count={clinic.reviewCount} />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[1.05rem] font-bold text-[color:var(--color-foreground)]">
              {clinic.name}
            </h3>
            <p className="mt-1 text-[0.82rem] text-[color:var(--color-muted-strong)]">
              {clinic.tags.join(" · ")} · {clinic.district}
            </p>
          </div>
          <div className="text-right">
            <div className="font-display text-[1.15rem] font-bold text-[color:var(--color-gold-bright)]">
              {formatBaht(clinic.priceFrom)} ฿
            </div>
            <div className="text-[0.75rem] text-[color:var(--color-muted)]">
              {formatDistanceKm(clinic.distanceKm)}
            </div>
          </div>
        </div>
        {clinic.badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {clinic.badges.map((b, i) => (
              <Badge key={i} badge={b} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function TierBadge({ tier }: { tier: ClinicCardData["tier"] }) {
  if (tier === "free") {
    return (
      <span className="absolute left-3 top-3 rounded-full border border-[color:var(--color-border-default)] bg-black/40 px-2.5 py-1 text-[0.7rem] text-[color:var(--color-muted-strong)] backdrop-blur-sm">
        Free listing
      </span>
    );
  }
  if (tier === "verified") {
    return (
      <span className="absolute left-3 top-3 rounded-full border border-[color:var(--color-verified)] bg-[color:var(--color-verified-soft)] px-2.5 py-1 text-[0.72rem] font-medium text-[color:var(--color-verified)] backdrop-blur-sm">
        ✓ Verified
      </span>
    );
  }
  return (
    <span className="absolute left-3 top-3 rounded-full border border-[color:var(--color-gold)] bg-black/50 px-2.5 py-1 text-[0.72rem] font-medium text-[color:var(--color-gold-bright)] backdrop-blur-sm">
      ★ Premier Partner
    </span>
  );
}

function RatingPill({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[color:var(--color-border-default)] bg-black/55 px-2.5 py-1 text-[0.72rem] backdrop-blur-sm">
      <Star className="h-3 w-3 fill-[color:var(--color-gold-bright)] text-[color:var(--color-gold-bright)]" />
      <span className="font-semibold text-[color:var(--color-foreground)]">
        {rating.toFixed(1)}
      </span>
      <span className="text-[color:var(--color-muted)]">· {count} รีวิว</span>
    </span>
  );
}

function Badge({ badge }: { badge: ClinicBadge }) {
  if (badge.kind === "hot") {
    return (
      <span className="rounded-full border border-[color:var(--color-hot)]/40 bg-[color:var(--color-hot-soft)] px-2.5 py-1 text-[0.7rem] font-medium leading-tight text-[color:var(--color-hot)]">
        🔥 โปรร้อน
      </span>
    );
  }
  if (badge.kind === "installment") {
    return (
      <span className="rounded-full border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-2.5 py-1 text-[0.7rem] text-[color:var(--color-muted-strong)]">
        ผ่อน {badge.months === 0 ? "0%" : `${badge.months} เดือน`}
      </span>
    );
  }
  return (
    <span className={cn(
      "rounded-full border border-[color:var(--color-border-default)] bg-[color:var(--color-surface-elevated)] px-2.5 py-1 text-[0.7rem] text-[color:var(--color-muted-strong)]",
    )}>
      จองวันนี้
    </span>
  );
}
