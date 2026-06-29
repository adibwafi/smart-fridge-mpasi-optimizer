# 👶 Smart Fridge MPASI Optimizer

Smart Fridge MPASI Optimizer adalah aplikasi PWA (Progressive Web App) mobile-first yang dirancang khusus untuk membantu ibu bekerja yang memiliki waktu terbatas (30 menit di pagi hari) dalam merencanakan menu MPASI (Makanan Pendamping ASI) 5 kali sehari untuk anak balita usia 16 bulan.

Aplikasi ini dibangun menggunakan arsitektur **100% Free Tier** untuk efisiensi biaya maksimal, dengan integrasi pencarian visual TikTok untuk mempermudah Mama melihat video tutorial memasak secara instan tanpa perlu berselancar manual.

---

## 🚀 Fitur Utama

1. **Dashboard Inventory Kulkas**: Input tag dinamis cepat dengan saran bahan makanan populer sekali klik untuk memantau isi kulkas Mama.
2. **Matrix 5 Menu MPASI Harian (Groq AI)**: Menghasilkan rencana 5 menu lengkap (Sarapan, Selingan Pagi, Makan Siang, Selingan Sore, Makan Malam) yang dirancang oleh ahli nutrisi anak virtual.
3. **Pencarian Video Tutorial TikTok Dinamis**: Tombol shortcut di setiap resep yang otomatis mencarikan video tutorial masak di TikTok sesuai nama menu rekomendasi AI.
4. **Koleksi Folder Favorit (Khas TikTok)**: Mengelompokkan resep favorit Mama ke dalam folder-folder kustom seperti "Resep Cepat Pagi", "Anti GTM", atau folder buatan sendiri.
5. **Manajemen Profil Anak & Alergi**: Menghindari bahan makanan alergen secara dinamis. AI tidak akan pernah merekomendasikan bahan yang terdaftar sebagai alergen anak.
6. **Sinkronisasi Supabase dengan Fallback Offline**: Sinkronisasi data cloud real-time ke Supabase PostgreSQL, dengan mode fallback otomatis ke `localStorage` (offline/lokal) jika Supabase belum dikonfigurasikan.

---

## 🛠️ Stack Teknologi (100% Free Tier)

* **Framework**: Next.js App Router (React, Tailwind CSS)
* **PWA Engine**: Serwist (Service Worker precaching & offline support)
* **AI Engine**: Groq API LLaMA 3.3 70B (Sangat Cepat & Free Tier Kuota Besar)
* **Database**: Supabase PostgreSQL (Free Tier 500MB)
* **Deployment**: Vercel (Hobby Tier Free)

---

## 📋 Skema Database (Supabase)

Salin dan jalankan script SQL berikut di menu **SQL Editor** pada Dashboard Supabase Anda sebelum menghubungkan aplikasi:

```sql
-- Tabel untuk menyimpan bahan kulkas aktif Mama
CREATE TABLE fridge_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel untuk menyimpan folder koleksi favorit Mama
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel untuk menyimpan resep favorit Mama beserta relasi kategorinya
CREATE TABLE favorite_meals (
  id TEXT PRIMARY KEY,
  folder_id TEXT DEFAULT 'default' REFERENCES folders(id) ON DELETE SET DEFAULT,
  name TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  cooking_time INTEGER NOT NULL,
  nutrition_highlight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert folder bawaan
INSERT INTO folders (id, name) VALUES 
  ('default', 'Semua Favorit'),
  ('fast', 'Sarapan Cepat'),
  ('nogtm', 'Anti GTM')
ON CONFLICT (id) DO NOTHING;
```

---

## ⚙️ Panduan Instalasi Lokal

### 1. Klon Repositori
```bash
git clone https://github.com/adibwafi/smart-fridge-mpasi-optimizer.git
cd smart-fridge-mpasi-optimizer
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan (`.env.local`)
Buat file bernama `.env.local` di direktori root proyek dan masukkan key Anda:

```env
# API Key dari console.groq.com (Gratis)
GROQ_API_KEY=gsk_xxx...

# Opsional: Jika ingin menggunakan sinkronisasi Cloud Supabase
NEXT_PUBLIC_SUPABASE_URL=https://proyek_anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
```

*Catatan: Jika variabel Supabase di atas tidak diisi, aplikasi akan tetap berjalan normal menggunakan mode penyimpanan Local/Offline.*

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```

Buka **[http://localhost:3000](http://localhost:3000)** di browser Anda.

---

## 📱 Panduan PWA (Pasang di Handphone)

1. Jalankan server lokal atau deploy ke Vercel (pastikan menggunakan protokol HTTPS).
2. Buka web tersebut di browser Handphone Anda (Safari untuk iOS, Chrome untuk Android).
3. Klik tombol **Bagikan/Share** (iOS) atau **Menu Titik Tiga** (Android).
4. Pilih opsi **"Tambah ke Layar Utama" / "Add to Home Screen"**.
5. Aplikasi "Smart Fridge MPASI Optimizer" akan terpasang di handphone Anda layaknya aplikasi native dengan dukungan mode offline dan loading instan!

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi MIT.
