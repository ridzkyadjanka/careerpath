# CareerPath

Website bimbingan karier untuk mahasiswa: profil, asesmen minat, rekomendasi karier, review CV, roadmap belajar, dan karier tersimpan. Dibuat dengan HTML, CSS, dan JavaScript murni (tanpa framework, tanpa instalasi).

## Cara menjalankan

1. Ekstrak `careerpath.zip`, lalu drag and drop folder `careerpath` ke Visual Studio Code.
2. Pasang ekstensi **Live Server** (Ritwick Dey) bila belum ada.
3. Klik kanan `index.html` → **Open with Live Server**.

Bisa juga langsung membuka `index.html` dengan double-click di browser.

## Struktur folder

```
careerpath/
├── index.html              Home (halaman depan)
├── start.html              Personal Workspace (nama + bidang studi)
├── dashboard.html          Dashboard
├── profile.html            My Profile (+ ekspor/impor/hapus data)
├── assessment.html         Career Assessment (6 pertanyaan)
├── career-matches.html     Career Matches (+ pencarian)
├── career-detail.html      Career Detail (?id=data-analyst)
├── cv-analyzer.html        CV Analyzer
├── learning-roadmap.html   Learning Roadmap
├── saved-careers.html      Saved Careers
└── assets/
    ├── css/style.css       Seluruh tampilan (warna di bagian :root)
    ├── js/data.js          Konten: karier, pertanyaan, roadmap, kata kunci CV
    ├── js/app.js           Logika semua halaman + penyimpanan localStorage
    └── img/favicon.svg
```

## Cara mengubah konten

- **Menambah karier:** tambahkan objek baru di `careers` pada `assets/js/data.js` (beri `family` baru, lalu tambahkan opsi dengan `family` yang sama di setiap pertanyaan agar skornya terhitung).
- **Mengubah pertanyaan asesmen:** edit `questions` di `data.js`.
- **Mengubah tahap roadmap:** edit `roadmap.steps` di `data.js`.
- **Mengubah warna:** edit variabel di `:root` pada `assets/css/style.css`.

## Cara kerja

- **Skor keselarasan minat** = persentase jawaban asesmen yang mengarah ke setiap kelompok karier. Ini bukan prediksi peluang kerja.
- **CV Analyzer** memeriksa kata kunci bahasa Inggris sesuai target karier, judul bagian umum (Education, Experience, Skills, Project), angka sebagai bukti dampak, dan panjang teks.
- **Penyimpanan data** menggunakan `localStorage` browser dengan key `careerpath:v1`. Data hilang bila riwayat browser dihapus, jadi gunakan tombol *Download my progress* di My Profile untuk cadangan.

## Rencana pengembangan

Login/Register dan sinkronisasi data, database, perluasan katalog karier, skill gap analysis, roadmap personal, upload CV PDF/DOCX, AI career assistant, career comparison, rekomendasi materi belajar, laporan karier PDF, admin dashboard, dan dukungan bahasa Indonesia/Inggris.
