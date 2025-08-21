
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

const initialTerms = {
  penerimaan:
    'Dengan mengakses atau menggunakan aplikasi Adelia-ID ("Layanan"), Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari persyaratan ini, Anda tidak diizinkan untuk mengakses Layanan.',
  lisensi:
    'Izin diberikan untuk mengunduh sementara satu salinan materi di aplikasi Adelia-ID untuk tampilan pribadi dan non-komersial saja. Ini adalah pemberian lisensi, bukan pengalihan hak, dan di bawah lisensi ini Anda tidak boleh: mengubah atau menyalin materi; menggunakan materi untuk tujuan komersial apa pun, atau untuk tampilan publik apa pun (komersial atau non-komersial); mencoba mendekompilasi atau merekayasa balik perangkat lunak apa pun yang terdapat di aplikasi Adelia-ID.',
  akun:
    'Saat Anda membuat akun dengan kami, Anda harus memberikan informasi yang akurat, lengkap, dan terkini setiap saat. Kegagalan untuk melakukannya merupakan pelanggaran terhadap Persyaratan, yang dapat mengakibatkan penghentian segera akun Anda di Layanan kami. Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi Anda.',
  batasan:
    'Dalam keadaan apa pun Adelia-ID maupun direktur, karyawan, mitra, agen, pemasok, atau afiliasinya, tidak akan bertanggung jawab atas kerusakan tidak langsung, insidental, khusus, konsekuensial, atau hukuman, termasuk namun tidak terbatas pada, hilangnya keuntungan, data, penggunaan, niat baik, atau kerugian tidak berwujud lainnya.',
  perubahan:
    'Kami berhak, atas kebijakan kami sendiri, untuk mengubah atau mengganti Persyaratan ini kapan saja. Jika revisi bersifat material, kami akan memberikan pemberitahuan setidaknya 30 hari sebelum persyaratan baru berlaku. Apa yang merupakan perubahan material akan ditentukan atas kebijakan kami sendiri.',
};

type TermsContent = typeof initialTerms;

export function TermsSettings() {
  const [terms, setTerms] = useState<TermsContent>(initialTerms);

  const handleTextChange = (section: keyof TermsContent, value: string) => {
    setTerms((prev) => ({ ...prev, [section]: value }));
  };

  const handleSaveChanges = () => {
    // NOTE: Mock implementation. In a real app, you would save this to a database.
    console.log('Saving changes:', terms);
    toast({
      title: "Perubahan Disimpan",
      description: "Konten Syarat & Ketentuan telah berhasil diperbarui.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor Konten Syarat & Ketentuan</CardTitle>
        <CardDescription>
          Gunakan form di bawah ini untuk mengedit setiap bagian dari halaman Syarat & Ketentuan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="penerimaan" className="text-base font-semibold">1. Penerimaan Persyaratan</Label>
          <Textarea
            id="penerimaan"
            value={terms.penerimaan}
            onChange={(e) => handleTextChange('penerimaan', e.target.value)}
            rows={4}
            className="text-sm"
          />
        </div>
        <Separator />
         <div className="space-y-2">
          <Label htmlFor="lisensi" className="text-base font-semibold">2. Penggunaan Lisensi</Label>
          <Textarea
            id="lisensi"
            value={terms.lisensi}
            onChange={(e) => handleTextChange('lisensi', e.target.value)}
            rows={5}
            className="text-sm"
          />
        </div>
         <Separator />
        <div className="space-y-2">
          <Label htmlFor="akun" className="text-base font-semibold">3. Akun Pengguna</Label>
          <Textarea
            id="akun"
            value={terms.akun}
            onChange={(e) => handleTextChange('akun', e.target.value)}
            rows={4}
            className="text-sm"
          />
        </div>
         <Separator />
        <div className="space-y-2">
          <Label htmlFor="batasan" className="text-base font-semibold">4. Batasan Tanggung Jawab</Label>
          <Textarea
            id="batasan"
            value={terms.batasan}
            onChange={(e) => handleTextChange('batasan', e.target.value)}
            rows={4}
            className="text-sm"
          />
        </div>
         <Separator />
        <div className="space-y-2">
          <Label htmlFor="perubahan" className="text-base font-semibold">5. Perubahan pada Persyaratan</Label>
          <Textarea
            id="perubahan"
            value={terms.perubahan}
            onChange={(e) => handleTextChange('perubahan', e.target.value)}
            rows={4}
            className="text-sm"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveChanges}>Simpan Perubahan</Button>
      </CardFooter>
    </Card>
  );
}
