
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
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  ChevronDown,
  PlusCircle,
  FileCheck,
  FileX,
  Eye,
  Trash2,
} from 'lucide-react';
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
import { Checkbox } from '../ui/checkbox';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getReports, deleteReport, updateReportStatus, listeners } from '@/lib/report-store';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import Link from 'next/link';

export type ReportStatus = 'pending' | 'approved' | 'rejected';

export interface DailyReport {
  id: string;
  date: Date;
  shift: 'pagi' | 'sore';
  omsetBersih: number;
  totalSetor: number;
  createdBy: string;
  status: ReportStatus;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const statusBadgeVariant = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
} as const;

const statusText = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
}

const ClientDate = ({ date }: { date: Date }) => {
  const [formattedDate, setFormattedDate] = React.useState('');
  React.useEffect(() => {
    setFormattedDate(format(date, 'd MMMM yyyy', { locale: id }));
  }, [date]);
  return <>{formattedDate}</>;
};

export function DailyReportManagement() {
  const [data, setData] = React.useState(() => getReports());

  React.useEffect(() => {
    const unsubscribe = listeners.subscribe(setData);
    return () => unsubscribe();
  }, []);


  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  const [isDetailModalOpen, setDetailModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [selectedReport, setSelectedReport] = React.useState<DailyReport | null>(null);

  const handleViewDetails = (report: DailyReport) => {
    setSelectedReport(report);
    setDetailModalOpen(true);
  };

  const handleChangeStatus = (id: string, status: ReportStatus) => {
    updateReportStatus(id, status);
  }

  const handleDeleteClick = (report: DailyReport) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  }

  const confirmDelete = () => {
    if(selectedReport) {
      deleteReport(selectedReport.id);
    }
    setDeleteDialogOpen(false);
  }
  
  const columns: ColumnDef<DailyReport>[] = [
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
    { accessorKey: 'id', header: 'ID Laporan' },
    {
      accessorKey: 'date',
      header: 'Tanggal',
      cell: ({ row }) => <ClientDate date={row.original.date} />,
    },
    { accessorKey: 'shift', header: 'Shift', cell: ({row}) => <span className="capitalize">{row.original.shift}</span> },
    {
      accessorKey: 'omsetBersih',
      header: 'Omset Bersih',
      cell: ({ row }) => formatCurrency(row.original.omsetBersih),
    },
    {
      accessorKey: 'totalSetor',
      header: 'Total Setor',
      cell: ({ row }) => formatCurrency(row.original.totalSetor),
    },
    { accessorKey: 'createdBy', header: 'Dibuat Oleh' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant[row.original.status]}>
          {statusText[row.original.status]}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const report = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDetails(report)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleChangeStatus(report.id, 'approved')}>
                <FileCheck className="mr-2 h-4 w-4" />
                Setujui
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeStatus(report.id, 'rejected')}>
                <FileX className="mr-2 h-4 w-4" />
                Tolak
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(report)}>
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
    data,
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
    <>
    <div className="space-y-4">
       <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Cari berdasarkan ID atau pembuat..."
              value={(table.getColumn('id')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('id')?.setFilterValue(event.target.value)
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
                 <DropdownMenuLabel>Filter berdasarkan status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {['pending', 'approved', 'rejected'].map(status => {
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
                           {statusText[status as ReportStatus]}
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
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild>
              <Link href="/laporan-smw-merr">
                 <PlusCircle className="mr-2 h-4 w-4" />
                 Tambah Laporan
              </Link>
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
    </div>

    <Dialog open={isDetailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Detail Laporan: {selectedReport?.id}</DialogTitle>
                <DialogDescription>
                    Informasi lengkap untuk laporan yang dipilih.
                </DialogDescription>
            </DialogHeader>
            {selectedReport && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-muted-foreground">ID Laporan:</p>
                        <p className="font-semibold">{selectedReport.id}</p>

                        <p className="text-muted-foreground">Tanggal:</p>
                        <p className="font-semibold"><ClientDate date={selectedReport.date} /></p>

                        <p className="text-muted-foreground">Shift:</p>
                        <p className="font-semibold capitalize">{selectedReport.shift}</p>

                        <p className="text-muted-foreground">Omset Bersih:</p>
                        <p className="font-semibold">{formatCurrency(selectedReport.omsetBersih)}</p>

                        <p className="text-muted-foreground">Total Setor:</p>
                        <p className="font-semibold">{formatCurrency(selectedReport.totalSetor)}</p>

                        <p className="text-muted-foreground">Dibuat Oleh:</p>
                        <p className="font-semibold">{selectedReport.createdBy}</p>

                        <p className="text-muted-foreground">Status:</p>
                        <Badge variant={statusBadgeVariant[selectedReport.status]}>
                            {statusText[selectedReport.status]}
                        </Badge>
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
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus laporan secara permanen dari daftar.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Lanjutkan</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
