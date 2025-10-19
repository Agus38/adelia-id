
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Terminal, Copy, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CodeBlock } from '@/components/admin/code-block';

export default function GitHubSyncPage() {

  const gitInitCommands = `
git init -b main
git add .
git commit -m "Initial commit"
  `.trim();

  const gitRemoteCommands = `
git remote add origin https://github.com/Agus38/adelia-id.git
git branch -M main
git push -u origin main
  `.trim();


  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-3">
        <Github className="h-8 w-8" />
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Sinkronisasi ke GitHub</h2>
            <p className="text-muted-foreground">
                Panduan untuk mengunggah dan menyinkronkan proyek Anda ke repositori GitHub.
            </p>
        </div>
      </div>
       <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Penting</AlertTitle>
            <AlertDescription>
                Halaman ini hanya menyediakan panduan. Semua perintah harus dijalankan melalui terminal di lingkungan pengembangan lokal Anda, bukan di sini.
            </AlertDescription>
       </Alert>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Terminal/> Langkah-Langkah Sinkronisasi</CardTitle>
          <CardDescription>
            Ikuti langkah-langkah di bawah ini untuk menghubungkan dan mengunggah kode proyek Anda ke repositori GitHub baru.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold">Langkah 1: Buat Repositori Baru di GitHub</h3>
                <p className="text-sm text-muted-foreground">
                    Buka <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-primary underline">halaman GitHub</a> untuk membuat repositori baru. Beri nama repositori Anda dan pastikan repositori tersebut kosong (tanpa file README, .gitignore, atau lisensi).
                </p>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold">Langkah 2: Inisialisasi Git di Proyek Lokal Anda</h3>
                 <p className="text-sm text-muted-foreground">
                    Jika proyek Anda belum menjadi repositori Git, jalankan perintah ini di direktori root proyek Anda.
                </p>
                <CodeBlock code={gitInitCommands} />
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold">Langkah 3: Hubungkan dan Unggah Proyek</h3>
                <p className="text-sm text-muted-foreground">
                    Perintah di bawah ini sudah berisi URL repositori yang Anda berikan. Salin dan jalankan perintah ini.
                </p>
                <CodeBlock code={gitRemoteCommands} />
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold">Selesai!</h3>
                <p className="text-sm text-muted-foreground">
                    Proyek Anda sekarang seharusnya sudah terunggah ke GitHub. Untuk pembaruan selanjutnya, Anda hanya perlu menggunakan `git add .`, `git commit -m "pesan commit"`, dan `git push`.
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
