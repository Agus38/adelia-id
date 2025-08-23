
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { allIconsMap } from '@/lib/menu-items-v2';
import type { LucideIcon } from 'lucide-react';
import { Logo } from '../icons';
import { ScrollArea } from '../ui/scroll-area';
import { Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const iconList = allIconsMap.reduce((acc, item) => {
    if (item.icon && typeof item.icon.displayName === 'string' && !acc.find(i => i.name === item.icon.displayName)) {
        acc.push({ name: item.icon.displayName, component: item.icon });
    }
    return acc;
}, [] as { name: string, component: LucideIcon }[]).sort((a,b) => a.name.localeCompare(b.name));


export function BrandingSettings() {
  const [appName, setAppName] = useState('Adelia-ID');
  const [appIcon, setAppIcon] = useState<LucideIcon>(() => Logo);
  const [isIconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconSearchTerm, setIconSearchTerm] = useState("");

  const handleIconSelect = (icon: {name: string, component: LucideIcon}) => {
    setAppIcon(() => icon.component);
    setIconPickerOpen(false);
  }

  const handleSaveChanges = () => {
    // NOTE: Mock implementation. In a real app, you would save this to a database or config file.
    console.log('Saving changes:', { appName, appIcon: (appIcon as any).displayName });
    toast({
      title: 'Perubahan Disimpan!',
      description: 'Pengaturan tampilan aplikasi telah berhasil diperbarui.',
    });
  };

  const AppIcon = appIcon;

  const filteredIcons = iconList.filter(icon => 
    icon.name.toLowerCase().includes(iconSearchTerm.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Identitas Aplikasi</CardTitle>
          <CardDescription>
            Atur nama dan ikon aplikasi yang akan ditampilkan di header.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appName">Nama Aplikasi</Label>
            <Input
              id="appName"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Ikon Aplikasi</Label>
            <div className='flex items-center gap-4'>
                <div className="flex h-20 w-full items-center justify-center rounded-md border border-dashed">
                    <div className="flex items-center gap-3 text-lg font-semibold text-primary">
                        <AppIcon className="h-7 w-7" />
                        <span>{appName}</span>
                    </div>
                </div>
                 <Button variant="outline" onClick={() => setIconPickerOpen(true)}>
                    Ganti Ikon
                </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveChanges}>Simpan Perubahan</Button>
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
