# PRD — Web Generator PDF (Gambar + Tanggal)

## 1. Ringkasan
Web app native (HTML/CSS/JS murni, tanpa framework, tanpa build step) yang di-hosting di GitHub Pages. Fungsinya: user upload beberapa gambar, atur urutannya lewat drag & drop, ketik tanggal secara manual, lalu generate 1 file PDF yang berisi header tanggal + gambar-gambar tersebut — mengikuti gaya layout pada contoh referensi (judul tanggal besar di atas, gambar-gambar tersusun di bawahnya).

## 2. Tujuan
- Mempercepat pembuatan dokumentasi/laporan visual (misalnya bukti posting konten harian) tanpa perlu edit manual di Word/Figma.
- Output akhir berupa PDF yang siap dibagikan, dengan 1 PDF = 1 tanggal.

## 3. User & Use Case
- User: admin/staff yang punya kumpulan gambar (screenshot, materi promo, dsb) untuk 1 tanggal tertentu.
- Use case: user buka web, upload gambar-gambar terkait tanggal itu, urutkan sesuai kebutuhan, ketik tanggalnya, klik generate, PDF ke-download.

## 4. Fitur Utama

### 4.1 Upload Gambar
- User bisa upload banyak gambar sekaligus (multi-select file picker) dan juga drag & drop file dari komputer ke area upload.
- Jumlah gambar **fleksibel** — tidak dibatasi jumlah tetap (bisa 1, 2, 3, atau lebih).
- Format yang didukung: JPG, PNG, WEBP.
- Setelah upload, tiap gambar tampil sebagai thumbnail di area preview/list.

### 4.2 Reorder Gambar (Drag & Drop)
- User bisa drag thumbnail untuk mengubah urutan tampil gambar di PDF nanti.
- Urutan di list preview = urutan render di PDF.
- Ada indikator visual saat drag (highlight posisi drop).
- Tiap thumbnail ada tombol hapus (remove) untuk membuang gambar dari daftar.

### 4.3 Input Tanggal
- Input tanggal berupa **ketik manual** (text input biasa), bukan date picker.
- Tanggal ini yang akan tampil sebagai judul besar di PDF (contoh: "1 AGUSTUS 2026").
- Tidak perlu validasi format yang ketat — user bebas ketik sesuai kebutuhan (tapi beri placeholder contoh format, misal "1 AGUSTUS 2026", supaya konsisten).

### 4.4 Preview Layout
- Sebelum generate, tampilkan preview real-time dari hasil akhir (judul tanggal + susunan gambar) sesuai urutan & tanggal yang sudah diisi user.
- Preview idealnya mengikuti proporsi/layout mendekati PDF final (kertas A4 potrait/landscape — lihat bagian 6).

### 4.5 Generate & Download PDF
- Tombol "Generate PDF" memproses gambar + tanggal menjadi 1 file PDF.
- PDF otomatis ter-download ke device user (client-side, tanpa server/backend).
- Nama file PDF default mengikuti tanggal yang diinput (misal: `1-AGUSTUS-2026.pdf`), tapi mudah diubah nanti kalau perlu.

## 5. Alur Pengguna (User Flow)
1. User buka web app.
2. User upload gambar (klik pilih file atau drag & drop ke area upload).
3. Gambar-gambar muncul sebagai thumbnail list.
4. User drag thumbnail untuk atur urutan (opsional, kalau urutan default upload belum sesuai).
5. User ketik tanggal di input field.
6. Preview layout ter-update otomatis.
7. User klik "Generate PDF".
8. File PDF ter-download otomatis di browser.

## 6. Referensi Layout (dari contoh gambar)
- Bagian atas: teks tanggal besar, bold, center (misal "1 AGUSTUS 2026").
- Bagian bawah: gambar-gambar tersusun berjajar dalam grid (di contoh: 3 gambar sejajar horizontal dengan jarak antar gambar, masing-masing punya border/shadow ringan).
- Karena jumlah gambar fleksibel, grid harus otomatis menyesuaikan (wrap ke baris baru kalau gambar banyak) — misalnya grid 3 kolom per baris, gambar terakhir yang tidak penuh tetap rapi.
- Background PDF putih/polos, konten di-center.

## 7. Tech Stack
- **Native**: HTML + CSS + Vanilla JavaScript murni, tanpa framework (tanpa React/Vue/dsb) dan tanpa build tool/bundler.
- **Hosting**: GitHub Pages (static site, tanpa backend/server).
- **Library eksternal via CDN** (boleh dipakai karena tidak butuh build step):
  - Generate PDF: `jsPDF` (+ `html2canvas` kalau perlu render layout HTML ke gambar dulu sebelum ke PDF, supaya hasil PDF persis sama dengan preview).
  - Drag & drop reorder: bisa native HTML5 Drag & Drop API, atau library ringan seperti `SortableJS` via CDN kalau mau lebih halus interaksinya.
- Semua proses (upload, reorder, generate PDF) berjalan 100% di client-side (browser), tidak ada request ke server.

## 8. Non-Functional Requirements
- Tidak butuh login/autentikasi (tool internal, publik).
- Tidak ada penyimpanan data ke database — semua data (gambar, tanggal) hanya ada di memori browser selama sesi, hilang saat refresh.
- Harus tetap ringan meskipun user upload banyak gambar (pertimbangkan resize/kompres gambar di sisi client sebelum dimasukkan ke PDF, supaya ukuran file PDF tidak terlalu besar).
- Desain responsif dasar (utamanya untuk desktop, karena ini tool kerja, tapi tidak boleh rusak total di layar kecil).

## 9. Out of Scope
- Tidak ada multi-tanggal dalam 1 PDF (sudah dikonfirmasi: 1 tanggal = 1 PDF, generate ulang kalau mau tanggal lain).
- Tidak ada editing gambar (crop/filter/dsb) di dalam web ini.
- Tidak ada backend, database, atau riwayat PDF yang pernah dibuat.
