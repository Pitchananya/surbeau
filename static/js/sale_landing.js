// โหลดแคมเปญจาก backend มาวางในหน้า landing
async function loadCampaigns() {
  const listEl = document.getElementById("campaign-list");
  const emptyEl = document.getElementById("campaign-empty");
  const countEl = document.getElementById("campaign-count");

  if (!listEl) return; // กัน error ถ้า id ไม่มี

  try {
    const res = await fetch("/campaigns");
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      emptyEl?.classList.remove("d-none");
      if (countEl) countEl.textContent = "ยังไม่มีแคมเปญในระบบ";
      return;
    }

    if (countEl) countEl.textContent = `มีทั้งหมด ${data.length} แคมเปญ`;
    emptyEl?.classList.add("d-none");
    listEl.innerHTML = "";

    data.forEach(c => {
      const col = document.createElement("div");
      col.className = "col-md-4";

      const normalPrice = c.normal_price != null ? Number(c.normal_price).toLocaleString() : "-";
      const promoPrice = c.promo_price != null ? Number(c.promo_price).toLocaleString() : "-";

      col.innerHTML = `
        <div class="campaign-card p-3 h-100">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="fw-semibold mb-0">${c.title}</h6>
            <span class="badge bg-primary-subtle text-primary">คลินิกพันธมิตร</span>
          </div>
          <p class="text-muted small mb-2">${c.description || ""}</p>
          <div class="mb-2">
            <span class="price-original">ปกติ ${normalPrice} บาท</span><br>
            <span class="price-promo">ราคาโปร ${promoPrice} บาท</span>
          </div>
          <p class="small text-muted mb-2">
            *ค่าคอมจะขึ้นกับดีลของคลินิก และอาจแตกต่างกันไปในแต่ละช่วง
          </p>
          <button class="btn btn-outline-primary btn-sm w-100" disabled>
            ดูรายละเอียด (ตัวอย่าง)
          </button>
        </div>
      `;
      listEl.appendChild(col);
    });
  } catch (err) {
    console.error("โหลดแคมเปญไม่สำเร็จ", err);
    emptyEl?.classList.remove("d-none");
    if (countEl) countEl.textContent = "โหลดแคมเปญไม่สำเร็จ";
  }
}

document.addEventListener("DOMContentLoaded", loadCampaigns);
