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
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2, ArrowUpCircle, ArrowDownCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useBudgetflowStore, type Transaction, deleteTransaction } from '@/lib/budgetflow-store';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export function TransactionsView() {
  const { transactions, loading } = useBudgetflowStore();
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'date', desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [transactionToDelete, setTransactionToDelete] = React.useState<Transaction | null>(null);

  const handleDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
        await deleteTransaction(transactionToDelete.id);
        toast({ title: 'Transaksi Dihapus' });
    } catch (error) {
        toast({ title: 'Gagal Menghapus', variant: 'destructive'});
    }
    setDeleteDialogOpen(false);
  }

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            {row.original.type === 'income' 
                ? <ArrowUpCircle className="h-5 w-5 text-green-500 shrink-0"/> 
                : <ArrowDownCircle className="h-5 w-5 text-red-500 shrink-0"/>
            }
            <div>
              <div className="font-medium">{row.getValue('description')}</div>
              <div className="text-xs text-muted-foreground">{row.original.category}</div>
            </div>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Jumlah</div>,
      cell: ({ row }) => (
        <div className={cn("text-right font-medium", row.original.type === 'income' ? 'text-green-600' : 'text-red-600')}>
            {row.original.type === 'expense' && '- '}
            {formatCurrency(row.getValue('amount'))}
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Tanggal',
      cell: ({ row }) => {
        const date = row.original.date;
        const formattedDate = date instanceof Date ? date : date.toDate();
        return <div>{format(formattedDate, 'd MMM yyyy', { locale: id })}</div>;
      },
    },
    {
        id: 'actions',
        cell: ({ row }) => (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem disabled><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Hapus</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
        ),
    }
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Cari deskripsi..."
          value={(table.getColumn('description')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('description')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></TableCell></TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada hasil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
                    <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan. Transaksi akan dihapus permanen.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>Hapus</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}
