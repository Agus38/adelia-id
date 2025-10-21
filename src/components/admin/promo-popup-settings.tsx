
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Send } from 'lucide-react';
import Image from 'next/image';
import { usePromoPopupConfig, savePromoPopupConfig, type PromoPopupConfig } from '@/lib/menu-store';
import { Skeleton } from '../ui/skeleton';

export function PromoPopupSettings() {
  const { promoPopupConfig, isLoading } = usePromoPopupConfig();
  const [localConfig, setLocalConfig] = useState<PromoPopupConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (promoPopupConfig) {
      setLocalConfig(JSON.parse(JSON.stringify(promoPopupConfig)));
    }
  }, [promoPopupConfig]);

  const handleConfigChange = (field: keyof Omit<PromoPopupConfig, 'enabled' | 'promoVersion'>, value: string) => {
    if (!localConfig) return;
    setLocalConfig({ ...localConfig, [field]: value });
  };
  
  const handleEnabledChange = (enabled: boolean) => {
    if (!localConfig) return;
    setLocalConfig({ ...localConfig, enabled });
  };

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

  const handleSaveChanges = async (newVersion = false) => {
    if (!localConfig) return;
    setIsSaving(true);
    try {
      const configToSave = { ...localConfig };
      if (newVersion) {
        configToSave.promoVersion = (configToSave.promoVersion || 0) + 1;
      }
      
      await savePromoPopupConfig(configToSave);
      
      if (newVersion) {
        toast({
          title: 'Notifikasi Terkirim!',
          description: 'Popup notifikasi akan ditampilkan kembali kepada semua pengguna.',
        });
      } else {
        toast({
          title: 'Perubahan Disimpan!',
          description: 'Konfigurasi popup notifikasi telah berhasil diperbarui.',
        });
      }
      // Re-sync local state with the newly saved config (especially the version)
      setLocalConfig(configToSave);
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
          <Skeleton className="h-48 w-full" />
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
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Pengaturan Popup Notifikasi</CardTitle>
                <CardDescription>
                Aktifkan dan atur konten popup yang akan muncul di halaman utama.
                </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
                <Label htmlFor="popup-enabled" className="text-sm font-medium">Aktifkan Popup</Label>
                <Switch
                    id="popup-enabled"
                    checked={localConfig.enabled}
                    onCheckedChange={handleEnabledChange}
                />
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Gambar Notifikasi</Label>
          <div className="relative w-full aspect-video rounded-md border flex items-center justify-center bg-muted overflow-hidden">
            {localConfig.imageUrl ? (
              <Image
                src={localConfig.imageUrl}
                alt="Pratinjau gambar notifikasi"
                fill
                className="object-cover"
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
              onChange={(e) => handleConfigChange('imageUrl', e.target.value)}
              placeholder="https://example.com/promo.png"
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
            <Label htmlFor="title">Judul Popup</Label>
            <Input id="title" value={localConfig.title} onChange={(e) => handleConfigChange('title', e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" value={localConfig.description} onChange={(e) => handleConfigChange('description', e.target.value)} />
        </div>
         <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="buttonText">Teks Tombol</Label>
                <Input id="buttonText" value={localConfig.buttonText} onChange={(e) => handleConfigChange('buttonText', e.target.value)} placeholder="Contoh: Lihat Detail" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="buttonLink">Tautan Tombol</Label>
                <Input id="buttonLink" value={localConfig.buttonLink} onChange={(e) => handleConfigChange('buttonLink', e.target.value)} placeholder="/halaman-tujuan" />
            </div>
         </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={() => handleSaveChanges(false)} disabled={isSaveDisabled}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </Button>
        <Button onClick={() => handleSaveChanges(true)} disabled={isSaveDisabled} variant="secondary">
          <Send className="mr-2 h-4 w-4" />
          Push Notifikasi
        </Button>
      </CardFooter>
    </Card>
  );
}
