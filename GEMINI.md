# PRD: GlassMark — All-in-One Markdown Tool Website

> Nama "GlassMark" bersifat sementara (working title) — silakan ganti sesuai selera sebelum masuk ke AntiGravity.

---

## 1. Ringkasan Produk

### Problem Statement
Saat ini, kalau seseorang butuh mengedit, mengonversi, atau melengkapi dokumen Markdown (misalnya untuk README, catatan kuliah, dokumentasi teknis), fitur-fiturnya tersebar di banyak situs berbeda: satu situs untuk live preview, situs lain untuk generate tabel, situs lain lagi untuk convert ke PDF, dan situs lain untuk cheatsheet syntax. Kebanyakan situs-situs itu juga penuh iklan, desainnya generik/template, dan tidak terasa premium untuk dipakai sehari-hari.

### Solution
Sebuah website tunggal, **fully client-side** (tanpa backend, tanpa login, tanpa iklan), yang membungkus semua kebutuhan Markdown dalam satu pengalaman yang elegan: editor dengan mode ganda (Split-view & WYSIWYG), live preview, dukungan diagram & rumus matematika, export ke berbagai format, generator tabel & README, serta cheatsheet interaktif — semuanya dibalut desain **Skeuomorphism + Liquid Glass** dengan dasar warna putih, minimalis, dan animasi 3D yang halus.

Website ini akan dibangun bertahap (fase demi fase) menggunakan **AntiGravity** sebagai AI coding tool, dan di-deploy gratis di **Vercel Free Tier**.

---

## 2. Target Pengguna

- Mahasiswa/pelajar yang menulis catatan, laporan, atau tugas dalam format Markdown
- Developer yang menulis README, dokumentasi teknis, atau catatan proyek
- Content creator/blogger yang menulis draft artikel dalam Markdown
- Siapa pun yang butuh tools Markdown cepat tanpa install aplikasi apa pun

---

## 3. User Stories

