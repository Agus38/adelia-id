
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
import { menuItems as initialMenuItems, allMenuItems as allIconsMap } from '@/lib/menu-items-v2';
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
import type { MenuItem } from '@/lib/menu-items-v2';
import { ArrowDown, ArrowUp, PlusCircle, Trash2, type LucideIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '../ui/badge';
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

// Create a map for quick icon lookup
const iconList = allIconsMap.reduce((acc, item) => {
    if (!acc.find(i => i.name === item.icon.displayName)) {
        acc.push({ name: item.icon.displayName as string, component: item.icon });
    }
    return acc;
}, [] as { name: string, component: LucideIcon }[]);


export function MenuManagement() {
  const [menuState, setMenuState] = useState<MenuItem[]>(initialMenuItems);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  const handleEdit = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsNew(false);
    setEditDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedMenuItem({
      id: '',
      title: '',
      href: '/',
      icon: iconList[0].component,
      access: 'all',
      comingSoon: false,
    });
    setIsNew(true);
    setEditDialogOpen(true);
  }

  const handleDelete = (id: string) => {
    setMenuState(menuState.filter(item => item.id !== id));
    toast({
        title: "Menu Dihapus",
        description: `Menu dengan ID "${id}" telah berhasil dihapus.`,
        variant: "destructive"
    });
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newMenuState = [...menuState];
    const item = newMenuState[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= newMenuState.length) {
      return;
    }

    newMenuState.splice(index, 1);
    newMenuState.splice(swapIndex, 0, item);

    setMenuState(newMenuState);
  };

  const handleVisibilityChange = (id: string, isVisible: boolean) => {
    setMenuState(prevState => 
        prevState.map(item => item.id === id ? {...item, comingSoon: !isVisible} : item)
    );
  }

  const handleAccessChange = (id: string, access: 'all' | 'admin') => {
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
        toast({ title: "Menu Ditambahkan", description: "Item menu baru telah berhasil ditambahkan." });
    } else {
        setMenuState(menuState.map(item => item.id === selectedMenuItem.id ? selectedMenuItem : item));
        toast({ title: "Menu Diperbarui", description: "Item menu telah berhasil diperbarui." });
    }
    setEditDialogOpen(false);
  }

  const handleSaveChanges = () => {
    // NOTE: Mock implementation. In a real app, you would save the new order.
    console.log("Saving new menu state:", menuState);
    toast({
        title: "Perubahan Disimpan!",
        description: "Konfigurasi menu telah berhasil diperbarui."
    })
  }

  return (
    <div>
        <div className="flex justify-between mb-4">
            <Button variant="outline" onClick={handleAddNew}><PlusCircle className="mr-2" /> Tambah Menu Baru</Button>
            <Button onClick={handleSaveChanges}>Simpan Semua Perubahan</Button>
        </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ikon</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Visibilitas</TableHead>
              <TableHead>Hak Akses</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuState.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <item.icon className="h-5 w-5" />
                </TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                   <div className="flex flex-col items-center gap-1.5">
                    <Switch 
                        checked={!item.comingSoon} 
                        onCheckedChange={(checked) => handleVisibilityChange(item.id, checked)}
                        aria-label="Visibilitas menu" />
                    <Badge variant={item.comingSoon ? 'secondary' : 'default'} className="text-[10px] px-1.5 py-0.5">
                        {item.comingSoon ? 'Segera' : 'Terlihat'}
                    </Badge>
                   </div>
                </TableCell>
                <TableCell>
                  <Select 
                    value={item.access || 'all'} 
                    onValueChange={(value: 'all' | 'admin') => handleAccessChange(item.id, value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Pilih akses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right space-x-0.5">
                   <Button variant="ghost" size="icon" onClick={() => handleMove(index, 'up')} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleMove(index, 'down')} disabled={index === menuState.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="sm">Hapus</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Anda yakin ingin menghapus menu "{item.title}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus item menu secara permanen.
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
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? 'Tambah Menu Baru' : `Edit Menu: ${selectedMenuItem?.title}`}</DialogTitle>
            <DialogDescription>
             {isNew ? "Buat item menu baru untuk aplikasi." : "Ubah detail item menu di bawah ini."}
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
                        disabled={!isNew}
                        placeholder="cth: menu-baru"
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
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="icon" className="text-right">Ikon</Label>
                     <Select
                        value={selectedMenuItem.icon.displayName}
                        onValueChange={(value) => {
                            const selectedIcon = iconList.find(icon => icon.name === value);
                            if(selectedIcon) {
                                setSelectedMenuItem(prev => prev ? {...prev, icon: selectedIcon.component } : null)
                            }
                        }}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Pilih ikon" />
                        </SelectTrigger>
                        <SelectContent>
                            {iconList.map(icon => (
                                <SelectItem key={icon.name} value={icon.name}>{icon.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          )}
          <DialogFooter>
             <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button type="submit" onClick={handleSaveMenu}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
