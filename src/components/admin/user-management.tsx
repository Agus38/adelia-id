
'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Ban, Trash2, Edit, CheckCircle, ChevronDown, Eye, Loader2, Settings } from 'lucide-react';
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
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { db, rtdb } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import { useUserStore } from '@/lib/user-store';
import { RoleManagement } from './role-management';
import { useRolesConfig, type Role } from '@/lib/menu-store';
import { formatDistanceToNow } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';

type UserStatus = 'Aktif' | 'Diblokir';
type UserRole = string;

type User = {
  id: string; // Firestore document ID
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: any; // Firestore Timestamp
  status: UserStatus;
  menuAccess?: Record<string, boolean>;
};

type PresenceStatus = {
    state: 'online' | 'offline';
    last_changed: number;
}

const roleBadgeVariant: { [key: string]: 'destructive' | 'secondary' | 'default' } = {
  'admin': 'destructive',
  'pengguna': 'secondary',
  'editor': 'default',
  'khusus': 'default',
};

const statusBadgeVariant: { [key in UserStatus]: 'default' | 'destructive' } = {
  'Aktif': 'default',
  'Diblokir': 'destructive',
};

export function UserManagement() {
  const { user: currentUser, loading: isLoadingUser } = useUserStore();
  const [users, setUsers] = React.useState<User[]>([]);
  const [presenceData, setPresenceData] = React.useState<Record<string, PresenceStatus>>({});
  const { roles, isLoading: isLoadingRoles } = useRolesConfig();
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  // Dialog states
  const [isAddEditDialogOpen, setAddEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isBlockUnblockDialogOpen, setBlockUnblockDialogOpen] = React.useState(false);
  
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editedUserData, setEditedUserData] = React.useState<Partial<User>>({});
  const [bulkAction, setBulkAction] = React.useState<'block' | 'unblock' | 'delete' | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setIsDataLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersList);
    } catch (error) {
        toast({
        title: "Gagal memuat pengguna",
        description: "Terjadi kesalahan saat mengambil data dari Firestore.",
        variant: "destructive",
      });
    } finally {
      setIsDataLoading(false);
    }
  }, [toast]);
  
  React.useEffect(() => {
    if (!isLoadingUser && currentUser?.role === 'Admin') {
      fetchUsers();
    } else if (!isLoadingUser) {
      // If not admin, stop loading but don't fetch
      setIsDataLoading(false);
    }
  }, [isLoadingUser, currentUser, fetchUsers]);

  React.useEffect(() => {
    const statusRef = ref(rtdb, 'status');
    const unsubscribe = onValue(statusRef, (snapshot) => {
        const data = snapshot.val();
        setPresenceData(data || {});
    });

    return () => unsubscribe();
  }, []);


  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditedUserData(user);
    setAddEditDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    const newUserTemplate: Partial<User> = {
        fullName: '',
        email: '',
        role: 'Pengguna',
        status: 'Aktif',
    };
    setEditedUserData(newUserTemplate);
    setAddEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setBulkAction(null); // Ensure this is not a bulk action
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleBlockUnblock = (user: User, action: 'block' | 'unblock') => {
    setBulkAction(action);
    setSelectedUser(user);
    setBlockUnblockDialogOpen(true);
  }
  
  const handleSaveUser = async () => {
    if (!editedUserData.email || !editedUserData.fullName) {
      toast({ title: "Error", description: "Nama dan email harus diisi.", variant: "destructive" });
      return;
    }

    try {
      if (selectedUser) { // Editing existing user
        const userDocRef = doc(db, 'users', selectedUser.id);
        await updateDoc(userDocRef, {
            fullName: editedUserData.fullName,
            role: editedUserData.role,
        });
        toast({ title: "Pengguna Diperbarui", description: "Data pengguna telah berhasil diperbarui." });
      } else { // Adding new user
        await addDoc(collection(db, "users"), {
            fullName: editedUserData.fullName,
            email: editedUserData.email,
            role: editedUserData.role,
            status: 'Aktif',
            createdAt: serverTimestamp(),
            uid: `temp_${Date.now()}`,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(editedUserData.fullName)}&background=random`,
        });
        toast({ title: "Pengguna Ditambahkan", description: "Pengguna baru telah berhasil ditambahkan." });
      }
      fetchUsers();
      setAddEditDialogOpen(false);
      setSelectedUser(null);
      setEditedUserData({});

    } catch (error) {
       toast({ title: "Error", description: "Gagal menyimpan data pengguna.", variant: "destructive" });
    }
  };
  
  const handleRoleChange = (role: UserRole) => {
    setEditedUserData(prev => ({ ...prev, role }));
  }

  const handleBulkDelete = () => {
    setBulkAction('delete');
    setDeleteDialogOpen(true);
  };

  const handleBulkBlockUnblock = (action: 'block' | 'unblock') => {
    setBulkAction(action);
    setBlockUnblockDialogOpen(true);
  };
  
  const confirmSingleDelete = async () => {
    if (!selectedUser) return;
    try {
      const userDocRef = doc(db, 'users', selectedUser.id);
      await deleteDoc(userDocRef);
      toast({ title: `Pengguna ${selectedUser.fullName} Dihapus`, description: "Pengguna telah berhasil dihapus." });
      fetchUsers();
    } catch (error) {
       toast({ title: "Gagal Menghapus", description: "Terjadi kesalahan saat menghapus pengguna.", variant: "destructive" });
    } finally {
        setDeleteDialogOpen(false);
        setSelectedUser(null);
    }
  };

  const confirmBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const usersToDelete = selectedRows.map(row => row.original).filter(user => user.uid !== currentUser?.uid);
    
    if (usersToDelete.length === 0) {
      setDeleteDialogOpen(false);
      return;
    }

    try {
      const batch = writeBatch(db);
      usersToDelete.forEach(user => {
        const userDocRef = doc(db, 'users', user.id);
        batch.delete(userDocRef);
      });
      await batch.commit();

      toast({ title: `${usersToDelete.length} Pengguna Dihapus`, description: "Pengguna yang dipilih telah berhasil dihapus." });
      fetchUsers();
      table.resetRowSelection();
    } catch (error) {
      toast({ title: "Gagal Menghapus", description: "Terjadi kesalahan saat menghapus pengguna.", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setBulkAction(null);
    }
  };

  const confirmBulkBlockUnblock = async () => {
    if (!bulkAction || (bulkAction !== 'block' && bulkAction !== 'unblock')) return;

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const usersToUpdate = selectedRows.map(row => row.original).filter(user => user.uid !== currentUser?.uid);

    if (usersToUpdate.length === 0) {
      setBlockUnblockDialogOpen(false);
      return;
    }

    const newStatus = bulkAction === 'block' ? 'Diblokir' : 'Aktif';

    try {
      const batch = writeBatch(db);
      usersToUpdate.forEach(user => {
        const userDocRef = doc(db, 'users', user.id);
        batch.update(userDocRef, { status: newStatus });
      });
      await batch.commit();

      toast({ title: `Status ${usersToUpdate.length} Pengguna Diperbarui`, description: `Pengguna yang dipilih telah ${newStatus === 'Diblokir' ? 'diblokir' : 'diaktifkan'}.` });
      fetchUsers();
      table.resetRowSelection();
    } catch (error) {
      toast({ title: "Gagal Memperbarui Status", description: "Terjadi kesalahan saat memperbarui status.", variant: "destructive" });
    } finally {
      setBlockUnblockDialogOpen(false);
      setBulkAction(null);
    }
  };
  
  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          disabled={row.original.uid === currentUser?.uid}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'fullName',
      header: 'Nama',
      cell: ({ row }) => {
        const user = row.original;
        const presence = presenceData[user.uid];
        const isOnline = presence?.state === 'online';

        return (
            <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", isOnline ? 'bg-green-500' : 'bg-slate-400')} />
                <div className="font-medium">{row.getValue('fullName')}</div>
            </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Peran',
      cell: ({ row }) => {
        const role = row.getValue('role') as UserRole;
        return <Badge variant={roleBadgeVariant[role?.toLowerCase()] || 'secondary'}>{role}</Badge>;
      },
       filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as UserStatus;
        return (
          <Badge variant={statusBadgeVariant[status] || 'default'} className={cn(status === 'Aktif' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30', 'border')}>
            {status || 'Aktif'}
          </Badge>
        );
      },
       filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: 'lastOnline',
      header: 'Terakhir Online',
      cell: ({ row }) => {
        const presence = presenceData[row.original.uid];
        if (presence?.state === 'online') {
            return <span className="text-green-600 font-semibold text-xs">Online</span>
        }
        if (presence?.last_changed) {
            return <span className="text-muted-foreground text-xs">{formatDistanceToNow(new Date(presence.last_changed), { addSuffix: true, locale: indonesiaLocale })}</span>;
        }
        return <span className="text-muted-foreground text-xs">-</span>;
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        const isCurrentUser = user.uid === currentUser?.uid;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(user)} disabled={isCurrentUser}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
               {(user.status === 'Aktif' || !user.status) ? (
                  <DropdownMenuItem onClick={() => handleBlockUnblock(user, 'block')} disabled={isCurrentUser}>
                    <Ban className="mr-2 h-4 w-4" />
                    Blokir
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleBlockUnblock(user, 'unblock')} disabled={isCurrentUser}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Buka Blokir
                  </DropdownMenuItem>
                )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(user)} className="text-destructive focus:text-destructive" disabled={isCurrentUser}>
                 <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const isLoading = isLoadingUser || isDataLoading || isLoadingRoles;
  const numSelected = Object.keys(rowSelection).length;

  return (
    <div className="space-y-4">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-2 w-full">
            <Input
              placeholder="Cari pengguna..."
              value={(table.getColumn('fullName')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('fullName')?.setFilterValue(event.target.value)
              }
              className="max-w-xs w-full"
            />
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Status <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuLabel>Filter status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {['Aktif', 'Diblokir'].map(status => {
                     const statusFilter: string[] = table.getColumn('status')?.getFilterValue() as any || [];
                     return (
                        <DropdownMenuCheckboxItem
                            key={status}
                            checked={statusFilter.includes(status)}
                            onCheckedChange={(checked) => {
                                const currentFilter = statusFilter || [];
                                const newFilter = checked
                                ? [...currentFilter, status]
                                : currentFilter.filter(s => s !== status);
                                table.getColumn('status')?.setFilterValue(newFilter.length ? newFilter : undefined);
                            }}
                        >
                           {status}
                        </DropdownMenuCheckboxItem>
                     )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Peran <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuLabel>Filter peran</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {roles.map(role => {
                     const roleFilter: string[] = table.getColumn('role')?.getFilterValue() as any || [];
                     return (
                        <DropdownMenuCheckboxItem
                            key={role.id}
                            checked={roleFilter.includes(role.name)}
                            onCheckedChange={(checked) => {
                                const currentFilter = roleFilter || [];
                                const newFilter = checked
                                ? [...currentFilter, role.name]
                                : currentFilter.filter(r => r !== role.name);
                                table.getColumn('role')?.setFilterValue(newFilter.length ? newFilter : undefined);
                            }}
                        >
                           {role.name}
                        </DropdownMenuCheckboxItem>
                     )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Pengguna
            </Button>
          </div>
        </div>

        {numSelected > 0 && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
             <span className="text-sm font-semibold pl-2">{numSelected} dipilih</span>
             <Button variant="outline" size="sm" onClick={() => handleBulkBlockUnblock('unblock')}><CheckCircle className="mr-2 h-4 w-4" />Aktifkan</Button>
             <Button variant="outline" size="sm" onClick={() => handleBulkBlockUnblock('block')}><Ban className="mr-2 h-4 w-4" />Blokir</Button>
             <Button variant="destructive" size="sm" onClick={handleBulkDelete}><Trash2 className="mr-2 h-4 w-4" />Hapus</Button>
          </div>
        )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="mt-2 text-sm">Memuat pengguna...</p>
                    </TableCell>
                </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada pengguna ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari{' '}
          {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
        <div className="flex items-center space-x-2">
           <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Selanjutnya
          </Button>
        </div>
      </div>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" value={editedUserData?.fullName || ''} onChange={(e) => setEditedUserData(prev => ({...prev, fullName: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={editedUserData?.email || ''} onChange={(e) => setEditedUserData(prev => ({...prev, email: e.target.value}))} disabled={!!selectedUser} />
              </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="role">Peran</Label>
                <Select value={editedUserData?.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                        <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEditDialogOpen(false)}>Batal</Button>
            <Button type="submit" onClick={handleSaveUser}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
               Tindakan ini tidak dapat dibatalkan. Ini akan menghapus {numSelected > 0 ? `${numSelected} pengguna` : `pengguna ${selectedUser?.fullName}`} secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={numSelected > 0 ? confirmBulkDelete : confirmSingleDelete}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={isBlockUnblockDialogOpen} onOpenChange={setBlockUnblockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Aksi</AlertDialogTitle>
            <AlertDialogDescription>
                Anda yakin ingin {bulkAction === 'block' ? 'memblokir' : 'membuka blokir'} {numSelected > 0 ? `${numSelected} pengguna` : `pengguna ${selectedUser?.fullName}`}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkAction(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkBlockUnblock}>Ya, Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