1. Sebagai pengguna, saya ingin menulis Markdown di satu panel dan melihat hasilnya live di panel sebelah, supaya saya langsung tahu bagaimana tampilan akhirnya.
2. Sebagai pengguna, saya ingin beralih antara mode Split-view dan mode WYSIWYG, supaya saya bisa memilih cara menulis yang paling nyaman.
3. Sebagai pengguna, saya ingin melihat animasi transisi yang halus saat berpindah mode editor, supaya pengalaman terasa premium.
4. Sebagai pengguna, saya ingin source pane memiliki syntax highlighting, supaya lebih mudah membaca struktur Markdown yang saya tulis.
5. Sebagai pengguna, saya ingin toolbar formatting cepat (bold, italic, heading, list, quote, code, link, image, tabel), supaya tidak perlu menghafal semua syntax.
6. Sebagai pengguna, saya ingin melihat jumlah kata, karakter, dan estimasi waktu baca, supaya saya tahu panjang tulisan saya.
7. Sebagai pengguna, saya ingin mode fullscreen/zen mode, supaya bisa fokus menulis tanpa distraksi.
8. Sebagai pengguna, saya ingin divider antar panel bisa di-drag untuk mengatur lebar, supaya saya bisa menyesuaikan tampilan sesuai kebutuhan.
9. Sebagai pengguna, saya ingin bisa import file `.md` dari komputer saya (drag & drop atau file picker), supaya bisa melanjutkan dokumen yang sudah ada.
10. Sebagai pengguna, saya ingin bisa copy hasil dalam bentuk Markdown mentah atau HTML, supaya bisa langsung tempel ke tempat lain.
11. Sebagai pengguna, saya ingin keyboard shortcut umum (Ctrl+B, Ctrl+I, dsb), supaya menulis lebih cepat.
12. Sebagai pengguna, saya ingin menulis diagram dengan syntax Mermaid di dalam code block, supaya diagram alur/flowchart langsung ter-render visual.
13. Sebagai pengguna, saya ingin menulis rumus matematika dengan syntax LaTeX (`$...$` atau `$$...$$`), supaya rumus tampil rapi seperti di jurnal ilmiah.
14. Sebagai pengguna, saya ingin export dokumen saya ke PDF, supaya bisa dicetak atau dikirim sebagai laporan resmi.
15. Sebagai pengguna, saya ingin export dokumen saya ke file HTML, supaya bisa dipakai di tempat lain sebagai halaman web mandiri.
16. Sebagai pengguna, saya ingin export hasil preview sebagai gambar (PNG), supaya bisa dibagikan cepat di media sosial/chat.
17. Sebagai pengguna, saya ingin membuat tabel Markdown lewat editor visual grid (drag pilih jumlah baris/kolom), supaya tidak perlu menulis syntax tabel manual yang rawan salah.
18. Sebagai pengguna, saya ingin generator README dalam bentuk form wizard (nama proyek, deskripsi, instalasi, penggunaan, kontribusi, lisensi, badge), supaya membuat README proyek jadi cepat dan konsisten.
19. Sebagai pengguna, saya ingin memilih badge umum (build status, license, version, dsb) untuk dimasukkan ke README saya, supaya README terlihat profesional.
20. Sebagai pengguna, saya ingin membuka panel cheatsheet Markdown yang bisa dicari, supaya mudah mengingat syntax yang jarang dipakai.
21. Sebagai pengguna, saya ingin klik salah satu contoh di cheatsheet dan langsung ter-insert ke editor saya, supaya belajar sambil praktik.
22. Sebagai pengguna, saya ingin tampilan website terasa seperti panel kaca yang melayang dengan bayangan lembut, supaya kesan premium dan modern terasa dari desainnya.
23. Sebagai pengguna, saya ingin tombol-tombol terasa seperti benda fisik saat ditekan (efek 3D/skeuomorphic), supaya interaksi terasa "hidup".
24. Sebagai pengguna, saya ingin website tetap responsif dan nyaman dipakai di HP, supaya saya tetap bisa menulis Markdown saat di luar laptop.
25. Sebagai pengguna, saya ingin diperingatkan sebelum menutup/reload tab jika ada perubahan yang belum saya export, supaya saya tidak kehilangan tulisan tanpa sadar.
26. Sebagai pengguna, saya ingin website ini cepat diakses tanpa perlu login/daftar akun, supaya bisa langsung dipakai kapan saja.
27. Sebagai pengguna, saya ingin semua animasi tetap halus dan tidak mengganggu performa, supaya pengalaman menulis tetap lancar walau banyak efek visual.

---

## 4. Cakupan Fitur Utama

### 4.1 Core Editor
- Toggle mode: **Split-view** (source kiri, live preview kanan) ⟷ **WYSIWYG** (edit langsung seperti rich text)
- Live preview real-time (debounced agar tidak lag saat mengetik cepat)
- Syntax highlighting di source pane
- Toolbar formatting cepat (bold, italic, heading, list, blockquote, code, link, image, insert table, horizontal rule)
- Word count, character count, estimasi waktu baca
- Fullscreen/Zen mode
- Divider resizable dengan drag handle
- Import file `.md` (drag & drop + file picker)
- Copy to clipboard (Markdown mentah / HTML)
- Keyboard shortcuts standar
- Auto-scroll sync antar panel source & preview (saat mode split)

### 4.2 Export Engine
- Export ke **PDF** (client-side)
- Export ke **HTML** (file HTML mandiri, sudah termasuk styling)
- Export ke **Gambar (PNG)** dari hasil preview
- Print-friendly stylesheet (opsional print langsung dari browser)

