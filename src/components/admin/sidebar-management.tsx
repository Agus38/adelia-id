

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
import { allIcons } from '@/lib/menu-items-v2';
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
import type { MenuItem } from '@/lib/menu-items-v2';
import { ArrowDown, ArrowUp, PlusCircle, Trash2, type LucideIcon, Search, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { ScrollArea } from '../ui/scroll-area';
import { useSidebarMenuConfig, saveSidebarMenuConfig, useRolesConfig } from '@/lib/menu-store';


const iconList = Object.entries(allIcons).map(([name, component]) => ({ name, component })).sort((a,b) => a.name.localeCompare(b.name));


export function SidebarManagement() {
  const { sidebarMenuItems, isLoading: isLoadingSidebar } = useSidebarMenuConfig();
  const { roles, isLoading: isLoadingRoles } = useRolesConfig();
  const [menuState, setMenuState] = useState<MenuItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  
  const [isIconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconSearchTerm, setIconSearchTerm] = useState("");

  const isLoading = isLoadingSidebar || isLoadingRoles;

  useEffect(() => {
    if (sidebarMenuItems) {
      setMenuState(sidebarMenuItems);
    }
  }, [sidebarMenuItems]);

  const handleEdit = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsNew(false);
    setEditDialogOpen(true);
  };
  
  const handleAddNew = () => {
    const defaultIcon = iconList.find(i => i.name === 'Package') || iconList[0];
    setSelectedMenuItem({
      id: '',
      title: '',
      href: '/',
      icon: defaultIcon.component,
      iconName: defaultIcon.name,
      access: 'all',
      comingSoon: false,
    });
    setIsNew(true);
    setEditDialogOpen(true);
  }

  const handleDelete = (id: string) => {
    if (id === 'home') {
        toast({ title: "Tidak Diizinkan", description: "Item menu 'Beranda' tidak dapat dihapus.", variant: "destructive"});
        return;
    }
    setMenuState(menuState.filter(item => item.id !== id));
    toast({
        title: "Menu Dihapus",
        description: `Menu dengan ID "${id}" telah dihapus dari daftar lokal. Simpan perubahan untuk menerapkan.`,
        variant: "destructive"
    });
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newMenuState = [...menuState];
    const item = newMenuState[index];
    
    if (item.id === 'home') return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 1 || swapIndex >= newMenuState.length) {
      return;
    }

    newMenuState.splice(index, 1);
    newMenuState.splice(swapIndex, 0, item);

    setMenuState(newMenuState);
  };

  const handleAccessChange = (id: string, access: 'all' | 'admin' | string) => {
     setMenuState(prevState => 
        prevState.map(item => item.id === id ? {...item, access} : item)
    );
  }
  
  const handleSaveMenu = () => {
    if (!selectedMenuItem) return;

    if (isNew) {
        if (!selectedMenuItem.id) {
            toast({ title: "Error", description: "ID menu tidak boleh kosong.", variant: "destructive"});
            return;
        }
        setMenuState([...menuState, selectedMenuItem]);
        toast({ title: "Menu Ditambahkan", description: "Item menu baru telah ditambahkan ke daftar lokal." });
    } else {
        setMenuState(menuState.map(item => item.id === selectedMenuItem.id ? selectedMenuItem : item));
        toast({ title: "Menu Diperbarui", description: "Item menu telah diperbarui di daftar lokal." });
    }
    setEditDialogOpen(false);
  }

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
        await saveSidebarMenuConfig(menuState);
        toast({
            title: "Perubahan Disimpan!",
            description: "Konfigurasi sidebar telah berhasil diperbarui di database."
        })
    } catch (error) {
         toast({
            title: "Gagal Menyimpan",
            description: "Terjadi kesalahan saat menyimpan konfigurasi sidebar.",
            variant: "destructive"
        })
    } finally {
        setIsSaving(false);
    }
  }

  const handleIconSelect = (icon: {name: string, component: LucideIcon}) => {
    setSelectedMenuItem(prev => prev ? {...prev, icon: icon.component, iconName: icon.name } : null);
    setIconPickerOpen(false);
  }
  
  const filteredIcons = iconList.filter(icon => 
    icon.name.toLowerCase().includes(iconSearchTerm.toLowerCase())
  );

  return (
    <div>
        <div className="flex justify-between mb-4">
            <Button variant="outline" onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Menu Baru</Button>
            <Button onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Semua Perubahan
            </Button>
        </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ikon</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Hak Akses</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {isLoading ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        <p>Memuat konfigurasi sidebar...</p>
                    </TableCell>
                </TableRow>
            ) : (
                menuState.map((item, index) => (
                <TableRow key={item.id}>
                    <TableCell>
                    <item.icon className="h-5 w-5" />
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                    <Select 
                        value={item.access || 'all'} 
                        onValueChange={(value) => handleAccessChange(item.id, value)}
                        disabled={item.id === 'home'}
                    >
                        <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Pilih akses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua</SelectItem>
                           {roles.map(role => (
                               <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                    </TableCell>
                    <TableCell className="text-right space-x-0.5">
                    <Button variant="ghost" size="icon" onClick={() => handleMove(index, 'up')} disabled={index <= 1 || item.id === 'home'}>
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleMove(index, 'down')} disabled={index === 0 || index === menuState.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        Edit
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={item.id === 'home'}>Hapus</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Anda yakin ingin menghapus menu "{item.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini akan menghapus item menu dari daftar lokal. Simpan perubahan untuk menerapkan.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>Lanjutkan</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? 'Tambah Menu Sidebar' : `Edit Menu: ${selectedMenuItem?.title}`}</DialogTitle>
            <DialogDescription>
             {isNew ? "Buat item menu baru untuk sidebar." : "Ubah detail item menu di bawah ini."}
            </DialogDescription>
          </DialogHeader>
          {selectedMenuItem && (
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="id" className="text-right">ID</Label>
                    <Input 
                        id="id"
                        value={selectedMenuItem.id} 
                        onChange={(e) => setSelectedMenuItem(prev => prev ? {...prev, id: e.target.value.toLowerCase().replace(/\s/g, '-')} : null)}
                        className="col-span-3"
                        disabled={!isNew && selectedMenuItem.id === 'home'}
                        placeholder="cth: menu-baru-sidebar"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Label</Label>
                    <Input 
                        id="title" 
                        value={selectedMenuItem.title} 
                        onChange={(e) => setSelectedMenuItem(prev => prev ? {...prev, title: e.target.value} : null)}
                        className="col-span-3" 
                        placeholder="Nama menu"
                        disabled={selectedMenuItem.id === 'home'}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="href" className="text-right">Path</Label>
                    <Input 
                        id="href" 
                        value={selectedMenuItem.href} 
                        onChange={(e) => setSelectedMenuItem(prev => prev ? {...prev, href: e.target.value} : null)}
                        className="col-span-3" 
                        placeholder="/path-url"
                         disabled={selectedMenuItem.id === 'home'}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Ikon</Label>
                    <Button variant="outline" className="col-span-3 justify-start" onClick={() => setIconPickerOpen(true)}>
                       {selectedMenuItem.icon && <selectedMenuItem.icon className="mr-2 h-4 w-4" />}
                       <span>{(selectedMenuItem as any).iconName || selectedMenuItem.icon.displayName}</span>
                    </Button>
                </div>
            </div>
          )}
          <DialogFooter>
             <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button type="submit" onClick={handleSaveMenu}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isIconPickerOpen} onOpenChange={setIconPickerOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Pilih Ikon</DialogTitle>
                <DialogDescription>Klik sebuah ikon untuk memilihnya.</DialogDescription>
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
    </div>
  );
}
