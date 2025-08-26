

'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import { useBannerConfig, saveBannerConfig, type BannerSlide } from '@/lib/menu-store';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


export function BannerManagement() {
  const { bannerSlides, isLoading } = useBannerConfig();
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<BannerSlide | null>(null);

  useEffect(() => {
    if (bannerSlides) {
        setSlides(bannerSlides);
    }
  }, [bannerSlides]);

  const handleEdit = (slide: BannerSlide) => {
    setSelectedSlide(slide);
    setEditDialogOpen(true);
  };
  
  const handleDialogSave = () => {
    if (selectedSlide) {
      setSlides(slides.map(s => s.id === selectedSlide.id ? selectedSlide : s));
    }
    setEditDialogOpen(false);
  };
  
  const handleToggleVisibility = (slideId: number, visible: boolean) => {
    setSlides(slides.map(s => s.id === slideId ? {...s, visible} : s));
  }

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
        await saveBannerConfig(slides);
        toast({
            title: 'Perubahan Disimpan!',
            description: 'Konfigurasi banner telah berhasil diperbarui.',
        });
    } catch (error) {
         toast({
            title: 'Gagal Menyimpan',
            description: 'Terjadi kesalahan saat menyimpan konfigurasi banner.',
            variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleSaveChanges} disabled={isSaving || isLoading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gambar</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Visibilitas</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                </TableRow>
            ) : slides.map((slide) => (
              <TableRow key={slide.id}>
                <TableCell>
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    width={100}
                    height={40}
                    className="rounded-md object-cover"
                    data-ai-hint={slide.hint}
                  />
                </TableCell>
                <TableCell className="font-medium">{slide.title}</TableCell>
                <TableCell>
                  <Switch
                    checked={slide.visible}
                    onCheckedChange={(checked) => handleToggleVisibility(slide.id, checked)}
                    aria-label="Visibilitas slide"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(slide)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Slide: {selectedSlide?.title}</DialogTitle>
            <DialogDescription>
              Ubah detail slide banner di bawah ini.
            </DialogDescription>
          </DialogHeader>
          {selectedSlide && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Judul</Label>
                <Input
                  id="title"
                  value={selectedSlide.title}
                  onChange={(e) => setSelectedSlide({...selectedSlide, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={selectedSlide.description}
                  onChange={(e) => setSelectedSlide({...selectedSlide, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">URL Gambar</Label>
                <Input
                  id="imageUrl"
                  value={selectedSlide.image}
                  onChange={(e) => setSelectedSlide({...selectedSlide, image: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hint" className="text-right">Petunjuk AI</Label>
                <Input
                  id="hint"
                  value={selectedSlide.hint}
                  onChange={(e) => setSelectedSlide({...selectedSlide, hint: e.target.value})}
                  className="col-span-3"
                />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">Preview</Label>
                 <Image
                    src={selectedSlide.image}
                    alt={selectedSlide.title}
                    width={200}
                    height={80}
                    className="rounded-md object-cover col-span-3"
                    data-ai-hint={selectedSlide.hint}
                  />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button type="submit" onClick={handleDialogSave}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