### 4.3 Diagram & Math Rendering
- **Mermaid.js**: flowchart, sequence diagram, class diagram, gantt chart — ditulis dalam code fence ```mermaid
- **KaTeX**: rumus matematika inline (`$...$`) dan block (`$$...$$`)
- Render otomatis update saat mengetik

### 4.4 Table Generator & README Generator
- **Table Generator**: grid interaktif untuk menentukan jumlah baris/kolom, klik untuk generate syntax tabel Markdown, langsung insert ke editor
- **README Generator**: form wizard multi-step (nama proyek, deskripsi, badge, instalasi, penggunaan, kontribusi, lisensi) yang menghasilkan draft README.md siap pakai, bisa insert ke editor atau langsung download

### 4.5 Markdown Cheatsheet / Panduan Interaktif
- Panel/side-drawer berisi daftar syntax Markdown lengkap dengan contoh
- Bisa dicari/difilter berdasarkan kategori (Basic, Extended/GFM, Diagram, Math)
- Klik contoh → langsung ter-insert ke posisi kursor di editor

### 4.6 Nice-to-have (kandidat fase lanjutan setelah MVP)
- Task list (checkbox), footnotes, strikethrough (bagian dari GFM, bisa masuk lebih awal karena ringan)
- Emoji shortcode
- Accent color picker (tetap dalam batas tema putih/glass, hanya warna aksen yang berubah)

---

## 5. Desain UI/UX — Skeuomorphism + Liquid Glass

### Palet Warna
| Token | Hex/Value | Kegunaan |
|---|---|---|
| Base | `#FFFFFF` | Latar utama, putih bersih |
| Surface Secondary | `#F5F6FA` | Kontras halus antar section |
| Glass Panel | `rgba(255,255,255,0.55)` + `backdrop-blur(20px)` | Efek liquid glass di navbar, card, modal |
| Ink (teks utama) | `#1E2230` | Charcoal lembut, bukan hitam pekat |
| Accent | `#4C6FFF` | CTA, state aktif, highlight refraksi kaca |
| Success/Secondary Accent | `#22C55E` | Notifikasi sukses (mis. export berhasil) |
| Shadow Halus | `rgba(30,34,48,0.08)` | Bayangan default (efek skeuomorphic) |
| Shadow Elevated | `rgba(30,34,48,0.15)` | Bayangan saat hover/aktif |

### Tipografi
- **Display/UI**: Plus Jakarta Sans — dipakai untuk heading, label tombol, navbar
- **Body**: Inter — dipakai untuk teks panjang di preview pane
- **Monospace/Kode**: JetBrains Mono — dipakai di source editor pane dan code block di preview

### Konsep Layout
- **Navbar**: panel kaca mengambang (floating glass navbar) berisi logo, toggle mode editor, tombol export, dan accent color picker — memberi kesan seperti kaca yang "didockkan" di atas konten
- **Area utama**: dua panel split-view dengan divider berbentuk pill 3D di tengah (efek skeuomorphic seperti tombol fisik kecil)
- **Sidebar kanan (collapsible)**: berisi Cheatsheet & Tools (Table Generator, README Generator), muncul dengan animasi slide + fade, permukaan kaca transparan dengan highlight refraksi saat hover
- **Card 3D elevation**: setiap tools direpresentasikan sebagai "kartu kaca" — saat hover terangkat (`translateY(-4px)` + shadow membesar), seperti tombol fisik yang bisa ditekan

### Elemen Signature (Ciri Khas Utama)
**Liquid Glass Toggle Switch** — tombol toggle antara mode Split-view dan WYSIWYG yang saat diklik menampilkan animasi "kaca mencair" (morphing blur + shape transition, bisa memakai SVG filter turbulence/`clip-path`). Ini menjadi elemen paling khas dan paling diingat dari seluruh website.

### Motion & Animasi
- Framer Motion untuk semua transisi state (toggle mode, buka/tutup sidebar, modal Table/README Generator)
- Micro-interaction "press": tombol mengecil (`scale(0.97)`) dan bayangan mengempis saat diklik, meniru tombol fisik ditekan
- Ambient background: beberapa "orb" blur radial warna aksen transparan yang bergerak sangat pelan (parallax halus) — memberi kesan hidup tanpa mengganggu fokus menulis
- Menghormati `prefers-reduced-motion` — animasi non-esensial dimatikan otomatis jika pengguna mengaktifkan pengaturan ini

### Aksesibilitas & Responsif
- Kontras teks minimal AA meski di atas permukaan kaca transparan (tambahkan overlay solid tipis bila blur tidak cukup kontras)
- Keyboard focus terlihat jelas (outline warna aksen)
- Mobile: split-view otomatis berubah jadi tab (Source / Preview) karena layar sempit tidak cukup untuk dua panel berdampingan

---

## 6. Tech Stack & Arsitektur

