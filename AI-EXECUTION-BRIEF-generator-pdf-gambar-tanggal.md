# AI Execution Brief — Generator PDF (Gambar + Tanggal)

Gunakan brief ini di AI IDE (Cursor/Windsurf/Antigravity/dll) sebagai instruksi eksekusi. Baca juga `PRD-generator-pdf-gambar-tanggal.md` dan `RULES-generator-pdf-gambar-tanggal.md` sebagai acuan detail fitur dan aturan koding.

## Konteks Singkat
Bangun static web app (native HTML/CSS/JS, tanpa framework, tanpa build tool) untuk generate PDF berisi header tanggal (input manual) + gambar-gambar yang diupload user, dengan fitur drag & drop reorder gambar. Target hosting: GitHub Pages.

## Urutan Implementasi (Milestone)

### Milestone 1 — Skeleton & Struktur Dasar
1. Buat `index.html`, `style.css`, `script.js`.
2. Buat layout dasar: area upload gambar, area preview/list thumbnail, input tanggal, tombol "Generate PDF".
3. Load library CDN di `index.html`: jsPDF, html2canvas (dan SortableJS kalau dipakai untuk drag & drop).

### Milestone 2 — Upload Gambar
1. Implement input file multi-select + drag & drop file dari luar browser ke area upload.
2. Setiap file yang diupload di-render sebagai thumbnail (pakai `FileReader` / `URL.createObjectURL`).
3. Simpan data gambar (urutan, file/objectURL) dalam array JS sebagai source of truth.
4. Tambahkan tombol hapus di tiap thumbnail untuk remove dari array + re-render list.

### Milestone 3 — Drag & Drop Reorder
1. Implement drag & drop pada list thumbnail (native HTML5 Drag & Drop API atau SortableJS).
2. Saat urutan thumbnail berubah di UI, update juga urutan di array data JS (bukan cuma visual DOM).
3. Pastikan urutan array ini yang dipakai nanti saat generate PDF.

### Milestone 4 — Input Tanggal & Preview
1. Buat input text untuk tanggal, dengan placeholder contoh (misal: "1 AGUSTUS 2026").
2. Buat area preview yang menampilkan tanggal (besar, bold, center) + grid gambar sesuai urutan array — layout mengikuti referensi PRD (grid gambar, wrap otomatis kalau banyak).
3. Preview harus re-render otomatis setiap ada perubahan (upload, hapus, reorder, ketik tanggal) — pakai event listener yang trigger fungsi render bersama.

### Milestone 5 — Generate PDF
1. Saat tombol "Generate PDF" diklik: capture elemen preview (via `html2canvas`) atau susun langsung pakai jsPDF (image + text) sesuai urutan array gambar dan teks tanggal.
2. Resize/kompres gambar sebelum dimasukkan ke PDF supaya file tidak terlalu besar.
3. Set nama file PDF otomatis berdasarkan tanggal yang diketik user (sanitize karakter yang tidak valid untuk nama file).
4. Trigger download PDF ke browser user.

### Milestone 6 — Polish & Deploy
1. Rapikan styling (spacing, warna, responsif dasar).
2. Test dengan berbagai jumlah gambar (1, banyak, campuran ukuran/orientasi).
3. Pastikan semua file bisa langsung jalan tanpa build step — buka `index.html` langsung di browser harus berfungsi penuh.
4. Push ke repo GitHub, aktifkan GitHub Pages dari branch/folder yang sesuai.

## Definition of Done
- User bisa upload banyak gambar, drag untuk reorder, ketik tanggal manual, lihat preview real-time, lalu generate & download PDF sesuai layout referensi.
- Tidak ada dependency Node/npm/build tool — murni file statis yang siap deploy ke GitHub Pages.
