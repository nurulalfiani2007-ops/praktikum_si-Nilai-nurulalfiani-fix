/* =========================================================
   SiNilai - All-in-One Script (Grade Colors Locked)
   ========================================================= */

const STORAGE_KEY = "sinilai_data";

// ========== KONVERSI NILAI ==========
function hitungGrade(nilai) {
  const n = Number(nilai);
  if (isNaN(n) || nilai === "" || nilai === null) return "-";
  if (n >= 85) return "A";
  if (n >= 75) return "B";
  if (n >= 65) return "C";
  if (n >= 50) return "D";
  return "E";
}

function gradeKeAngka(grade) {
  return { A: 4, B: 3, C: 2, D: 1, E: 0 }[grade] ?? 0;
}

// ========== STATUS LULUS ==========
function tentukanStatusLulus(grade) {
  if (["A", "B", "C", "D"].includes(grade)) {
    return `<span class="badge bg-success" style="padding: 0.5em 1em; font-weight: 600;">✓ Lulus</span>`;
  }
  if (grade === "E") {
    return `<span class="badge bg-danger" style="padding: 0.5em 1em; font-weight: 600;">X Tidak Lulus</span>`;
  }
  return `<span class="badge badge-grade grade-empty">—</span>`;
}

// ========== BADGE GRADE (DIKUNCI KE WARNA ASLI) ==========
function buatBadgeGrade(grade) {
  if (!grade || grade === "-") {
    return `<span class="badge bg-secondary">—</span>`;
  }
  
  let warnaBg = "";
  let warnaTeks = "color: #ffffff;"; 

  switch(grade) {
    case "A":
      warnaBg = "background-color: #10B981;"; // Hijau Asli Anda (TIDAK BERUBAH)
      break;
    case "B":
      warnaBg = "background-color: #3B82F6;"; // Biru Asli Anda (TIDAK BERUBAH)
      break;
    case "C":
      warnaBg = "background-color: #06B6D4;"; // Sian Asli Anda (TIDAK BERUBAH)
      break;
    case "D":
      warnaBg = "background-color: #F59E0B;"; // Oranye Asli Anda (TIDAK BERUBAH)
      break;
    case "E":
      warnaBg = "background-color: #EF4444;"; // Merah Asli Anda (TIDAK BERUBAH)
      break;
    default:
      warnaBg = "background-color: #6B7280;";
  }

  return `<span class="badge" style="${warnaBg} ${warnaTeks} font-size: 0.85rem; padding: 0.4em 0.8em; min-width: 35px; display: inline-block; text-align: center; font-weight: bold; border-radius: 6px;">${grade}</span>`;
}

