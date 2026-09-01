# Rules File — Generator PDF (Gambar + Tanggal)

## Prinsip Utama
- **100% native**: hanya HTML, CSS, vanilla JavaScript. DILARANG memakai React, Vue, Svelte, atau framework JS apa pun.
- **Tanpa build step**: tidak boleh ada webpack/vite/npm build. File langsung bisa dibuka via browser atau di-deploy langsung ke GitHub Pages apa adanya.
- **Tanpa backend**: semua logic jalan di browser (client-side). Tidak ada server, API, atau database.
- Library eksternal hanya boleh di-load lewat `<script>` CDN (contoh: jsPDF, html2canvas, SortableJS), jangan lewat `npm install`.

## Struktur Folder
```
/
├── index.html
├── style.css
├── script.js
└── README.md
```
Jangan pecah jadi banyak file JS kecuali benar-benar perlu (misalnya `script.js` boleh dipecah jadi `upload.js`, `reorder.js`, `pdf.js` kalau file utama mulai terlalu panjang) — tapi tetap plain `<script>` tags, tanpa module bundler.

## Konvensi Kode
- Penamaan variabel & fungsi JS: `camelCase`.
- Penamaan class CSS: `kebab-case`.
- Komentar penting di bagian logic yang tidak trivial (misal: proses render preview, proses konversi ke PDF).
- Hindari inline style di HTML — semua styling di `style.css`.

## Aturan Fitur (mengikuti PRD)
- Jumlah gambar yang bisa diupload **tidak dibatasi** secara hardcode.
- Reorder gambar wajib mengubah urutan data di JS (bukan cuma tampilan), karena urutan ini menentukan urutan gambar saat generate PDF.
- Input tanggal adalah `<input type="text">` biasa, BUKAN `<input type="date">`.
- Generate PDF harus murni client-side (pakai jsPDF/html2canvas atau sejenisnya via CDN), hasil PDF langsung ter-download, tidak ada upload ke server mana pun.
- Preview harus update otomatis (real-time) setiap kali: gambar ditambah/dihapus, urutan diubah, atau tanggal diketik ulang.

## Performa
- Sebelum gambar dimasukkan ke PDF, lakukan resize/kompres di client (misal via canvas) supaya ukuran PDF tidak membengkak kalau user upload banyak gambar resolusi tinggi.

## Yang Harus Dihindari
- Jangan tambahkan dependency yang butuh Node.js/npm untuk dijalankan.
- Jangan tambahkan fitur login, database, atau penyimpanan riwayat — di luar scope.
- Jangan buat 1 PDF berisi banyak tanggal — tetap 1 tanggal = 1 PDF sesuai PRD.
