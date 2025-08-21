
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
        Harap baca syarat dan ketentuan kami dengan saksama sebelum menggunakan aplikasi.
      </p>
      <Card className="pt-6">
        <CardContent className="space-y-6 text-sm">
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">1. Penerimaan Persyaratan</h3>
            <p className="text-muted-foreground leading-relaxed">
              Dengan mengakses atau menggunakan aplikasi Adelia-ID ("Layanan"), Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari persyaratan ini, Anda tidak diizinkan untuk mengakses Layanan.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">2. Penggunaan Lisensi</h3>
            <p className="text-muted-foreground leading-relaxed">
              Izin diberikan untuk mengunduh sementara satu salinan materi di aplikasi Adelia-ID untuk tampilan pribadi dan non-komersial saja. Ini adalah pemberian lisensi, bukan pengalihan hak, dan di bawah lisensi ini Anda tidak boleh: mengubah atau menyalin materi; menggunakan materi untuk tujuan komersial apa pun, atau untuk tampilan publik apa pun (komersial atau non-komersial); mencoba mendekompilasi atau merekayasa balik perangkat lunak apa pun yang terdapat di aplikasi Adelia-ID.
            </p>
          </section>

           <section className="space-y-2">
            <h3 className="text-lg font-semibold">3. Akun Pengguna</h3>
            <p className="text-muted-foreground leading-relaxed">
             Saat Anda membuat akun dengan kami, Anda harus memberikan informasi yang akurat, lengkap, dan terkini setiap saat. Kegagalan untuk melakukannya merupakan pelanggaran terhadap Persyaratan, yang dapat mengakibatkan penghentian segera akun Anda di Layanan kami. Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi Anda.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">4. Batasan Tanggung Jawab</h3>
            <p className="text-muted-foreground leading-relaxed">
              Dalam keadaan apa pun Adelia-ID maupun direktur, karyawan, mitra, agen, pemasok, atau afiliasinya, tidak akan bertanggung jawab atas kerusakan tidak langsung, insidental, khusus, konsekuensial, atau hukuman, termasuk namun tidak terbatas pada, hilangnya keuntungan, data, penggunaan, niat baik, atau kerugian tidak berwujud lainnya.
            </p>
          </section>

           <section className="space-y-2">
            <h3 className="text-lg font-semibold">5. Perubahan pada Persyaratan</h3>
            <p className="text-muted-foreground leading-relaxed">
              Kami berhak, atas kebijakan kami sendiri, untuk mengubah atau mengganti Persyaratan ini kapan saja. Jika revisi bersifat material, kami akan memberikan pemberitahuan setidaknya 30 hari sebelum persyaratan baru berlaku. Apa yang merupakan perubahan material akan ditentukan atas kebijakan kami sendiri.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
