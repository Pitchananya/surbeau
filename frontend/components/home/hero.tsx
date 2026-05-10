export function Hero() {
  return (
    <section className="px-5 pt-4 pb-3 lg:px-0 lg:pt-16 lg:pb-10">
      {/* Mobile */}
      <div className="lg:hidden">
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
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex items-center gap-3 text-[0.78rem] font-medium tracking-[0.28em] text-[color:var(--color-gold)]">
            <span className="h-px w-10 bg-[color:var(--color-gold-deep)]" />
            BEAUTY · CLINIC · PLATFORM
          </div>
          <h1 className="mt-5 text-[3.5rem] font-extrabold leading-[1.05] tracking-tight">
            ค้นหาคลินิกความงามที่
            <br />
            <span className="text-gold-gradient">ใช่สำหรับคุณ</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[1.1rem] leading-relaxed text-[color:var(--color-muted-strong)]">
            พบคลินิกที่เชื่อถือได้ในทุกจังหวัด — เปรียบเทียบราคา รีวิวจริงจากลูกค้า
            พร้อมระบบจองและส่วนลดเฉพาะสมาชิก
          </p>
        </div>
      </div>
    </section>
  );
}
