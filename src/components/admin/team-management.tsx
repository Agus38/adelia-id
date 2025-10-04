
'use client';

import { useState, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MoreHorizontal, PlusCircle, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

const initialTeamMembers = [
  {
    id: 1,
    name: 'Adelia',
    title: 'Project Manager',
    avatarUrl: 'https://placehold.co/150x150.png',
    avatarFallback: 'AD',
  },
  {
    id: 2,
    name: 'Budi',
    title: 'Lead Developer',
    avatarUrl: 'https://placehold.co/150x150.png',
    avatarFallback: 'BU',
  },
  {
    id: 3,
    name: 'Citra',
    title: 'UI/UX Designer',
    avatarUrl: 'https://placehold.co/150x150.png',
    avatarFallback: 'CI',
  },
  {
    id: 4,
    name: 'Dewi',
    title: 'QA Engineer',
    avatarUrl: 'https://placehold.co/150x150.png',
    avatarFallback: 'DE',
  },
];

type TeamMember = typeof initialTeamMembers[0];

export function TeamManagement() {
  const [members, setMembers] = useState(initialTeamMembers);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (member: TeamMember) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMember) {
      setMembers(members.filter(m => m.id !== selectedMember.id));
    }
    setDeleteDialogOpen(false);
    setSelectedMember(null);
  };

  const handleSaveChanges = () => {
    // NOTE: This is a mock implementation.
    if (selectedMember) {
        if (selectedMember.id) { // Edit
            setMembers(members.map(m => m.id === selectedMember.id ? selectedMember : m));
        } else { // Add
             const newMember = {...selectedMember, id: Math.max(...members.map(m => m.id), 0) + 1 };
             setMembers([...members, newMember]);
        }
    }
    setEditDialogOpen(false);
  };

  const handleAddNew = () => {
      setSelectedMember({id: 0, name: '', title: '', avatarUrl: 'https://placehold.co/150x150.png', avatarFallback: ''});
      setEditDialogOpen(true);
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedMember) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "Ukuran File Terlalu Besar",
        description: "Ukuran file avatar tidak boleh melebihi 2MB.",
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

        setSelectedMember(prev => prev ? { ...prev, avatarUrl: dataUrl } : null);
        
        toast({
          title: "Gambar Diproses",
          description: "Avatar berhasil diproses. Perubahan belum tersimpan.",
        });

    } catch (error) {
      toast({
        title: "Gagal Memproses Gambar",
        description: "Terjadi kesalahan saat memproses gambar.",
        variant: "destructive",
      });
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Anggota
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anggota</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="team member portrait" />
                      <AvatarFallback>{member.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.name}</span>
                  </div>
                </TableCell>
                <TableCell>{member.title}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(member)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClick(member)}
                      >
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedMember?.id ? 'Edit Anggota Tim' : 'Tambah Anggota Tim'}</DialogTitle>
            <DialogDescription>
              Ubah detail anggota di bawah ini. Perubahan akan disimpan setelah Anda menekan tombol simpan.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" value={selectedMember.name} onChange={(e) => setSelectedMember({...selectedMember, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Jabatan</Label>
                <Input id="title" value={selectedMember.title} onChange={(e) => setSelectedMember({...selectedMember, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">URL Avatar</Label>
                 <div className="flex gap-2">
                    <Input id="avatarUrl" value={selectedMember.avatarUrl} onChange={(e) => setSelectedMember({...selectedMember, avatarUrl: e.target.value})} />
                     <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        <span className="sr-only">Unggah Avatar</span>
                    </Button>
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        disabled={isUploading}
                    />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="avatarFallback">Teks Fallback Avatar</Label>
                <Input id="avatarFallback" value={selectedMember.avatarFallback} onChange={(e) => setSelectedMember({...selectedMember, avatarFallback: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button type="submit" onClick={handleSaveChanges}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus anggota tim secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
