import { MapPin } from "lucide-react";

export function LocationRow() {
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[0.85rem] lg:hidden">
      <div className="flex items-center gap-1.5 text-[color:var(--color-muted-strong)]">
        <MapPin className="h-3.5 w-3.5 text-[color:var(--color-gold)]" />
        <span>กรุงเทพมหานคร · 5 กม.</span>
      </div>
      <button
        type="button"
        className="text-[color:var(--color-gold-bright)] underline-offset-4 hover:underline"
      >
        เปลี่ยน
      </button>
    </div>
  );
}
