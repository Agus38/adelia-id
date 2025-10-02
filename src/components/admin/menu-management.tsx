
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
import { ArrowDown, ArrowUp, PlusCircle, Trash2, type LucideIcon, Search, Loader2, Wrench, Lock, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
import { ScrollArea } from '../ui/scroll-area';
import { useMenuConfig, saveMenuConfig } from '@/lib/menu-store';
import { useUserStore } from '@/lib/user-store';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const iconList = Object.entries(allIcons).map(([name, component]) => ({ name, component })).sort((a,b) => a.name.localeCompare(b.name));


export function MenuManagement() {
  const { menuItems, isLoading } = useMenuConfig();
  const { userGroups, loading: isLoadingGroups } = useUserStore();
  const [menuState, setMenuState] = useState<MenuItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  
  const [isIconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconSearchTerm, setIconSearchTerm] = useState("");
  
  const [isPermissionsDialogOpen, setPermissionsDialogOpen] = React.useState(false);
  const [editedPermissions, setEditedPermissions] = React.useState<Record<string, boolean>>({});

  useEffect(() => {
    if (menuItems) {
      setMenuState(menuItems);
    }
  }, [menuItems]);

  const areAllUnderMaintenance = menuState.every(item => item.isUnderMaintenance);

  const handleToggleAllMaintenance = () => {
    const newState = !areAllUnderMaintenance;
    setMenuState(menuState.map(item => ({...item, isUnderMaintenance: newState})));
     toast({
        title: `Mode Maintenance ${newState ? 'Diaktifkan' : 'Dinonaktifkan'}`,
        description: `Semua item menu telah diatur ke mode maintenance ${newState ? 'aktif' : 'tidak aktif'}. Simpan perubahan untuk menerapkan.`,
    });
  }

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
      badgeText: '',
      isUnderMaintenance: false,
      requiresAuth: false,
    });
    setIsNew(true);
    setEditDialogOpen(true);
  }

  const handleDelete = (id: string) => {
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

   const handleMaintenanceChange = (id: string, isUnderMaintenance: boolean) => {
    setMenuState(prevState => 
        prevState.map(item => item.id === id ? {...item, isUnderMaintenance } : item)
    );
  }

  const handleAuthChange = (id: string, requiresAuth: boolean) => {
    setMenuState(prevState =>
      prevState.map(item => item.id === id ? {...item, requiresAuth} : item)
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
        await saveMenuConfig(menuState);
        toast({
            title: "Perubahan Disimpan!",
            description: "Konfigurasi menu telah berhasil diperbarui di database."
        })
    } catch (error) {
         toast({
            title: "Gagal Menyimpan",
            description: "Terjadi kesalahan saat menyimpan konfigurasi menu.",
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

  const openPermissionsDialog = (menuItem: MenuItem) => {
      const initialPermissions: Record<string, boolean> = {};
      userGroups.forEach(group => {
          initialPermissions[group.id] = group.menuAccess?.[menuItem.id] || false;
      });
      setSelectedMenuItem(menuItem);
      setEditedPermissions(initialPermissions);
      setPermissionsDialogOpen(true);
  };
  
  const handleSavePermissions = async () => {
      if (!selectedMenuItem) return;
      setIsSaving(true);
      try {
          // This is a complex operation. We need to update multiple group documents.
          const promises = userGroups.map(group => {
              const groupDocRef = doc(db, 'userGroups', group.id);
              const newMenuAccess = { ...group.menuAccess, [selectedMenuItem.id]: editedPermissions[group.id] || false };
              return updateDoc(groupDocRef, { menuAccess: newMenuAccess });
          });
          await Promise.all(promises);
          toast({ title: "Hak Akses Diperbarui", description: `Izin untuk menu "${selectedMenuItem.title}" telah disimpan.` });
          setPermissionsDialogOpen(false);
      } catch (error) {
          toast({ title: 'Gagal Menyimpan Hak Akses', variant: 'destructive' });
      } finally {
          setIsSaving(false);
      }
  };
  
  const filteredIcons = iconList.filter(icon => 
    icon.name.toLowerCase().includes(iconSearchTerm.toLowerCase())
  );

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Menu</Button>
                <Button variant="secondary" onClick={handleToggleAllMaintenance}>
                    <Wrench className="mr-2 h-4 w-4" /> 
                    {areAllUnderMaintenance ? "Nonaktifkan Semua Maintenance" : "Aktifkan Semua Maintenance"}
                </Button>
            </div>
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
              <TableHead>Visibilitas</TableHead>
              <TableHead>Maintenance</TableHead>
              <TableHead>Wajib Login</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isLoadingGroups ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        <p>Memuat konfigurasi menu...</p>
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
                    <div className="flex flex-col items-center gap-1.5">
                        <Switch 
                            checked={!item.comingSoon} 
                            onCheckedChange={(checked) => handleVisibilityChange(item.id, checked)}
                            aria-label="Visibilitas menu" />
                        <Badge variant={item.comingSoon ? 'secondary' : 'default'} className="text-[10px] px-1.5 py-0.5">
                            {item.comingSoon ? (item.badgeText || 'Segera') : 'Terlihat'}
                        </Badge>
                    </div>
                    </TableCell>
                     <TableCell>
                       <Switch 
                            checked={item.isUnderMaintenance} 
                            onCheckedChange={(checked) => handleMaintenanceChange(item.id, checked)}
                            aria-label="Mode Maintenance" />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.requiresAuth}
                        onCheckedChange={(checked) => handleAuthChange(item.id, checked)}
                        aria-label="Wajib Login"
                        disabled={item.access === 'admin'}
                      />
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
                    {item.access !== 'admin' && (
                      <Button variant="outline" size="sm" onClick={() => openPermissionsDialog(item)}>
                        <Users className="h-4 w-4"/>
                      </Button>
                    )}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Hapus</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Anda yakin ingin menghapus menu "{item.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus item menu dari daftar lokal.
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
                    <Label className="text-right">Ikon</Label>
                    <Button variant="outline" className="col-span-3 justify-start" onClick={() => setIconPickerOpen(true)}>
                       {selectedMenuItem.icon && <selectedMenuItem.icon className="mr-2 h-4 w-4" />}
                       <span>{(selectedMenuItem as any).iconName || selectedMenuItem.icon.displayName}</span>
                    </Button>
                </div>
                {(selectedMenuItem.comingSoon || selectedMenuItem.isUnderMaintenance) && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="badgeText" className="text-right">Teks Badge</Label>
                        <Input 
                            id="badgeText" 
                            value={selectedMenuItem.badgeText || ''} 
                            onChange={(e) => setSelectedMenuItem(prev => prev ? {...prev, badgeText: e.target.value} : null)}
                            className="col-span-3" 
                            placeholder={selectedMenuItem.isUnderMaintenance ? 'Maintenance' : 'Segera'}
                        />
                    </div>
                )}
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
      
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atur Akses Grup untuk: {selectedMenuItem?.title}</DialogTitle>
            <DialogDescription>
              Pilih grup pengguna mana yang dapat melihat item menu ini.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] my-4">
            <div className="space-y-4 pr-6">
                {userGroups.map(group => (
                    <div key={group.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor={`group-access-${group.id}`} className="font-medium">{group.name}</Label>
                        <Switch
                            id={`group-access-${group.id}`}
                            checked={editedPermissions[group.id] || false}
                            onCheckedChange={(checked) => setEditedPermissions(prev => ({...prev, [group.id]: checked}))}
                        />
                    </div>
                ))}
            </div>
           </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)} disabled={isSaving}>Batal</Button>
            <Button onClick={handleSavePermissions} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Hak Akses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
