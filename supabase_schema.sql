-- ──────────────────────────────────────────────────────────
-- SMART FRIDGE MPASI OPTIMIZER — DATABASE INITIALIZATION DDL
-- ──────────────────────────────────────────────────────────
-- Buka Dashboard Supabase Anda -> SQL Editor -> Tempel & Jalankan kode ini.

-- 1. Bersihkan tabel jika ada sebelumnya (opsional)
DROP TABLE IF EXISTS favorite_meals;
DROP TABLE IF EXISTS folders;
DROP TABLE IF EXISTS fridge_inventory;

-- 2. Tabel untuk menyimpan bahan kulkas aktif Mama
CREATE TABLE fridge_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel untuk menyimpan folder koleksi favorit Mama
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel untuk menyimpan resep favorit Mama beserta relasi kategorinya
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

-- 5. Insert beberapa folder bawaan (default)
INSERT INTO folders (id, name) VALUES 
  ('default', 'Semua Favorit'),
  ('fast', 'Sarapan Cepat'),
  ('nogtm', 'Anti GTM')
ON CONFLICT (id) DO NOTHING;