- **Framework**: Next.js 14 (App Router) — **fully client-side**, tanpa API routes/backend/database
- **Styling**: Tailwind CSS + custom CSS variables untuk token desain (warna, shadow, blur)
- **Editor Source Pane**: CodeMirror 6
- **Parser Markdown**: remark + rehype (unified.js) dengan `remark-gfm` (tabel, strikethrough, task list)
- **Math**: KaTeX (`rehype-katex` atau integrasi manual)
- **Diagram**: Mermaid.js
- **Export PDF/Image**: html2canvas + jsPDF (client-side, tanpa server)
- **Animasi**: Framer Motion
- **State Management**: React state lokal; Zustand (ringan) jika dibutuhkan state global (mode editor aktif, accent color)
- **Hosting**: Vercel Free Tier
- **AI Coding Tool**: AntiGravity (Gemini) — mengerjakan PRD ini fase demi fase

> Catatan: Karena keputusan penyimpanan bersifat **ephemeral (tanpa riwayat/tanpa database lokal)**, project ini **tidak** memerlukan IndexedDB/Dexie.js. Semua data hanya ada di memori browser selama sesi berlangsung.

---

## 7. Modul-Modul Utama (Deep Modules)

1. **Editor Core Module** — mengelola input source & mode toggle. Interface: `getValue()`, `setValue()`, `onChange()`, `mode: 'split' | 'wysiwyg'`
2. **Preview Renderer Module** — mengubah string Markdown menjadi HTML aman (pipeline remark + plugin). Interface: `render(markdownString): string`
3. **Diagram & Math Renderer (sub-modul dari Preview Renderer)** — mendeteksi code-fence `mermaid` dan delimiter math, lalu me-render via Mermaid.js/KaTeX
4. **Export Engine Module** — menerima node hasil render → menghasilkan file (PDF/HTML/PNG) & memicu download. Interface: `exportAs(format, node)`
5. **Table Generator Module** — UI grid interaktif → menghasilkan string tabel Markdown → callback insert ke Editor Core
6. **README Generator Module** — form wizard multi-step → menghasilkan string README dari template → insert/download
7. **Cheatsheet Module** — data statis daftar syntax + contoh, searchable, insert-on-click ke editor
8. **Design System / Theme Module** — provider CSS variables (token warna/shadow/blur), accent color picker, pengelolaan animasi global (termasuk reduced-motion)

Setiap modul harus reusable dan bisa diuji terpisah dari UI — logika parsing/generation sebagai pure function, sedangkan UI-nya sebagai komponen/hook React terpisah.

---

## 8. Fase Pengembangan (untuk dikerjakan bertahap di AntiGravity)

### Fase 0 — Setup Project & Fondasi Desain
- Init Next.js + Tailwind, setup font (Plus Jakarta Sans, Inter, JetBrains Mono)
- Buat CSS variables token desain (warna, shadow, blur)
- Buat komponen dasar: `GlassPanel`, `Button3D` (efek press skeuomorphic)
- **Kriteria selesai**: halaman kosong menampilkan navbar kaca mengambang + ambient blur orb di background, sudah responsif dasar

### Fase 1 — Core Markdown Editor (Split-view)
- Integrasi CodeMirror 6 sebagai source pane
- Pipeline remark + `remark-gfm` untuk render preview pane
- Divider draggable untuk resize panel
- **Kriteria selesai**: user bisa mengetik Markdown di kiri, preview live update di kanan, fitur GFM (tabel, strikethrough, task list) sudah berfungsi

### Fase 2 — Mode WYSIWYG + Animasi Toggle Signature
- Bangun mode WYSIWYG (bisa pakai wrapper seperti Tiptap, atau custom contenteditable yang dikonversi ke Markdown)
- Bangun Liquid Glass Toggle Switch dengan animasi morphing
- **Kriteria selesai**: user bisa berpindah mode split ⟷ WYSIWYG dengan animasi kaca mencair, data Markdown tetap sinkron di kedua mode

