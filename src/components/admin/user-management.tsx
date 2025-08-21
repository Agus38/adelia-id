
'use client';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Ban, Trash2, Edit, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
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
import { useState } from 'react';
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
import { cn } from '@/lib/utils';

type UserStatus = 'Aktif' | 'Diblokir';
type UserRole = 'Admin' | 'Pengguna' | 'Editor';

const initialUsers = [
  { id: 1, name: 'Adelia', email: 'adelia@example.com', role: 'Admin' as UserRole, joined: '2023-01-15', status: 'Aktif' as UserStatus },
  { id: 2, name: 'Budi', email: 'budi@example.com', role: 'Pengguna' as UserRole, joined: '2023-02-20', status: 'Aktif' as UserStatus },
  { id: 3, name: 'Citra', email: 'citra@example.com', role: 'Pengguna' as UserRole, joined: '2023-03-10', status: 'Aktif' as UserStatus },
  { id: 4, name: 'Dewi', email: 'dewi@example.com', role: 'Editor' as UserRole, joined: '2023-04-05', status: 'Diblokir' as UserStatus },
  { id: 5, name: 'Eka', email: 'eka@example.com', role: 'Pengguna' as UserRole, joined: '2023-05-21', status: 'Aktif' as UserStatus },
];

type User = (typeof initialUsers)[0];

const roleBadgeVariant: { [key in UserRole]: 'destructive' | 'secondary' | 'default' } = {
  'Admin': 'destructive',
  'Editor': 'default',
  'Pengguna': 'secondary',
};

const statusBadgeVariant: { [key in UserStatus]: 'default' | 'destructive' } = {
  'Aktif': 'default',
  'Diblokir': 'destructive',
};

export function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isBlockDialogOpen, setBlockDialogOpen] = useState(false);
  const [isUnblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setAddEditDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setAddEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  
  const handleBlock = (user: User) => {
    setSelectedUser(user);
    setBlockDialogOpen(true);
  };

  const handleUnblock = (user: User) => {
    setSelectedUser(user);
    setUnblockDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
    }
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const confirmBlock = () => {
    if (selectedUser) {
      setUsers(users.map(u => u.id === selectedUser.id ? {...u, status: 'Diblokir'} : u));
    }
    setBlockDialogOpen(false);
    setSelectedUser(null);
  }

  const confirmUnblock = () => {
    if (selectedUser) {
        setUsers(users.map(u => u.id === selectedUser.id ? {...u, status: 'Aktif'} : u));
    }
    setUnblockDialogOpen(false);
    setSelectedUser(null);
  }


  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Bergabung</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant[user.role]}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                   <Badge variant={statusBadgeVariant[user.status]} className={cn(user.status === 'Aktif' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30', 'border')}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.joined}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                       {user.status === 'Aktif' ? (
                          <DropdownMenuItem onClick={() => handleBlock(user)}>
                            <Ban className="mr-2 h-4 w-4" />
                            Blokir
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUnblock(user)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Buka Blokir
                          </DropdownMenuItem>
                        )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(user)} className="text-destructive focus:text-destructive">
                         <Trash2 className="mr-2 h-4 w-4" />
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

      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
            <DialogDescription>
              {selectedUser
                ? 'Ubah detail pengguna di bawah ini.'
                : 'Isi formulir untuk menambahkan pengguna baru.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nama</Label>
              <Input id="name" defaultValue={selectedUser?.name || ''} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" defaultValue={selectedUser?.email || ''} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setAddEditDialogOpen(false)}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pengguna secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={isBlockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Blokir Pengguna: {selectedUser?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengguna yang diblokir tidak akan dapat mengakses aplikasi. Anda dapat membuka blokir nanti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBlock}>Ya, Blokir Pengguna</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isUnblockDialogOpen} onOpenChange={setUnblockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buka Blokir Pengguna: {selectedUser?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan mengizinkan pengguna untuk mengakses aplikasi kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnblock}>Ya, Buka Blokir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
