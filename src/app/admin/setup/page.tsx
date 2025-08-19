
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SetupPage() {
  const envCode = `
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
  `.trim();

  const clientCode = `
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
  `.trim();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Integrasi dengan Supabase</CardTitle>
          <CardDescription>
            Ikuti langkah-langkah di bawah ini untuk mengintegrasikan aplikasi Anda dengan Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2">Langkah 1: Dapatkan Kunci API Supabase Anda</h3>
            <p className="text-muted-foreground">
              Masuk ke akun Supabase Anda dan navigasikan ke proyek Anda. Di bawah Pengaturan Proyek > API, Anda akan menemukan URL Proyek dan kunci `anon` publik Anda.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Langkah 2: Konfigurasi Variabel Lingkungan</h3>
            <p className="text-muted-foreground mb-4">
              Buat file `.env.local` di root proyek Anda dan tambahkan variabel berikut:
            </p>
            <pre className="p-4 rounded-md bg-muted text-sm overflow-x-auto">
              <code>{envCode}</code>
            </pre>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Langkah 3: Instal Klien Supabase</h3>
            <p className="text-muted-foreground mb-4">
              Instal paket klien Supabase menggunakan npm atau yarn.
            </p>
            <pre className="p-4 rounded-md bg-muted text-sm">
              <code>npm install @supabase/supabase-js</code>
            </pre>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Langkah 4: Buat Klien Supabase</h3>
            <p className="text-muted-foreground mb-4">
              Buat file untuk menginisialisasi klien Supabase Anda. Misalnya, `src/lib/supabaseClient.ts`:
            </p>
            <pre className="p-4 rounded-md bg-muted text-sm overflow-x-auto">
              <code>{clientCode}</code>
            </pre>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Langkah 5: Selesai!</h3>
            <p className="text-muted-foreground">
              Anda sekarang dapat mengimpor klien Supabase di mana saja di aplikasi Anda untuk berinteraksi dengan database, otentikasi, dan layanan Supabase lainnya.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