// ========== CRUD DATA ==========
function ambilDataNilai() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function simpanDataNilai(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function tambahNilai(mk) {
  const data = ambilDataNilai();
  mk.id = Date.now();
  data.push(mk);
  simpanDataNilai(data);
}

function hapusNilai(id) {
  if (confirm("Yakin ingin menghapus mata kuliah ini?")) {
    const data = ambilDataNilai().filter((m) => m.id !== id);
    simpanDataNilai(data);
    refreshTabelInput();
    renderDashboard();
  }
}

function hapusSemuaData() {
  if (confirm("Yakin hapus SEMUA data nilai?")) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

// ========== HITUNG IPK ==========
function hitungIPK() {
  const data = ambilDataNilai();
  if (data.length === 0) return 0;
  const totalBobot = data.reduce((s, m) => s + m.sks * gradeKeAngka(hitungGrade(m.nilai)), 0);
  const totalSKS = data.reduce((s, m) => s + m.sks, 0);
  return totalSKS === 0 ? 0 : totalBobot / totalSKS;
}

// ========== TEMPLATE BARIS TABEL ==========
function buatBarisTabel(mk, index, showSemester = true, showAksi = true) {
  const grade = hitungGrade(mk.nilai);
  const status = tentukanStatusLulus(grade);
  const gradeBadge = buatBadgeGrade(grade);

  return `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${mk.nama}</strong></td>
      <td>${mk.sks}</td>
      <td>${mk.nilai}</td>
      <td>${gradeBadge}</td>
      <td>${status}</td>
      ${showSemester ? `<td>${mk.semester}</td>` : ""}
      ${
        showAksi
          ? `
        <td>
          <button class="btn-hapus" onclick="hapusNilai(${mk.id})" title="Hapus" style="border: 1px solid #ef4444; background: transparent; padding: 2px 8px; border-radius: 6px; cursor: pointer;">
            🗑️
          </button>
        </td>
      `
          : ""
      }
    </tr>
  `;
}

// ========== STATE KOSONG ==========
function tampilkanKosong(tabelSelector, pesan = "Belum ada data nilai.") {
  const tbody = document.querySelector(tabelSelector + " tbody");
  if (!tbody) return;
  const colSpan = tabelSelector.includes("rekap") ? 6 : 8;
  tbody.innerHTML = `
    <tr><td colspan="${colSpan}" class="text-center text-muted py-4">
      <div class="empty-state">
        <div class="icon"></div>
        <div>${pesan}</div>
      </div>
    </td></tr>`;
}

// ========== HALAMAN: DASHBOARD (index.html) ==========
function renderDashboard() {
  const data = ambilDataNilai();
  const tbody = document.querySelector("#tabelDashboard tbody");
  if (!tbody) return;

  const ipk = hitungIPK();
  document.getElementById("statIpk").textContent = data.length ? ipk.toFixed(2) : "-";
  document.getElementById("statTotal").textContent = data.length;

  if (data.length) {
    const nilaiList = data.map((m) => m.nilai);
    document.getElementById("statMax").textContent = Math.max(...nilaiList);
    document.getElementById("statMin").textContent = Math.min(...nilaiList);
  }

  if (data.length === 0) {
    tampilkanKosong("#tabelDashboard");
    return;
  }

  tbody.innerHTML = data.map((mk, i) => buatBarisTabel(mk, i, true, false)).join("");
  tampilkanPesanIpk(ipk);
}

// ========== PESAN ALERT IPK ==========
function tampilkanPesanIpk(ipkSekarang) {
  const el = document.getElementById("pesanIpk");
  if (!el) return;

  if (isNaN(ipkSekarang) || ipkSekarang === 0) {
    el.innerHTML = "";
    return;
  }

  if (ipkSekarang < 2.5) {
    el.innerHTML = `
      <div class="alert alert-warning alert-dismissible fade show" role="alert" style="border-radius: 12px;">
         <strong>Perhatian!</strong> IPK Anda saat ini <b>${ipkSekarang.toFixed(2)}</b>
        — masih di bawah 2.50. Ayo tingkatkan semangat belajar!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="alert alert-success alert-dismissible fade show" role="alert" style="border-radius: 12px; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
         <strong>Selamat!</strong> IPK Anda <b>${ipkSekarang.toFixed(2)}</b>
        — sudah di atas 2.50. Pertahankan prestasimu!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
  }
}

// ========== HALAMAN: INPUT NILAI (input-nilai.html) ==========
function renderTabelInput(data) {
  const tbody = document.querySelector("#tabelNilai tbody");
  if (!tbody) return;

  if (data.length === 0) {
    tampilkanKosong("#tabelNilai", "Tidak ada data yang cocok.");
    return;
  }
  tbody.innerHTML = data.map((mk, i) => buatBarisTabel(mk, i, true, true)).join("");
}

function refreshTabelInput() {
  const data = ambilDataNilai();
  const inputCari = document.getElementById("inputCariMk");
  const kata = inputCari ? inputCari.value.toLowerCase() : "";

  const filtered = data.filter((mk) => mk.nama.toLowerCase().indexOf(kata) !== -1);
  renderTabelInput(filtered);

  const ipk = hitungIPK();
  const infoCount = document.getElementById("infoCount");
  if (infoCount) {
    infoCount.textContent = `${data.length} MK | IPK: ${data.length ? ipk.toFixed(2) : "—"}`;
  }
}

function initInputNilai() {
  const inputCari = document.getElementById("inputCariMk");
  const formNilai = document.getElementById("formNilai");

  if (!inputCari || !formNilai) return;

  inputCari.addEventListener("input", refreshTabelInput);

  formNilai.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const namaInput = document.getElementById("nama").value.trim();
    const sksInput = parseInt(document.getElementById("sks").value);
    const nilaiInput = parseInt(document.getElementById("nilai").value);
    const semesterInput = document.getElementById("semester").value;

    if (!namaInput) {
      alert("Nama Mata Kuliah tidak boleh kosong!");
      return;
    }
    if (isNaN(sksInput) || sksInput <= 0) {
      alert("SKS harus berupa angka lebih dari 0!");
      return;
    }
    if (isNaN(nilaiInput) || nilaiInput < 0 || nilaiInput > 100) {
      alert("Nilai harus berupa angka antara 0 sampai 100!");
      return;
    }

    tambahNilai({
      nama: namaInput,
      sks: sksInput,
      nilai: nilaiInput,
      semester: semesterInput,
    });

    e.target.reset();
    refreshTabelInput();
  });

  refreshTabelInput();
}

// ========== HALAMAN: REKAP (rekap.html) ==========
function renderRekap() {
  const container = document.getElementById("containerRekap");
  if (!container) return;

  const data = ambilDataNilai();

  if (data.length === 0) {
    container.innerHTML = `
      <div class="card shadow-sm" style="border-radius: 16px;">
        <div class="card-body empty-state text-center py-5">
          <div class="icon" style="font-size: 2.5rem;">📭</div>
          <p class="text-muted">Belum ada data nilai untuk ditampilkan.</p>
          <a href="input-nilai.html" class="btn btn-primary" style="background-color: #4F46E5; border: none;">Mulai Input Nilai</a>
        </div>
      </div>`;
    return;
  }

  const grouped = {};
  data.forEach((mk) => {
    if (!grouped[mk.semester]) grouped[mk.semester] = [];
    grouped[mk.semester].push(mk);
  });

  const sortedSemesters = Object.keys(grouped).sort();

  const tabelHTML = sortedSemesters
    .map((sem) => {
      const list = grouped[sem];
      const ipkSem =
        list.reduce((s, m) => s + m.sks * gradeKeAngka(hitungGrade(m.nilai)), 0) / list.reduce((s, m) => s + m.sks, 0);

      const rows = list.map((mk, i) => buatBarisTabel(mk, i, false, false)).join("");

      return `
      <div class="semester-group mb-5" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0" style="color: #4F46E5; font-weight: 700;">${sem}</h5>
          <span class="badge rounded-pill" style="background-color: #007bff; font-size: 0.85rem; padding: 0.6em 1.2em; font-weight: bold;">IPK: ${ipkSem.toFixed(2)}</span>
        </div>
        <div class="table-responsive" style="border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <table class="table table-hover align-middle mb-0">
            <thead style="background-color: #4F46E5 !important; color: #ffffff !important;">
              <tr>
                <th style="background-color: #4F46E5 !important; color: #ffffff !important; padding: 14px 16px;">No</th>
                <th style="background-color: #4F46E5 !important; color: #ffffff !important; padding: 14px 16px;">Mata Kuliah</th>
                <th style="background-color: #4F46E5 !important; color: #ffffff !important; padding: 14px 16px;">SKS</th>
                <th style="background-color: #4F46E5 !important; color: #ffffff !important; padding: 14px 16px;">Nilai</th>
                <th style="background-color: #4F46E5 !important; color: #ffffff !important; padding: 14px 16px;">Grade</th>
                <th style="background-color: #4F46E5 !important; color: #ffffff !important; padding: 14px 16px;">Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
    })
    .join("");

  container.innerHTML = tabelHTML;

  const ipkKumulatif = hitungIPK();
  tampilkanPesanIpk(ipkKumulatif);
}

// ========== INISIALISASI ==========
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("tabelDashboard")) {
    renderDashboard();
  }

  if (document.getElementById("tabelNilai")) {
    initInputNilai();
  }

  if (document.getElementById("containerRekap")) {
    renderRekap();
  }
});