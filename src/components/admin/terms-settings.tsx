
'use client';

import * as React from 'react';
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
import { Wand2, Loader2 } from 'lucide-react';
import { enhanceText } from '@/ai/flows/text-enhancer';

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
type TermsSection = keyof TermsContent;

export function TermsSettings() {
  const [terms, setTerms] = useState<TermsContent>(initialTerms);
  const [enhancingSection, setEnhancingSection] = useState<TermsSection | null>(null);

  const handleTextChange = (section: TermsSection, value: string) => {
    setTerms((prev) => ({ ...prev, [section]: value }));
  };

  const handleEnhanceText = async (section: TermsSection) => {
    const currentText = terms[section];
     if (!currentText.trim()) {
        toast({ title: "Teks kosong", description: "Tidak ada teks untuk disempurnakan.", variant: "destructive" });
        return;
    }
    setEnhancingSection(section);
    try {
        const result = await enhanceText({ text: currentText });
        setTerms(prev => ({...prev, [section]: result.enhancedText}));
        toast({ title: "Teks berhasil disempurnakan!", description: `Bagian "${section}" telah diperbarui oleh AI.` });
    } catch (error) {
        toast({ title: "Gagal Menyempurnakan Teks", description: "Terjadi kesalahan saat menghubungi AI.", variant: "destructive" });
    } finally {
        setEnhancingSection(null);
    }
  }

  const handleSaveChanges = () => {
    // NOTE: Mock implementation. In a real app, you would save this to a database.
    console.log('Saving changes:', terms);
    toast({
      title: "Perubahan Disimpan",
      description: "Konten Syarat & Ketentuan telah berhasil diperbarui.",
    });
  };
  
  const sections: { key: TermsSection, title: string }[] = [
      { key: 'penerimaan', title: '1. Penerimaan Persyaratan' },
      { key: 'lisensi', title: '2. Penggunaan Lisensi' },
      { key: 'akun', title: '3. Akun Pengguna' },
      { key: 'batasan', title: '4. Batasan Tanggung Jawab' },
      { key: 'perubahan', title: '5. Perubahan pada Persyaratan' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor Konten Syarat & Ketentuan</CardTitle>
        <CardDescription>
          Gunakan form di bawah ini untuk mengedit setiap bagian dari halaman Syarat & Ketentuan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section, index) => (
            <React.Fragment key={section.key}>
                <div className="space-y-2">
                <Label htmlFor={section.key} className="text-base font-semibold">{section.title}</Label>
                 <div className="relative">
                    <Textarea
                        id={section.key}
                        value={terms[section.key]}
                        onChange={(e) => handleTextChange(section.key, e.target.value)}
                        rows={5}
                        className="text-sm pr-10"
                    />
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute right-1 top-2 h-8 w-8"
                        onClick={() => handleEnhanceText(section.key)}
                        disabled={enhancingSection === section.key}
                    >
                        {enhancingSection === section.key ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4 text-muted-foreground"/>}
                        <span className="sr-only">Sempurnakan teks</span>
                    </Button>
                </div>
                </div>
                {index < sections.length - 1 && <Separator />}
            </React.Fragment>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveChanges}>Simpan Perubahan</Button>
      </CardFooter>
    </Card>
  );
}
