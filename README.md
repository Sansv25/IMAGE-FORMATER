# PDF Image Formatter — Generator PDF Dokumentasi (Gambar + Tanggal)

Aplikasi web statis native (murni HTML5, CSS3, dan Vanilla JavaScript) yang di-hosting di GitHub Pages. Aplikasi ini berfungsi untuk membuat 1 file dokumen PDF dari sekumpulan gambar yang diupload user dengan header judul tanggal kustom.

---

## 🌟 Fitur Utama

- **Upload Gambar Fleksibel**: Mendukung upload banyak gambar sekaligus via multi-select file picker atau drag & drop file langsung dari komputer (format JPG, PNG, WEBP).
- **Drag & Drop Reorder**: Mengatur urutan tampilan gambar dengan menggeser thumbnail secara langsung (menggunakan SortableJS). Urutan di UI tersinkronisasi 100% dengan urutan render di PDF.
- **Header Tanggal Kustom**: Input teks tanggal manual (bebas ketik, misal: `"1 AGUSTUS 2026"`), dilengkapi dengan tombol pintas (*quick preset*) tanggal hari ini dan kapitalisasi otomatis.
- **Live Preview Real-Time**: Tampilan preview lembar A4 interaktif yang ter-update secara otomatis setiap kali ada perubahan data (upload, hapus, reorder, atau ubah teks tanggal).
- **Pengaturan Grid Flexible**: Pilihan opsi layout 2, 3, atau 4 kolom serta opsi orientasi A4 (Portrait / Landscape).
- **Client-Side Image Optimization**: Kompresi & penyesuaian ukuran gambar di sisi browser sebelum dimasukkan ke PDF untuk menjaga ukuran file tetap efisien.
- **100% Client-Side & Secure**: Semua proses berjalan sepenuhnya di browser pengguna tanpa backend/server, sehingga data gambar dan dokumen Anda 100% aman dan privat.

---

## 🛠️ Tech Stack

- **Core**: HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+).
- **Framework**: Tanpa Framework (No React/Vue/Node.js dependencies).
- **Build Tool**: Tanpa Build Step (Langsung jalan di browser).
- **External Libraries (via CDN)**:
  - [SortableJS v1.15.2](https://github.com/SortableJS/Sortable) — Interaksi Drag & Drop Reorder.
  - [html2canvas v1.4.1](https://html2canvas.hertzen.com/) — High-DPI canvas capture.
  - [jsPDF v2.5.1](https://github.com/parallax/jsPDF) — Export PDF client-side.

---

## 🚀 Cara Menjalankan Secara Lokal

Karena aplikasi ini 100% statis tanpa build step:

1. Clone atau download repositori ini.
2. Buka file `index.html` langsung di browser favorit Anda (Chrome, Firefox, Edge, Safari).
3. (Opsional) Jika menggunakan VS Code, Anda bisa klik kanan `index.html` lalu pilih **Open with Live Server**.

---

## 🌐 Cara Deploy ke GitHub Pages

1. Push seluruh file proyek (`index.html`, `style.css`, `script.js`, `README.md`) ke repositori GitHub Anda.
2. Di repositori GitHub, buka menu **Settings** > **Pages**.
3. Di bagian **Build and deployment**:
   - **Source**: Pilih `Deploy from a branch`.
   - **Branch**: Pilih `main` (atau `master`) dan folder `/ (root)`.
4. Klik **Save**.
5. Dalam beberapa detik, web app Anda akan aktif di URL `https://<username>.github.io/<repo-name>/`.

---

## 📄 Lisensi

MIT License — Bebas digunakan dan dikembangkan untuk kebutuhan personal maupun komersial.
