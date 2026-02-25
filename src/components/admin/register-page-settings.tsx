
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useRegisterPageConfig, saveRegisterPageConfig, type RegisterPageConfig } from '@/lib/menu-store';
import { toast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function RegisterPageSettings() {
  const { registerPageConfig, isLoading } = useRegisterPageConfig();
  const [localConfig, setLocalConfig] = useState<RegisterPageConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (registerPageConfig) {
      setLocalConfig(JSON.parse(JSON.stringify(registerPageConfig)));
    }
  }, [registerPageConfig]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !localConfig) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "Ukuran File Terlalu Besar",
        description: "Ukuran file tidak boleh melebihi 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      setLocalConfig(prev => prev ? { ...prev, imageUrl: dataUrl } : null);

      toast({
        title: "Gambar Diproses",
        description: "Gambar berhasil diproses. Jangan lupa simpan perubahan.",
      });

    } catch (error) {
      toast({
        title: "Gagal Memproses Gambar",
        description: "Terjadi kesalahan saat memproses gambar.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!localConfig) return;
    setIsSaving(true);
    try {
      await saveRegisterPageConfig(localConfig);
      toast({
        title: 'Perubahan Disimpan!',
        description: 'Pengaturan halaman registrasi telah berhasil diperbarui.',
      });
    } catch (error) {
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan data.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !localConfig) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
  }

  const isSaveDisabled = isSaving || isUploading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Gambar</CardTitle>
        <CardDescription>
          Ubah gambar yang ditampilkan di halaman registrasi. Rekomendasi rasio 2:3.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Pratinjau Gambar</Label>
          <div className="relative w-full aspect-[2/3] rounded-md border flex items-center justify-center bg-muted overflow-hidden">
            {localConfig.imageUrl ? (
              <Image
                src={localConfig.imageUrl}
                alt="Register page background"
                fill
                className="object-cover"
                data-ai-hint={localConfig.aiHint}
              />
            ) : (
              <span className="text-sm text-muted-foreground">Tidak ada gambar</span>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">URL atau Unggah Gambar</Label>
          <div className="flex gap-2">
            <Input
              id="imageUrl"
              value={localConfig.imageUrl}
              onChange={(e) => setLocalConfig({ ...localConfig, imageUrl: e.target.value })}
              placeholder="https://example.com/image.png"
              disabled={isUploading}
            />
            <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              <span className="sr-only">Unggah Gambar</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              disabled={isUploading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="aiHint">Petunjuk AI untuk Gambar</Label>
          <Input
            id="aiHint"
            value={localConfig.aiHint}
            onChange={(e) => setLocalConfig({ ...localConfig, aiHint: e.target.value })}
            placeholder="Contoh: team working"
          />
           <p className="text-xs text-muted-foreground">
              Maksimal dua kata, digunakan untuk mencari gambar alternatif.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveChanges} disabled={isSaveDisabled}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </Button>
      </CardFooter>
    </Card>
  );
}
