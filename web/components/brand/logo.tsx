import { cn } from "@/lib/utils";

export function CrownGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 48"
      className={cn("h-7 w-9", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 38 L10 14 L22 26 L32 8 L42 26 L54 14 L58 38 Z" />
      <line x1="6" y1="44" x2="58" y2="44" />
      <circle cx="32" cy="8" r="1.5" fill="currentColor" />
      <circle cx="10" cy="14" r="1.5" fill="currentColor" />
      <circle cx="54" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function BrandLockup({ subtitle = "CLINIC PLATFORM" }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <CrownGlyph className="text-[color:var(--color-gold)]" />
      <div className="leading-tight">
        <div className="font-brand text-[1.05rem] font-semibold tracking-wide text-[color:var(--color-gold-bright)]">
          Sur Beau
        </div>
        <div className="font-sans text-[0.55rem] tracking-[0.18em] text-[color:var(--color-muted)]">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
