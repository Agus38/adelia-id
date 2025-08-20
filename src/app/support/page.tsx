
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeBuoy, Mail, Phone, BookOpen, MessageCircle } from "lucide-react";
import Link from "next/link";

const faqItems = [
  {
    question: "Bagaimana cara mengubah kata sandi saya?",
    answer: "Anda dapat mengubah kata sandi Anda dengan membuka halaman 'Profil' dari menu dropdown pengguna di kanan atas. Di sana, Anda akan menemukan bagian 'Ubah Kata Sandi'. Masukkan kata sandi Anda saat ini dan kata sandi baru untuk memperbaruinya."
  },
  {
    question: "Bagaimana cara menambahkan pengguna baru di panel admin?",
    answer: "Untuk menambahkan pengguna baru, navigasikan ke 'Panel Admin', lalu pilih 'Manajemen Pengguna'. Di halaman tersebut, klik tombol 'Tambah Pengguna Baru' dan isi detail yang diperlukan."
  },
  {
    question: "Apa yang harus dilakukan jika saya lupa kata sandi?",
    answer: "Jika Anda lupa kata sandi, silakan hubungi administrator sistem Anda secara langsung. Saat ini, fitur pemulihan kata sandi mandiri belum tersedia dan memerlukan bantuan admin untuk mereset akun Anda."
  },
  {
    question: "Bagaimana cara melihat dan mengelola laporan harian?",
    answer: "Semua laporan harian dapat diakses melalui Panel Admin. Pilih menu 'Manajemen Laporan Harian' untuk melihat, menyetujui, atau menolak laporan yang telah dikirimkan oleh pengguna."
  }
];

const contactMethods = [
    {
        icon: Mail,
        title: "Email",
        value: "support@adelia-id.com",
        action: "mailto:support@adelia-id.com",
        actionLabel: "Kirim Email"
    },
    {
        icon: Phone,
        title: "Telepon",
        value: "+62 812 3456 7890",
        action: "tel:+6281234567890",
        actionLabel: "Hubungi Sekarang"
    },
    {
        icon: MessageCircle,
        title: "WhatsApp",
        value: "+62 812 3456 7891",
        action: "https://wa.me/6281234567891",
        actionLabel: "Chat via WA"
    }
]

export default function SupportPage() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <LifeBuoy className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Bantuan &amp; Dukungan</h2>
      </div>
      <p className="text-muted-foreground">
        Temukan jawaban atas pertanyaan Anda atau hubungi tim kami untuk bantuan lebih lanjut.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Pertanyaan yang Sering Diajukan (FAQ)</CardTitle>
                    <CardDescription>Jawaban cepat untuk pertanyaan umum.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((item, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>

        {/* Contact & Resources Section */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Hubungi Kami</CardTitle>
                    <CardDescription>Butuh bantuan lebih lanjut? Kami siap membantu.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {contactMethods.map((method, index) => (
                         <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                            <div className="flex items-center gap-4">
                                <method.icon className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-semibold text-sm">{method.title}</p>
                                    <p className="text-xs text-muted-foreground">{method.value}</p>
                                </div>
                            </div>
                             <a href={method.action} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">{method.actionLabel}</Button>
                            </a>
                        </div>
                    ))}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Pusat Pengetahuan</CardTitle>
                    <CardDescription>Jelajahi dokumentasi dan panduan kami.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4 p-4 rounded-md border">
                        <BookOpen className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">Panduan Pengaturan Sistem</h4>
                            <p className="text-sm text-muted-foreground mt-1 mb-3">Pelajari cara mengintegrasikan aplikasi dengan layanan eksternal seperti database.</p>
                            <Link href="/admin/setup">
                                <Button>Lihat Panduan</Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