### Fase 3 — Diagram (Mermaid) & Math (KaTeX)
- Integrasi rendering Mermaid.js untuk fenced code block
- Integrasi KaTeX untuk delimiter math inline & block
- **Kriteria selesai**: menulis ```mermaid flowchart dan `$$E=mc^2$$` langsung ter-render visual di preview

### Fase 4 — Export Engine
- Implementasi export PDF, HTML, dan PNG dari preview pane
- **Kriteria selesai**: tombol Export menghasilkan file terunduh sesuai format terpilih, hasil visual konsisten dengan preview (termasuk diagram & rumus math)

### Fase 5 — Table Generator & README Generator
- Modal/panel Table Generator (grid interaktif tentukan baris/kolom → insert)
- Modal README Generator (form wizard → generate template README + badge)
- **Kriteria selesai**: kedua tools bisa insert hasil generate ke editor dan bisa didownload terpisah

### Fase 6 — Markdown Cheatsheet / Panduan Interaktif
- Sidebar/halaman cheatsheet, bisa dicari, klik contoh → insert ke editor
- **Kriteria selesai**: minimal 20+ entri syntax Markdown lengkap dengan contoh interaktif

### Fase 7 — Polish: Animasi, Microinteraction, Aksesibilitas, Mobile
- Tambahkan micro-interaction skeuomorphic (efek press tombol), ambient motion background
- Implementasi `prefers-reduced-motion`, layout mobile (tab Source/Preview)
- **Kriteria selesai**: skor Accessibility Lighthouse 90+, semua interaksi utama sudah memiliki animasi halus, tampilan baik di perangkat mobile

### Fase 8 — QA & Deploy ke Vercel
- Testing lintas browser (Chrome, Firefox, Safari — cek fallback `backdrop-filter`)
- Build production, deploy ke Vercel Free Tier, cek ukuran bundle masih dalam batas gratis
- **Kriteria selesai**: website live di domain Vercel, semua fitur berjalan normal di production build

---

## 9. Keputusan Implementasi Kunci

- Mode editor: **toggle** antara Split-view & WYSIWYG (bukan hanya salah satu)
- **Tanpa backend/database** — fully client-side, tanpa akun/login
- **Tanpa penyimpanan riwayat dokumen** (ephemeral per sesi) — user diberi peringatan (`beforeunload`) sebelum menutup/reload tab jika ada perubahan belum di-export
- Keempat fitur unggulan (Export, Diagram+Math, Table+README Generator, Cheatsheet) masuk dalam scope MVP, bukan fitur opsional terpisah
- Konsistensi desain Skeuomorphism + Liquid Glass + dasar putih wajib diterapkan di semua halaman/modal (termasuk Table Generator & README Generator — bukan modal polos tanpa styling)

---

## 10. Keputusan Testing

- Unit test untuk modul murni (Preview Renderer, fungsi generator Table Generator, fungsi generator README Generator) menggunakan **Vitest** — pastikan string Markdown yang dihasilkan sesuai spesifikasi
- Testing manual/eksploratif untuk interaksi visual (animasi, toggle, hasil export file) karena sifatnya visual/UX dan sulit diotomatisasi dengan efisien di tahap MVP
- E2E test otomatis penuh (mis. Playwright) **tidak wajib** di MVP — bisa ditambahkan di fase lanjutan jika project berkembang

---

## 11. Out of Scope (untuk MVP ini)

- Autentikasi/akun pengguna
- Penyimpanan cloud atau riwayat dokumen (localStorage/IndexedDB) — sesuai keputusan ephemeral
- Kolaborasi real-time multi-user
- Dark mode — dasar warna putih adalah keputusan desain final untuk versi ini
- Backend API, monetisasi, atau iklan

---

## 12. Catatan Tambahan untuk AntiGravity

- Kerjakan PRD ini **fase demi fase** sesuai urutan di atas — jangan lompat ke fase berikutnya sebelum kriteria selesai fase sebelumnya terpenuhi
- Selalu cek ukuran bundle & dependency yang dipakai agar tetap ringan (batas Vercel Free Tier & performa client-side)
- Prioritaskan komponen reusable (`GlassPanel`, `Button3D`, `Modal`) di Fase 0 agar dipakai konsisten di semua fase selanjutnya
- Untuk efek `backdrop-filter` (liquid glass), sediakan fallback background solid untuk browser yang tidak mendukung, agar tampilan tetap elegan di semua kondisi
