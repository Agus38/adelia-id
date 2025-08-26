

'use client';

import { useState, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { allIcons, type MenuItem } from '@/lib/menu-items-v2';
import type { LucideIcon } from 'lucide-react';
import { Logo } from '../icons';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import Image from 'next/image';
import { useBrandingConfig, saveBrandingConfig, type BrandingConfig } from '@/lib/menu-store';

const iconList = Object.entries(allIcons).map(([name, component]) => ({ name, component })).sort((a,b) => a.name.localeCompare(b.name));


export function BrandingSettings() {
  const { brandingConfig, isLoading } = useBrandingConfig();
  const [localConfig, setLocalConfig] = useState<BrandingConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isIconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconSearchTerm, setIconSearchTerm] = useState("");

  useEffect(() => {
    if (brandingConfig) {
      setLocalConfig(brandingConfig);
    }
  }, [brandingConfig]);


  const handleIconSelect = (icon: {name: string, component: LucideIcon}) => {
    if (!localConfig) return;
    setLocalConfig({ ...localConfig, icon: icon.component, iconName: icon.name });
    setIconPickerOpen(false);
  }

  const handleSaveChanges = async () => {
    if (!localConfig) return;
    setIsSaving(true);
    try {
      await saveBrandingConfig(localConfig);
      toast({
        title: 'Perubahan Disimpan!',
        description: 'Pengaturan tampilan aplikasi telah berhasil diperbarui.',
      });
    } catch (error) {
       toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan pengaturan.',
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
                <CardTitle>Identitas Aplikasi</CardTitle>
                <CardDescription>
                Atur nama dan logo aplikasi yang akan ditampilkan di header.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
    )
  }

  const AppIcon = localConfig.icon || Logo;

  const filteredIcons = iconList.filter(icon => 
    icon.name.toLowerCase().includes(iconSearchTerm.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Identitas Aplikasi</CardTitle>
          <CardDescription>
            Atur nama dan logo aplikasi yang akan ditampilkan di header.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appName">Nama Aplikasi</Label>
            <Input
              id="appName"
              value={localConfig.appName}
              onChange={(e) => setLocalConfig({...localConfig, appName: e.target.value})}
            />
          </div>

          <div className="space-y-4">
            <Label>Jenis Logo</Label>
            <RadioGroup 
              value={localConfig.logoType} 
              onValueChange={(value: 'icon' | 'image') => setLocalConfig({...localConfig, logoType: value})} 
              className="flex gap-4"
            >
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="icon" id="r1" />
                    <Label htmlFor="r1">Ikon</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="r2" />
                    <Label htmlFor="r2">URL Gambar</Label>
                </div>
            </RadioGroup>
          </div>

          {localConfig.logoType === 'icon' ? (
             <div className="space-y-2">
                <Label>Ikon Aplikasi</Label>
                <div className='flex items-center gap-4'>
                    <div className="flex h-20 w-full items-center justify-center rounded-md border border-dashed">
                        <div className="flex items-center gap-3 text-lg font-semibold text-primary">
                            <AppIcon className="h-7 w-7" />
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => setIconPickerOpen(true)}>
                        Ganti Ikon
                    </Button>
                </div>
            </div>
          ) : (
            <div className="space-y-2">
                <Label htmlFor="imageUrl">URL Logo Gambar</Label>
                <Input
                    id="imageUrl"
                    value={localConfig.imageUrl}
                    onChange={(e) => setLocalConfig({...localConfig, imageUrl: e.target.value})}
                    placeholder="https://example.com/logo.png"
                />
            </div>
          )}
          
           <div className="space-y-2">
             <Label>Pratinjau Header</Label>
            <div className="flex h-20 w-full items-center justify-center rounded-md border border-dashed">
                <div className="flex items-center gap-3 text-lg font-semibold text-primary">
                    {localConfig.logoType === 'icon' ? (
                        <AppIcon className="h-7 w-7" />
                    ) : (
                        localConfig.imageUrl && <Image src={localConfig.imageUrl} alt="App Logo Preview" width={32} height={32} className="h-8 w-8 object-contain" />
                    )}
                    <span>{localConfig.appName}</span>
                </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isIconPickerOpen} onOpenChange={setIconPickerOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Pilih Ikon Aplikasi</DialogTitle>
                <DialogDescription>Klik sebuah ikon untuk memilihnya sebagai ikon aplikasi utama.</DialogDescription>
            </DialogHeader>
            <div className="relative pt-4">
                <Input 
                    placeholder="Cari ikon..." 
                    value={iconSearchTerm}
                    onChange={(e) => setIconSearchTerm(e.target.value)}
                    className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 mt-2 h-4 w-4 text-muted-foreground" />
            </div>
            <ScrollArea className="h-72 border rounded-md mt-4">
                <div className="grid grid-cols-6 gap-2 p-4">
                    {filteredIcons.map(icon => (
                        <Button 
                            key={icon.name}
                            variant="outline"
                            className="flex flex-col items-center justify-center h-20 gap-2"
                            onClick={() => handleIconSelect(icon)}
                        >
                            <icon.component className="h-6 w-6" />
                            <span className="text-xs text-muted-foreground truncate w-full px-1">{icon.name}</span>
                        </Button>
                    ))}
                </div>
                 {filteredIcons.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">
                        Ikon tidak ditemukan.
                    </div>
                )}
            </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
