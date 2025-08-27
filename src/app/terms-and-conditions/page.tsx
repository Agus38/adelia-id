
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <FileText className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Syarat &amp; Ketentuan</h2>
      </div>
       <p className="text-muted-foreground">
        Terakhir diperbarui: 25 Juli 2024. Harap baca dengan saksama sebelum menggunakan aplikasi.
      </p>
      <Card className="pt-6">
        <CardContent className="space-y-6 text-sm">
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">1. Penerimaan Persyaratan</h3>
            <p className="text-muted-foreground leading-relaxed">
              Dengan mendaftar, mengakses, atau menggunakan aplikasi Adelia-ID ("Layanan"), Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari persyaratan ini, Anda tidak diizinkan untuk mengakses Layanan.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">2. Deskripsi Layanan</h3>
            <p className="text-muted-foreground leading-relaxed">
              Adelia-ID adalah platform solusi bisnis yang menyediakan berbagai alat untuk membantu operasional, termasuk (namun tidak terbatas pada) pembuatan laporan keuangan harian, manajemen stok, penjualan produk digital, dan fitur utilitas lainnya.
            </p>
          </section>

           <section className="space-y-2">
            <h3 className="text-lg font-semibold">3. Akun Pengguna</h3>
            <p className="text-muted-foreground leading-relaxed">
             Saat Anda membuat akun dengan kami, Anda harus memberikan informasi yang akurat dan lengkap. Anda bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi dan semua aktivitas yang terjadi di bawah akun Anda. Kegagalan untuk mematuhi hal ini merupakan pelanggaran terhadap Persyaratan, yang dapat mengakibatkan penangguhan atau penghentian akun Anda oleh administrator.
            </p>
          </section>

           <section className="space-y-2">
            <h3 className="text-lg font-semibold">4. Konten dan Data Pengguna</h3>
            <p className="text-muted-foreground leading-relaxed">
              Anda bertanggung jawab penuh atas semua data, laporan, dan informasi ("Konten") yang Anda masukkan ke dalam Layanan. Anda menjamin bahwa Konten yang Anda berikan tidak melanggar hukum, tidak melanggar hak pihak ketiga, dan akurat. Kami tidak bertanggung jawab atas kehilangan atau kerusakan data yang disebabkan oleh kelalaian pengguna.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">5. Penggunaan yang Diizinkan</h3>
            <p className="text-muted-foreground leading-relaxed">
              Anda setuju untuk tidak menggunakan Layanan untuk tujuan apa pun yang melanggar hukum atau dilarang oleh Persyaratan ini. Anda tidak boleh mencoba mendapatkan akses tidak sah ke sistem atau jaringan kami, atau mencoba mendekompilasi dan merekayasa balik perangkat lunak kami.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">6. Batasan Tanggung Jawab</h3>
            <p className="text-muted-foreground leading-relaxed">
              Dalam keadaan apa pun, Adelia-ID maupun pemilik dan pengembangnya tidak akan bertanggung jawab atas kerusakan tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan Anda untuk menggunakan Layanan.
            </p>
          </section>

           <section className="space-y-2">
            <h3 className="text-lg font-semibold">7. Perubahan pada Persyaratan</h3>
            <p className="text-muted-foreground leading-relaxed">
              Kami berhak, atas kebijakan kami sendiri, untuk mengubah atau mengganti Persyaratan ini kapan saja. Jika revisi bersifat material, kami akan berusaha memberikan pemberitahuan sebelum persyaratan baru berlaku.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
