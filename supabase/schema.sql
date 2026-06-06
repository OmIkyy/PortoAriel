-- SQL Schema untuk Supabase Real-time Portfolio
-- Buat tabel portfolio_data untuk menyimpan seluruh konfigurasi portofolio secara dinamis.

-- 1. Membuat tabel
CREATE TABLE IF NOT EXISTS public.portfolio_data (
    id TEXT PRIMARY KEY DEFAULT 'ariel_portfolio',
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Mengaktifkan Row Level Security (RLS) agar data aman atau bisa diatur hak aksesnya
ALTER TABLE public.portfolio_data ENABLE ROW LEVEL SECURITY;

-- 3. Membuat policy untuk memperbolehkan semua orang membaca data portfolio kita (Public Read)
DROP POLICY IF EXISTS "Allow public read access" ON public.portfolio_data;
CREATE POLICY "Allow public read access" ON public.portfolio_data
    FOR SELECT USING (true);

-- 4. Membuat policy untuk mengizinkan perubahan data (Upsert/Update)
-- Agar lebih aman di lingkungan produksi, Anda bisa membatasi ini untuk user terautentikasi saja, 
-- namun untuk simulasi dan kemudahan portofolio SMK ini, kita ijinkan akses penuh atau anon write.
DROP POLICY IF EXISTS "Allow public write or update access" ON public.portfolio_data;
CREATE POLICY "Allow public write or update access" ON public.portfolio_data
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Mengaktifkan kemampuan REAL-TIME untuk tabel ini
-- Agar setiap browser klien menerima perubahan data secara instan saat admin mengedit,
-- pastikan tabel ini dimasukkan ke dalam publikasi realtime Supabase.
-- Catatan: Jika ada error bahwa tabel ini sudah ada dalam publikasi, abaikan saja karena itu berarti real-time sudah aktif!
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_data;

-- 6. Memasukkan baris data awal (opsional) agar tidak kosong saat baru terbuat
-- Jika Anda mengunggah pertama kali dari dashboard, baris ini akan ditambahkan secara otomatis oleh aplikasi.
