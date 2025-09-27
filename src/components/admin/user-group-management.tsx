
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
import { MoreHorizontal, PlusCircle, Trash2, Edit, Users, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// Mock Data - In a real app, this would come from Firestore
const mockUsers = [
  { id: 'user1', name: 'Adelia', email: 'adelia@example.com' },
  { id: 'user2', name: 'Budi', email: 'budi@example.com' },
  { id: 'user3', name: 'Citra', email: 'citra@example.com' },
  { id: 'user4', name: 'Dewi', email: 'dewi@example.com' },
  { id: 'user5', name: 'Eka', email: 'eka@example.com' },
];

const mockMenuItems = [
    { id: 'laporan-smw-merr', title: 'Laporan Harian' },
    { id: 'digital-products', title: 'Produk Digital' },
    { id: 'stok-produk', title: 'Stok Produk' },
    { id: 'smw-manyar', title: 'SMW Manyar' },
    { id: 'nexus-ai', title: 'Nexus AI' },
    { id: 'cek-usia', title: 'Cek Usia' },
];

const mockGroups = [
  { id: 'group1', name: 'Kasir', description: 'Akses terbatas untuk kasir.', memberIds: ['user2', 'user3'], menuAccess: { 'digital-products': true, 'laporan-smw-merr': true } },
  { id: 'group2', name: 'Manajer Area', description: 'Akses penuh ke laporan dan stok.', memberIds: ['user4'], menuAccess: { 'laporan-smw-merr': true, 'stok-produk': true, 'smw-manyar': true } },
];

export function UserGroupManagement() {
  const [groups, setGroups] = React.useState(mockGroups);
  const [defaultGroup, setDefaultGroup] = React.useState('group1');
  const [isEditGroupOpen, setEditGroupOpen] = React.useState(false);
  const [isEditPermissionsOpen, setEditPermissionsOpen] = React.useState(false);
  const [isEditMembersOpen, setEditMembersOpen] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<(typeof mockGroups)[0] | null>(null);

  const handleEditGroup = (group: (typeof mockGroups)[0]) => {
    setSelectedGroup(group);
    setEditGroupOpen(true);
  };
  
  const handleEditPermissions = (group: (typeof mockGroups)[0]) => {
    setSelectedGroup(group);
    setEditPermissionsOpen(true);
  };
  
  const handleEditMembers = (group: (typeof mockGroups)[0]) => {
    setSelectedGroup(group);
    setEditMembersOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Grup Default</CardTitle>
          <CardDescription>
            Pilih grup yang akan secara otomatis ditetapkan untuk pengguna baru saat mereka mendaftar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="default-group" className="whitespace-nowrap">Grup Default</Label>
            <Select value={defaultGroup} onValueChange={setDefaultGroup}>
              <SelectTrigger id="default-group" className="w-full max-w-xs">
                <SelectValue placeholder="Pilih grup default" />
              </SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Daftar Grup Pengguna</CardTitle>
                <CardDescription>Kelompokkan pengguna berdasarkan peran dan hak akses mereka.</CardDescription>
            </div>
            <Button>
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
                {groups.map(group => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.description}</p>
                    </TableCell>
                    <TableCell>{group.memberIds.length} Pengguna</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditGroup(group)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Detail Grup
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditMembers(group)}>
                            <Users className="mr-2 h-4 w-4" />
                            Kelola Anggota
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPermissions(group)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Atur Hak Akses
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
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
      
      {/* Dialog for Permissions */}
      <Dialog open={isEditPermissionsOpen} onOpenChange={setEditPermissionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atur Hak Akses untuk: {selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              Pilih menu mana saja yang dapat diakses oleh anggota grup ini.
            </DialogDescription>
          </DialogHeader>
           <ScrollArea className="max-h-[60vh] my-4">
            <div className="space-y-4 pr-6">
                {mockMenuItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor={`access-${item.id}`} className="font-medium">{item.title}</Label>
                        <Switch id={`access-${item.id}`} />
                    </div>
                ))}
            </div>
           </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPermissionsOpen(false)}>Batal</Button>
            <Button>Simpan Hak Akses</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    {/* Dialog for Members */}
      <Dialog open={isEditMembersOpen} onOpenChange={setEditMembersOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Kelola Anggota: {selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              Tambahkan atau hapus pengguna dari grup ini.
            </DialogDescription>
          </DialogHeader>
           <ScrollArea className="max-h-[60vh] my-4">
            <div className="space-y-4 pr-6">
                {mockUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Switch id={`user-${user.id}`} />
                    </div>
                ))}
            </div>
           </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMembersOpen(false)}>Batal</Button>
            <Button>Simpan Anggota</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
