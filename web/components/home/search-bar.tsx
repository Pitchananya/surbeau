"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export function SearchBar() {
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="mx-5 mt-2 flex items-center gap-1.5 rounded-full border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-1 pl-5 lg:mx-auto lg:mt-8 lg:max-w-3xl lg:gap-2 lg:p-1.5 lg:pl-7 lg:shadow-[0_8px_32px_-8px_rgba(212,168,90,0.15)]"
    >
      <Search className="hidden h-4 w-4 text-[color:var(--color-muted)] lg:block" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ค้นหาคลินิก / โปรหัตถการ / จังหวัด..."
        className="flex-1 bg-transparent py-2 text-[0.92rem] text-[color:var(--color-foreground)] placeholder:text-[color:var(--color-muted)] focus:outline-none lg:py-3 lg:text-[1rem]"
      />
      <button
        type="submit"
        className="rounded-full bg-[color:var(--color-gold)] px-5 py-2 text-[0.85rem] font-semibold text-black transition-colors hover:bg-[color:var(--color-gold-bright)] lg:px-7 lg:py-3 lg:text-[0.95rem]"
      >
        ค้นหา
      </button>
    </form>
  );
}
