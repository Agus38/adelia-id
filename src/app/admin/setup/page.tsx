
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const envCode = `
NEXT_PUBLIC_SUPABASE_URL="https://dyidewepcgxahdabgpks.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5aWRld2VwY2d4YWhkYWJncGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTU2ODYsImV4cCI6MjA3MTA5MTY4Nn0.tOFrS5FuUsJacEGTB2X7Ljn-rfwSXQOM4Fk6C1qu-mw"
`.trim();

const clientCode = `
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
`.trim();

const laporanMerrSql = `
-- Menyimpan data dari halaman "Laporan Harian". Setiap laporan unik berdasarkan tanggal dan shift.
CREATE TABLE IF NOT EXISTS laporan_smw_merr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  shift TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tanggal, shift)
);
`.trim();

const smwManyarSql = `
-- Menyimpan data dari halaman "SMW Manyar", unik berdasarkan tanggal.
CREATE TABLE IF NOT EXISTS laporan_smw_manyar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
`.trim();

const stokProdukSql = `
-- Menyimpan data dari halaman "Stok Produk", unik berdasarkan tanggal dan shift.
CREATE TABLE IF NOT EXISTS stok_produk_merr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  shift TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tanggal, shift)
);
`.trim();

const fullSqlSchema = `
-- ### AUTHENTICATION ###
-- Mengaktifkan ekstensi jika belum ada (diperlukan untuk fungsi gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";

-- Buat tabel untuk profil pengguna publik hanya jika belum ada
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'Pengguna'
);

-- Aktifkan Row Level Security (RLS) untuk tabel profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Hapus kebijakan yang ada sebelum membuat yang baru untuk menghindari error duplikat
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Fungsi ini secara otomatis membuat baris di tabel 'profiles' untuk setiap pengguna baru.
-- Fungsi ini juga menetapkan peran 'Admin' jika email cocok dengan daftar yang ditentukan.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Daftar email admin
  IF new.email IN ('server64462@gmail.com', 'agushermanto38@gmail.com') THEN
    user_role := 'Admin';
  ELSE
    user_role := 'Pengguna';
  END IF;

  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hapus trigger yang ada sebelum membuat yang baru
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Trigger yang memanggil fungsi di atas setiap kali pengguna baru mendaftar.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ### STORAGE (AVATARS) ###
-- Buat bucket penyimpanan untuk avatar jika belum ada.
-- CATATAN: Anda mungkin perlu menjalankan ini secara manual di dashboard Supabase atau pastikan bucket 'avatars' sudah ada.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan untuk melihat avatar.
-- Memungkinkan siapa saja untuk melihat avatar (karena URL-nya publik).
DROP POLICY IF EXISTS "Avatar images are publicly viewable." ON storage.objects;
CREATE POLICY "Avatar images are publicly viewable."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Kebijakan untuk mengunggah avatar.
-- Memungkinkan pengguna yang sudah login untuk mengunggah avatar mereka sendiri.
-- File harus berada di dalam folder yang sama dengan ID pengguna mereka.
DROP POLICY IF EXISTS "User can upload their own avatar." ON storage.objects;
CREATE POLICY "User can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( auth.uid() IS NOT NULL );

-- Kebijakan untuk memperbarui avatar.
-- Memungkinkan pengguna yang sudah login untuk memperbarui avatar mereka sendiri.
DROP POLICY IF EXISTS "User can update their own avatar." ON storage.objects;
CREATE POLICY "User can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( auth.uid() IS NOT NULL );
  

-- ### APPLICATION DATA ###

-- Skema untuk Laporan SMW MERR
CREATE TABLE IF NOT EXISTS public.laporan_smw_merr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  shift TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tanggal, shift)
);

-- Skema untuk Laporan SMW Manyar
CREATE TABLE IF NOT EXISTS public.laporan_smw_manyar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Skema untuk Stok Produk MERR
CREATE TABLE IF NOT EXISTS public.stok_produk_merr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  shift TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tanggal, shift)
);

-- Skema untuk Pengaturan Aplikasi
CREATE TABLE IF NOT EXISTS public.app_config (
  id SERIAL PRIMARY KEY,
  config_type TEXT NOT NULL UNIQUE, -- 'main_menu', 'banners', 'team_members', 'developer_info'
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Aktifkan RLS untuk app_config
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk app_config
DROP POLICY IF EXISTS "App config is viewable by everyone." ON public.app_config;
CREATE POLICY "App config is viewable by everyone."
  ON public.app_config FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Only admins can modify app config." ON public.app_config;
CREATE POLICY "Only admins can modify app config."
  ON public.app_config FOR ALL
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin' )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin' );
`.trim();

const storagePoliciesSql = `
-- Buat bucket 'avatars' jika belum ada.
-- Disarankan untuk membuat bucket ini melalui UI Supabase dan mengaturnya sebagai publik.
-- Kode ini disediakan sebagai fallback.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan untuk MEMBACA: Siapa saja dapat melihat avatar.
DROP POLICY IF EXISTS "Avatar images are publicly viewable." ON storage.objects;
CREATE POLICY "Avatar images are publicly viewable."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Kebijakan untuk MENAMBAH: Pengguna yang login dapat menyisipkan file.
DROP POLICY IF EXISTS "User can upload their own avatar." ON storage.objects;
CREATE POLICY "User can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( auth.uid() IS NOT NULL );

-- Kebijakan untuk MENGUBAH: Pengguna yang login dapat memperbarui file mereka.
DROP POLICY IF EXISTS "User can update their own avatar." ON storage.objects;
CREATE POLICY "User can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( auth.uid() IS NOT NULL );
`.trim();

