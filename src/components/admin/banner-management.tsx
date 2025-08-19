
'use client';

import { useState } from 'react';
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

const initialSlides = [
  {
    id: 1,
    title: 'Solusi Inovatif',
    description: 'Tingkatkan produktivitas bisnis Anda dengan alat canggih kami.',
    image: 'https://images.unsplash.com/photo-1727488962328-75e3bf389128?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8cHJvbW90aW9uYWwlMjBiYW5uZXJ8ZW58MHx8fHwxNzU1NTUwMzk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    hint: 'promotional banner',
    visible: true,
  },
  {
    id: 2,
    title: 'Analitik Cerdas',
    description: 'Dapatkan wawasan mendalam dari data Anda dengan dasbor interaktif.',
    image: 'https://images.unsplash.com/photo-1640158615573-cd28feb1bf4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8ZGF0YSUyMGFuYWx5dGljc3xlbnwwfHx8fDE3NTU1NTAzOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    hint: 'data analytics',
    visible: true,
  },
  {
    id: 3,
    title: 'Asisten AI Nexus',
    description: 'Biarkan AI membantu Anda menyelesaikan tugas lebih cepat dan efisien.',
    image: 'https://images.unsplash.com/photo-1593376893114-1aed528d80cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlfGVufDB8fHx8MTc1NTU1MDM5NXww&ixlib=rb-4.1.0&q=80&w=1080',
    hint: 'artificial intelligence',
    visible: true,
  },
];

type Slide = typeof initialSlides[0];

export function BannerManagement() {
  const [slides, setSlides] = useState(initialSlides);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);

  const handleEdit = (slide: Slide) => {
    setSelectedSlide(slide);
    setEditDialogOpen(true);
  };
  
  const handleSaveChanges = () => {
    // NOTE: This is a mock implementation.
    // In a real application, you would send this data to your backend/database.
    if (selectedSlide) {
      setSlides(slides.map(s => s.id === selectedSlide.id ? selectedSlide : s));
    }
    setEditDialogOpen(false);
  };


  return (
    <>
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
            {slides.map((slide) => (
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
                    onCheckedChange={(checked) => {
                       // NOTE: Mock implementation
                      setSlides(slides.map(s => s.id === slide.id ? {...s, visible: checked} : s));
                    }}
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
            <Button type="submit" onClick={handleSaveChanges}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
