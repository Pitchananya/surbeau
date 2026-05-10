"use client";

import { useState } from "react";

export function SearchBar() {
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: hook up to /search after Supabase wiring
      }}
      className="mx-5 mt-2 flex items-center gap-1.5 rounded-full border border-[color:var(--color-border-default)] bg-[color:var(--color-surface)] p-1 pl-5"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ค้นหาคลินิก / โปรหัตถการ..."
        className="flex-1 bg-transparent py-2 text-[0.92rem] text-[color:var(--color-foreground)] placeholder:text-[color:var(--color-muted)] focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-full bg-[color:var(--color-gold)] px-5 py-2 text-[0.85rem] font-semibold text-black transition-colors hover:bg-[color:var(--color-gold-bright)]"
      >
        ค้นหา
      </button>
    </form>
  );
}
