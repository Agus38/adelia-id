
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
import { MoreHorizontal, PlusCircle, Ban, Trash2, Edit, CheckCircle, ChevronDown, Eye } from 'lucide-react';
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

type UserStatus = 'Aktif' | 'Diblokir';
type UserRole = 'Admin' | 'Pengguna' | 'Editor';

const initialUsers = [
  { id: 1, name: 'Adelia', email: 'adelia@example.com', role: 'Admin' as UserRole, joined: '2023-01-15', status: 'Aktif' as UserStatus },
  { id: 2, name: 'Budi', email: 'budi@example.com', role: 'Pengguna' as UserRole, joined: '2023-02-20', status: 'Aktif' as UserStatus },
  { id: 3, name: 'Citra', email: 'citra@example.com', role: 'Pengguna' as UserRole, joined: '2023-03-10', status: 'Aktif' as UserStatus },
  { id: 4, name: 'Dewi', email: 'dewi@example.com', role: 'Editor' as UserRole, joined: '2023-04-05', status: 'Diblokir' as UserStatus },
  { id: 5, name: 'Eka', email: 'eka@example.com', role: 'Pengguna' as UserRole, joined: '2023-05-21', status: 'Aktif' as UserStatus },
  { id: 6, name: 'Fajar', email: 'fajar@example.com', role: 'Pengguna' as UserRole, joined: '2023-06-12', status: 'Aktif' as UserStatus },
  { id: 7, name: 'Gita', email: 'gita@example.com', role: 'Admin' as UserRole, joined: '2023-07-01', status: 'Aktif' as UserStatus },
  { id: 8, name: 'Hadi', email: 'hadi@example.com', role: 'Editor' as UserRole, joined: '2023-08-18', status: 'Diblokir' as UserStatus },
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
  const [users, setUsers] = React.useState(initialUsers);
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
  
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

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

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
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
      accessorKey: 'name',
      header: 'Nama',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
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
        return <Badge variant={roleBadgeVariant[role]}>{role}</Badge>;
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
          <Badge variant={statusBadgeVariant[status]} className={cn(status === 'Aktif' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30', 'border')}>
            {status}
          </Badge>
        );
      },
       filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'joined',
      header: 'Tanggal Bergabung',
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

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Cari pengguna berdasarkan nama..."
              value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('name')?.setFilterValue(event.target.value)
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
                  {['Admin', 'Editor', 'Pengguna'].map(role => {
                     const roleFilter: string[] = table.getColumn('role')?.getFilterValue() as any || [];
                     return (
                        <DropdownMenuCheckboxItem
                            key={role}
                            checked={roleFilter.includes(role)}
                            onCheckedChange={(checked) => {
                                const currentFilter = roleFilter || [];
                                const newFilter = checked
                                ? [...currentFilter, role]
                                : currentFilter.filter(r => r !== role);
                                table.getColumn('role')?.setFilterValue(newFilter.length ? newFilter : undefined);
                            }}
                        >
                           {role}
                        </DropdownMenuCheckboxItem>
                     )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
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
                        {column.id === "name" ? "Nama" : column.id === "email" ? "Email" : column.id === "role" ? "Peran" : column.id === "status" ? "Status" : column.id === "joined" ? "Tanggal Bergabung" : column.id}
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
            {table.getRowModel().rows?.length ? (
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
                  Tidak ada hasil.
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
            <Button variant="outline" onClick={() => setAddEditDialogOpen(false)}>Batal</Button>
            <Button type="submit" onClick={() => setAddEditDialogOpen(false)}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDetailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Detail Pengguna: {selectedUser?.name}</DialogTitle>
                <DialogDescription>
                    Informasi lengkap untuk pengguna yang dipilih.
                </DialogDescription>
            </DialogHeader>
            {selectedUser && (
                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <p className="text-muted-foreground col-span-1">ID Pengguna:</p>
                        <p className="font-semibold col-span-2">{selectedUser.id}</p>

                        <p className="text-muted-foreground col-span-1">Nama:</p>
                        <p className="font-semibold col-span-2">{selectedUser.name}</p>

                        <p className="text-muted-foreground col-span-1">Email:</p>
                        <p className="font-semibold col-span-2">{selectedUser.email}</p>

                        <p className="text-muted-foreground col-span-1">Peran:</p>
                        <div className="col-span-2"><Badge variant={roleBadgeVariant[selectedUser.role]}>{selectedUser.role}</Badge></div>

                        <p className="text-muted-foreground col-span-1">Status:</p>
                        <div className="col-span-2">
                           <Badge variant={statusBadgeVariant[selectedUser.status]} className={cn(selectedUser.status === 'Aktif' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30', 'border')}>
                             {selectedUser.status}
                           </Badge>
                        </div>

                         <p className="text-muted-foreground col-span-1">Bergabung:</p>
                        <p className="font-semibold col-span-2">{selectedUser.joined}</p>
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