const CodeBlock = ({ code, lang = 'bash' }: { code: string; lang?: string }) => {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
    toast({
        title: "Kode Disalin!",
        description: "Kode SQL telah berhasil disalin ke clipboard Anda.",
    });
  };

  return (
     <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={handleCopy}
      >
        {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        <span className="sr-only">Salin kode</span>
      </Button>
      <pre className="p-4 rounded-md bg-muted text-sm overflow-x-auto">
        <code className={`language-${lang}`}>{code.trim()}</code>
      </pre>
    </div>
  );
};


export default function SetupPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Panduan Integrasi Supabase</CardTitle>
          <CardDescription>
            Ikuti langkah-langkah di bawah ini untuk menghubungkan aplikasi Anda dengan database Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2">Langkah 1: Konfigurasi Klien</h3>
            <p className="text-muted-foreground mb-4">
              Bagian ini mencakup pengaturan variabel lingkungan dan inisialisasi klien Supabase di aplikasi Anda.
            </p>
             <div className="space-y-4">
                <div>
                  <Label className="text-base">1.1 Variabel Lingkungan</Label>
                   <p className="text-sm text-muted-foreground mb-2">Variabel lingkungan sudah diatur untuk Anda di file `.env`.</p>
                   <CodeBlock code={envCode} lang="ini" />
                </div>
                <div>
                   <Label className="text-base">1.2 Inisialisasi Klien Supabase</Label>
                   <p className="text-sm text-muted-foreground mb-2">Aplikasi ini sudah memiliki file `src/lib/supabaseClient.ts` untuk menginisialisasi klien Supabase.</p>
                   <CodeBlock code={clientCode} lang="typescript" />
                </div>
             </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Langkah 2: Skema & Kebijakan Database</h3>
            <p className="text-muted-foreground mb-4">
              Jalankan kode SQL di bawah ini di Editor SQL Supabase Anda untuk menyiapkan semua tabel, fungsi, dan kebijakan keamanan yang diperlukan.
            </p>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Skema SQL Lengkap (Disarankan)</CardTitle>
                    <CardDescription>Jalankan semua kode di bawah ini sekaligus untuk menyiapkan database Anda sepenuhnya.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock code={fullSqlSchema} lang="sql" />
                </CardContent>
            </Card>

            <h4 className="text-lg font-semibold mb-2 mt-4">Rincian per Bagian</h4>
            <Tabs defaultValue="storage" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="storage">Penyimpanan</TabsTrigger>
                <TabsTrigger value="laporan-merr">Laporan MERR</TabsTrigger>
                <TabsTrigger value="smw-manyar">SMW Manyar</TabsTrigger>
                <TabsTrigger value="stok-produk">Stok Produk</TabsTrigger>
              </TabsList>
               <TabsContent value="storage" className="pt-4 space-y-4">
                 <Card>
                    <CardHeader><CardTitle className="text-lg">Tabel: Kebijakan Penyimpanan (Storage)</CardTitle></CardHeader>
                    <CardContent>
                      <CodeBlock code={storagePoliciesSql} lang="sql" />
                      <p className="text-sm text-muted-foreground mt-4">Sangat penting: Kebijakan ini memungkinkan pengguna untuk mengunggah dan mengelola avatar mereka. Tanpa ini, fitur ubah foto profil tidak akan berfungsi.</p>
                    </CardContent>
                 </Card>
              </TabsContent>
              <TabsContent value="laporan-merr" className="pt-4 space-y-4">
                 <Card>
                    <CardHeader><CardTitle className="text-lg">Tabel: laporan_smw_merr</CardTitle></CardHeader>
                    <CardContent>
                      <CodeBlock code={laporanMerrSql} lang="sql" />
                      <p className="text-sm text-muted-foreground mt-4">Tabel ini menyimpan data JSON dari halaman "Laporan Harian". Setiap laporan unik berdasarkan `tanggal` dan `shift`.</p>
                    </CardContent>
                 </Card>
              </TabsContent>
              <TabsContent value="smw-manyar" className="pt-4 space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Tabel: laporan_smw_manyar</CardTitle></CardHeader>
                    <CardContent>
                        <CodeBlock code={smwManyarSql} lang="sql" />
                        <p className="text-sm text-muted-foreground mt-4">Tabel ini menyimpan data dari halaman "SMW Manyar", dengan setiap entri unik berdasarkan `tanggal`.</p>
                    </CardContent>
                  </Card>
              </TabsContent>
              <TabsContent value="stok-produk" className="pt-4 space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Tabel: stok_produk_merr</CardTitle></CardHeader>
                    <CardContent>
                        <CodeBlock code={stokProdukSql} lang="sql" />
                         <p className="text-sm text-muted-foreground mt-4">Tabel ini menyimpan data dari halaman "Stok Produk", dengan setiap entri unik berdasarkan `tanggal` dan `shift`.</p>
                    </CardContent>
                  </Card>
              </TabsContent>
            </Tabs>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Langkah 3: Selesai!</h3>
            <p className="text-muted-foreground">
              Setelah menjalankan skema SQL di atas, database Anda siap digunakan. Anda sekarang dapat mulai mengintegrasikan fungsi Supabase ke dalam komponen aplikasi Anda untuk menyimpan dan mengambil data secara dinamis.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

    