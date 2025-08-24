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
CREATE TABLE laporan_smw_merr (
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
CREATE TABLE laporan_smw_manyar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
`.trim();

const stokProdukSql = `
-- Menyimpan data dari halaman "Stok Produk", unik berdasarkan tanggal dan shift.
CREATE TABLE stok_produk_merr (
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

-- Buat tabel untuk profil pengguna publik
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'Pengguna'
);

-- Kebijakan Keamanan (RLS) untuk tabel Profil
-- 1. Izinkan pengguna untuk membaca semua profil. Ini berguna untuk fitur seperti daftar tim.
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

-- 2. Izinkan pengguna untuk membuat profil mereka sendiri.
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- 3. Izinkan pengguna untuk memperbarui profil mereka sendiri.
CREATE POLICY "Users can update their own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Aktifkan Row Level Security (RLS) untuk tabel profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

-- Trigger yang memanggil fungsi di atas setiap kali pengguna baru mendaftar.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ### APPLICATION DATA ###

-- Skema untuk Laporan SMW MERR
-- Menyimpan data dari halaman "Laporan Harian". Setiap laporan unik berdasarkan tanggal dan shift.
CREATE TABLE laporan_smw_merr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  shift TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tanggal, shift)
);

-- Skema untuk Laporan SMW Manyar
-- Menyimpan data dari halaman "SMW Manyar", unik berdasarkan tanggal.
CREATE TABLE laporan_smw_manyar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Skema untuk Stok Produk MERR
-- Menyimpan data dari halaman "Stok Produk", unik berdasarkan tanggal dan shift.
CREATE TABLE stok_produk_merr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  shift TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tanggal, shift)
);

-- Skema untuk Pengaturan Aplikasi
-- Menggunakan satu tabel dengan tipe untuk menyimpan berbagai jenis konfigurasi.
CREATE TABLE app_config (
  id SERIAL PRIMARY KEY,
  config_type TEXT NOT NULL UNIQUE, -- 'main_menu', 'banners', 'team_members', 'developer_info'
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Aktifkan RLS untuk app_config dan izinkan baca untuk semua
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "App config is viewable by everyone."
  ON app_config FOR SELECT
  USING ( true );

-- Hanya admin yang bisa mengubah konfigurasi.
-- Pastikan kolom 'role' di tabel 'profiles' Anda sudah ada.
CREATE POLICY "Only admins can modify app config."
  ON app_config FOR ALL
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin' )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin' );
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
            <h3 className="text-xl font-semibold mb-2">Langkah 1: Pengaturan Awal</h3>
            <p className="text-muted-foreground mb-4">
              Gunakan kredensial dari proyek Supabase Anda untuk mengkonfigurasi variabel lingkungan di aplikasi ini.
            </p>
             <div className="space-y-4">
                <div>
                  <Label className="text-base">1.1 Temukan Kunci API Anda</Label>
                  <p className="text-sm text-muted-foreground">Masuk ke akun Supabase Anda, navigasikan ke Pengaturan Proyek &gt; API, dan temukan URL Proyek serta kunci `anon` publik Anda.</p>
                </div>
                <div>
                   <Label className="text-base">1.2 Konfigurasi Variabel Lingkungan</Label>
                   <p className="text-sm text-muted-foreground mb-2">Variabel lingkungan sudah saya atur untuk Anda di file `.env` menggunakan data yang Anda berikan. Anda dapat memeriksanya di bawah ini:</p>
                   <CodeBlock code={envCode} lang="ini" />
                </div>
                <div>
                   <Label className="text-base">1.3 Inisialisasi Klien Supabase</Label>
                   <p className="text-sm text-muted-foreground mb-2">Aplikasi ini sudah memiliki file `src/lib/supabaseClient.ts` untuk menginisialisasi dan mengekspor klien Supabase untuk digunakan di seluruh aplikasi:</p>
                   <CodeBlock code={clientCode} lang="typescript" />
                </div>
             </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Langkah 2: Skema Database & Fungsi</h3>
            <p className="text-muted-foreground mb-4">
              Gunakan skema SQL di bawah ini untuk membuat semua tabel dan fungsi yang diperlukan di database Supabase Anda. Anda dapat menjalankannya melalui Editor SQL di dasbor Supabase.
            </p>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Skema SQL Lengkap</CardTitle>
                    <CardDescription>Jalankan semua kode di bawah ini di Editor SQL Supabase Anda untuk membuat semua tabel, fungsi, dan kebijakan keamanan yang diperlukan sekaligus.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock code={fullSqlSchema} lang="sql" />
                </CardContent>
            </Card>

            <h4 className="text-lg font-semibold mb-2 mt-4">Rincian per Tabel Laporan</h4>
            <Tabs defaultValue="laporan-merr" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="laporan-merr">Laporan SMW MERR</TabsTrigger>
                <TabsTrigger value="smw-manyar">SMW Manyar</TabsTrigger>
                <TabsTrigger value="stok-produk">Stok Produk MERR</TabsTrigger>
              </TabsList>
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
