
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
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useUserStore } from '@/lib/user-store';
import { RoleManagement } from './role-management';
import { useRolesConfig, type Role } from '@/lib/menu-store';

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

const roleBadgeVariant: { [key in string]: 'destructive' | 'secondary' | 'default' } = {
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
  const { roles, isLoading: isLoadingRoles } = useRolesConfig();
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  // Dialog states
  const [isAddEditDialogOpen, setAddEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isBlockDialogOpen, setBlockDialogOpen] = React.useState(false);
  const [isUnblockDialogOpen, setUnblockDialogOpen] = React.useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = React.useState(false);
  const [isRoleManagementOpen, setRoleManagementOpen] = React.useState(false);
  
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editedUserData, setEditedUserData] = React.useState<Partial<User>>({});

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

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };
  
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

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await deleteDoc(doc(db, 'users', selectedUser.id));
        toast({ title: "Pengguna Dihapus", description: `Pengguna ${selectedUser.fullName} telah dihapus.` });
        fetchUsers();
      } catch (error) {
        toast({ title: "Error", description: "Gagal menghapus pengguna.", variant: "destructive" });
      }
    }
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const confirmBlock = async () => {
    if (selectedUser) {
       try {
        const userDocRef = doc(db, 'users', selectedUser.id);
        await updateDoc(userDocRef, { status: 'Diblokir' });
        toast({ title: "Pengguna Diblokir", description: `${selectedUser.fullName} telah diblokir.` });
        fetchUsers();
      } catch (error) {
         toast({ title: "Error", description: "Gagal memblokir pengguna.", variant: "destructive" });
      }
    }
    setBlockDialogOpen(false);
    setSelectedUser(null);
  }

  const confirmUnblock = async () => {
    if (selectedUser) {
       try {
        const userDocRef = doc(db, 'users', selectedUser.id);
        await updateDoc(userDocRef, { status: 'Aktif' });
        toast({ title: "Blokir Dibuka", description: `Blokir untuk ${selectedUser.fullName} telah dibuka.` });
        fetchUsers();
      } catch (error) {
        toast({ title: "Error", description: "Gagal membuka blokir pengguna.", variant: "destructive" });
      }
    }
    setUnblockDialogOpen(false);
    setSelectedUser(null);
  }

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
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'fullName',
      header: 'Nama',
      cell: ({ row }) => <div className="font-medium">{row.getValue('fullName')}</div>,
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
      accessorKey: 'createdAt',
      header: 'Tanggal Bergabung',
      cell: ({ row }) => {
        const date = row.original.createdAt?.toDate();
        return date ? new Intl.DateTimeFormat('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}).format(date) : '-';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
               {(user.status === 'Aktif' || !user.status) ? (
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

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Cari pengguna berdasarkan nama..."
              value={(table.getColumn('fullName')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('fullName')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
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
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={() => setRoleManagementOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Kelola Peran
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Kolom <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id === "fullName" ? "Nama" : column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Pengguna
            </Button>
          </div>
        </div>
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


      {/* Dialogs */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
            <DialogDescription>
              {selectedUser
                ? 'Ubah detail pengguna dan peran di bawah ini.'
                : 'Isi formulir untuk menambahkan pengguna baru. Pengguna harus tetap mendaftar sendiri.'}
            </DialogDescription>
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
      
      <Dialog open={isDetailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Detail Pengguna: {selectedUser?.fullName}</DialogTitle>
                <DialogDescription>
                    Informasi lengkap untuk pengguna yang dipilih.
                </DialogDescription>
            </DialogHeader>
            {selectedUser && (
                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <p className="text-muted-foreground col-span-1">User ID:</p>
                        <p className="font-semibold col-span-2 truncate">{selectedUser.uid}</p>

                        <p className="text-muted-foreground col-span-1">Nama:</p>
                        <p className="font-semibold col-span-2">{selectedUser.fullName}</p>

                        <p className="text-muted-foreground col-span-1">Email:</p>
                        <p className="font-semibold col-span-2">{selectedUser.email}</p>

                        <p className="text-muted-foreground col-span-1">Peran:</p>
                        <div className="col-span-2"><Badge variant={roleBadgeVariant[selectedUser.role?.toLowerCase()] || 'secondary'}>{selectedUser.role}</Badge></div>
                        
                        <p className="text-muted-foreground col-span-1">Status:</p>
                        <div className="col-span-2">
                           <Badge variant={statusBadgeVariant[selectedUser.status || 'Aktif']} className={cn((selectedUser.status || 'Aktif') === 'Aktif' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30', 'border')}>
                             {selectedUser.status || 'Aktif'}
                           </Badge>
                        </div>

                         <p className="text-muted-foreground col-span-1">Bergabung:</p>
                        <p className="font-semibold col-span-2">{selectedUser.createdAt?.toDate ? new Intl.DateTimeFormat('id-ID').format(selectedUser.createdAt.toDate()) : '-'}</p>
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>
                    Tutup
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isRoleManagementOpen} onOpenChange={setRoleManagementOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Kelola Peran</DialogTitle>
              <DialogDescription>Tambah, edit, atau hapus peran yang tersedia untuk pengguna.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <RoleManagement />
            </div>
          </DialogContent>
        </Dialog>


      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data pengguna dari Firestore, tetapi tidak dari Firebase Authentication.
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
            <AlertDialogTitle>Blokir Pengguna: {selectedUser?.fullName}?</AlertDialogTitle>
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
            <AlertDialogTitle>Buka Blokir Pengguna: {selectedUser?.fullName}?</AlertDialogTitle>
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
