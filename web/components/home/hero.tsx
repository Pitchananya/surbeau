export function Hero() {
  return (
    <section className="px-5 pt-4 pb-3">
      <div className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.22em] text-[color:var(--color-gold)]">
        <span className="h-px w-6 bg-[color:var(--color-gold-deep)]" />
        BEAUTY PLATFORM
      </div>
      <h1 className="mt-2 text-[2.1rem] font-extrabold leading-tight">
        คลินิกใกล้
        <span className="text-gold-gradient">ฉัน</span>
      </h1>
      <p className="mt-1.5 text-[0.92rem] text-[color:var(--color-muted-strong)]">
        พบคลินิกที่ใช่ เปรียบราคา ดูรีวิวจริง
      </p>
    </section>
  );
}
