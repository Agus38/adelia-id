'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Trash2, Edit, Users, Settings, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';
import { useUserStore, type UserProfile } from '@/lib/user-store';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { useMenuConfig } from '@/lib/menu-store';

interface UserGroup {
    id: string;
    name: string;
    description: string;
    memberIds: string[];
    menuAccess: Record<string, boolean>;
    createdAt?: any;
}

export function UserGroupManagement() {
  const { user: currentUser, loading: isLoadingUser } = useUserStore();
  const { menuItems } = useMenuConfig();
  
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [groups, setGroups] = React.useState<UserGroup[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);
  
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Dialog States
  const [isGroupDialogOpen, setGroupDialogOpen] = React.useState(false);
  const [isPermissionsDialogOpen, setPermissionsDialogOpen] = React.useState(false);
  const [isMembersDialogOpen, setMembersDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  
  const [selectedGroup, setSelectedGroup] = React.useState<UserGroup | null>(null);
  const [isNewGroup, setIsNewGroup] = React.useState(false);
  
  const [editedName, setEditedName] = React.useState('');
  const [editedDescription, setEditedDescription] = React.useState('');
  const [editedPermissions, setEditedPermissions] = React.useState<Record<string, boolean>>({});
  const [editedMemberIds, setEditedMemberIds] = React.useState<string[]>([]);


  const fetchData = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersList.sort((a,b) => (a.fullName || '').localeCompare(b.fullName || '')));

      const groupsSnapshot = await getDocs(collection(db, 'userGroups'));
      const groupsList = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserGroup));
      setGroups(groupsList.sort((a,b) => a.name.localeCompare(b.name)));

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: 'Gagal Memuat Data', description: 'Tidak dapat mengambil data pengguna atau grup dari Firestore.', variant: 'destructive'});
    } finally {
      setLoadingData(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isLoadingUser && currentUser?.role === 'Admin') {
      fetchData();
    } else if (!isLoadingUser) {
      setLoadingData(false);
    }
  }, [isLoadingUser, currentUser, fetchData]);

  const openDialog = (group: UserGroup | null, type: 'detail' | 'permissions' | 'members') => {
      if (!group) return;
      setSelectedGroup(group);
      if (type === 'detail') {
          setEditedName(group.name);
          setEditedDescription(group.description);
          setGroupDialogOpen(true);
      } else if (type === 'permissions') {
          setEditedPermissions(group.menuAccess || {});
          setPermissionsDialogOpen(true);
      } else if (type === 'members') {
          setEditedMemberIds(group.memberIds || []);
          setMembersDialogOpen(true);
      }
  };

  const handleAddNewGroup = () => {
    setIsNewGroup(true);
    setSelectedGroup(null);
    setEditedName('');
    setEditedDescription('');
    setGroupDialogOpen(true);
  };
  
  const handleSaveGroupDetails = async () => {
      if (!editedName) {
          toast({ title: 'Nama Grup Wajib Diisi', variant: 'destructive'});
          return;
      }
      setIsProcessing(true);
      try {
          if (isNewGroup) {
              await addDoc(collection(db, 'userGroups'), {
                  name: editedName,
                  description: editedDescription,
                  memberIds: [],
                  menuAccess: {},
                  createdAt: serverTimestamp(),
              });
              toast({ title: 'Grup Baru Ditambahkan' });
          } else if (selectedGroup) {
              const groupDocRef = doc(db, 'userGroups', selectedGroup.id);
              await updateDoc(groupDocRef, { name: editedName, description: editedDescription });
              toast({ title: 'Detail Grup Diperbarui' });
          }
          fetchData();
          setGroupDialogOpen(false);
      } catch (error) {
          toast({ title: 'Gagal Menyimpan', description: 'Terjadi kesalahan saat menyimpan data grup.', variant: 'destructive' });
      } finally {
          setIsProcessing(false);
      }
  };
  
  const handleSavePermissions = async () => {
    if (!selectedGroup) return;
    setIsProcessing(true);
    try {
        const groupDocRef = doc(db, 'userGroups', selectedGroup.id);
        await updateDoc(groupDocRef, { menuAccess: editedPermissions });
        toast({ title: 'Hak Akses Diperbarui' });
        fetchData();
        setPermissionsDialogOpen(false);
    } catch (error) {
        toast({ title: 'Gagal Menyimpan', description: 'Terjadi kesalahan saat menyimpan hak akses.', variant: 'destructive' });
    } finally {
        setIsProcessing(false);
    }
  }
  
  const handleSaveMembers = async () => {
    if (!selectedGroup) return;
    setIsProcessing(true);
    try {
        const groupDocRef = doc(db, 'userGroups', selectedGroup.id);
        await updateDoc(groupDocRef, { memberIds: editedMemberIds });
        toast({ title: 'Anggota Grup Diperbarui' });
        fetchData();
        setMembersDialogOpen(false);
    } catch (error) {
        toast({ title: 'Gagal Menyimpan', description: 'Terjadi kesalahan saat menyimpan anggota grup.', variant: 'destructive' });
    } finally {
        setIsProcessing(false);
    }
  }

  const handleDeleteGroup = (group: UserGroup) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteGroup = async () => {
      if (!selectedGroup) return;
      setIsProcessing(true);
      try {
          await deleteDoc(doc(db, 'userGroups', selectedGroup.id));
          toast({ title: 'Grup Dihapus' });
          fetchData();
          setDeleteDialogOpen(false);
      } catch (error) {
          toast({ title: 'Gagal Menghapus', description: 'Terjadi kesalahan saat menghapus grup.', variant: 'destructive' });
      } finally {
          setIsProcessing(false);
      }
  }
  
  const isLoading = isLoadingUser || loadingData;

  const appMenuItems = menuItems.filter(item => item.access !== 'admin');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Daftar Grup Pengguna</CardTitle>
                <CardDescription>Kelompokkan pengguna berdasarkan peran dan hak akses menu mereka.</CardDescription>
            </div>
            <Button onClick={handleAddNewGroup} disabled={isLoading}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Grup
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Grup</TableHead>
                  <TableHead>Anggota</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                   <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        </TableCell>
                    </TableRow>
                ) : groups.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                            Belum ada grup yang dibuat.
                        </TableCell>
                    </TableRow>
                ) : groups.map(group => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.description}</p>
                    </TableCell>
                    <TableCell>{group.memberIds?.length || 0} Pengguna</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDialog(group, 'detail')}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Detail Grup
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog(group, 'members')}>
                            <Users className="mr-2 h-4 w-4" />
                            Kelola Anggota
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog(group, 'permissions')}>
                            <Settings className="mr-2 h-4 w-4" />
                            Atur Hak Akses
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteGroup(group)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus Grup
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog for Group Details */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isNewGroup ? 'Buat Grup Baru' : `Edit Grup: ${selectedGroup?.name}`}</DialogTitle>
            <DialogDescription>
             {isNewGroup ? 'Buat grup baru untuk mengelola pengguna.' : 'Ubah nama dan deskripsi untuk grup ini.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <div className="space-y-2">
                  <Label htmlFor='group-name'>Nama Grup</Label>
                  <Input id="group-name" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor='group-desc'>Deskripsi</Label>
                  <Input id="group-desc" value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)} disabled={isProcessing}>Batal</Button>
            <Button onClick={handleSaveGroupDetails} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Permissions */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atur Hak Akses untuk: {selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              Pilih menu mana saja yang dapat diakses oleh anggota grup ini.
            </DialogDescription>
          </DialogHeader>
           <ScrollArea className="max-h-[60vh] my-4">
            <div className="space-y-4 pr-6">
                {appMenuItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor={`access-${item.id}`} className="font-medium">{item.title}</Label>
                        <Switch 
                            id={`access-${item.id}`} 
                            checked={editedPermissions[item.id] || false}
                            onCheckedChange={(checked) => setEditedPermissions(prev => ({ ...prev, [item.id]: checked }))}
                        />
                    </div>
                ))}
            </div>
           </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)} disabled={isProcessing}>Batal</Button>
            <Button onClick={handleSavePermissions} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Hak Akses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    {/* Dialog for Members */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Kelola Anggota: {selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              Tambahkan atau hapus pengguna dari grup ini.
            </DialogDescription>
          </DialogHeader>
           <ScrollArea className="max-h-[60vh] my-4">
            <div className="space-y-4 pr-6">
                {users.filter(u => u.role !== 'Admin').map(user => (
                    <div key={user.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Switch 
                            id={`user-${user.id}`}
                            checked={editedMemberIds.includes(user.id)}
                            onCheckedChange={(checked) => {
                                setEditedMemberIds(prev => checked ? [...prev, user.id] : prev.filter(id => id !== user.id));
                            }}
                        />
                    </div>
                ))}
            </div>
           </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMembersDialogOpen(false)} disabled={isProcessing}>Batal</Button>
            <Button onClick={handleSaveMembers} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Anggota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Grup: {selectedGroup?.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Grup akan dihapus secara permanen. Pengguna di dalamnya tidak akan terhapus.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeleteGroup} disabled={isProcessing}>
                      {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Ya, Hapus
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
