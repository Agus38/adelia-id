
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CodeBlock = ({ code, lang = 'bash' }: { code: string; lang?: string }) => (
  <pre className="p-4 rounded-md bg-muted text-sm overflow-x-auto">
    <code className={`language-${lang}`}>{code.trim()}</code>
  </pre>
);

const envCode = `
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
`.trim();

const clientCode = `
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
`.trim();

const laporanMerrSql = `
CREATE TABLE laporan_smw_merr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  shift TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tanggal, shift)
);
`.trim();

const laporanMerrFunctions = `
// Menyimpan atau memperbarui laporan
async function saveLaporanSmwMerr(tanggal, shift, data) {
  const { error } = await supabase
    .from('laporan_smw_merr')
    .upsert({ tanggal, shift, data }, { onConflict: 'tanggal,shift' });
  if (error) throw error;
}

// Mengambil laporan berdasarkan tanggal dan shift
async function getLaporanSmwMerr(tanggal, shift) {
  const { data, error } = await supabase
    .from('laporan_smw_merr')
    .select('data')
    .eq('tanggal', tanggal)
    .eq('shift', shift)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // 'PGRST116' means no rows found
  return data?.data || {};
}
`.trim();

const smwManyarSql = `
CREATE TABLE laporan_smw_manyar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
`.trim();

const smwManyarFunctions = `
// Menyimpan atau memperbarui laporan
async function saveLaporanSmwManyar(tanggal, data) {
  const { error } = await supabase
    .from('laporan_smw_manyar')
    .upsert({ tanggal, data }, { onConflict: 'tanggal' });
  if (error) throw error;
}

// Mengambil laporan berdasarkan tanggal
async function getLaporanSmwManyar(tanggal) {
  const { data, error } = await supabase
    .from('laporan_smw_manyar')
    .select('data')
    .eq('tanggal', tanggal)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.data || {};
}
`.trim();

const stokProdukSql = `
CREATE TABLE stok_produk_merr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  shift TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tanggal, shift)
);
`.trim();

const stokProdukFunctions = `
// Menyimpan atau memperbarui stok
async function saveStokProduk(tanggal, shift, data) {
  const { error } = await supabase
    .from('stok_produk_merr')
    .upsert({ tanggal, shift, data }, { onConflict: 'tanggal,shift' });
  if (error) throw error;
}

// Mengambil stok berdasarkan tanggal dan shift
async function getStokProduk(tanggal, shift) {
  const { data, error } = await supabase
    .from('stok_produk_merr')
    .select('data')
    .eq('tanggal', tanggal)
    .eq('shift', shift)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.data || [];
}
`.trim();

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
              Dapatkan kunci API dari dasbor Supabase Anda, lalu instal pustaka klien dan konfigurasikan variabel lingkungan.
            </p>
             <div className="space-y-4">
                <div>
                  <Label className="text-base">1.1 Dapatkan Kunci API</Label>
                  <p className="text-sm text-muted-foreground">Masuk ke akun Supabase Anda, navigasikan ke Pengaturan Proyek &gt; API, dan temukan URL Proyek serta kunci `anon` publik Anda.</p>
                </div>
                <div>
                   <Label className="text-base">1.2 Instal Klien Supabase</Label>
                   <CodeBlock code="npm install @supabase/supabase-js" />
                </div>
                <div>
                   <Label className="text-base">1.3 Konfigurasi Variabel Lingkungan</Label>
                   <p className="text-sm text-muted-foreground mb-2">Buat file `.env.local` di root proyek Anda dan tambahkan variabel berikut:</p>
                   <CodeBlock code={envCode} lang="ini" />
                </div>
                <div>
                   <Label className="text-base">1.4 Buat Klien Supabase</Label>
                   <p className="text-sm text-muted-foreground mb-2">Buat file `src/lib/supabaseClient.ts` untuk menginisialisasi klien:</p>
                   <CodeBlock code={clientCode} lang="typescript" />
                </div>
             </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Langkah 2: Skema Database & Fungsi</h3>
            <p className="text-muted-foreground mb-4">
              Gunakan skema SQL di bawah ini untuk membuat tabel di database Supabase Anda. Anda dapat menjalankannya melalui Editor SQL di dasbor Supabase.
            </p>

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
                 <Card>
                    <CardHeader><CardTitle className="text-lg">Contoh Fungsi TypeScript</CardTitle></CardHeader>
                    <CardContent>
                      <CodeBlock code={laporanMerrFunctions} lang="typescript" />
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
                   <Card>
                    <CardHeader><CardTitle className="text-lg">Contoh Fungsi TypeScript</CardTitle></CardHeader>
                    <CardContent>
                        <CodeBlock code={smwManyarFunctions} lang="typescript" />
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
                   <Card>
                    <CardHeader><CardTitle className="text-lg">Contoh Fungsi TypeScript</CardTitle></CardHeader>
                    <CardContent>
                        <CodeBlock code={stokProdukFunctions} lang="typescript" />
                    </CardContent>
                  </Card>
              </TabsContent>
            </Tabs>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Langkah 3: Selesai!</h3>
            <p className="text-muted-foreground">
              Anda sekarang dapat mengimpor klien Supabase dan menggunakan fungsi-fungsi di atas di dalam komponen atau halaman aplikasi Anda untuk berinteraksi dengan database.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
