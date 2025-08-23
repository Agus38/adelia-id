
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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  ChevronDown,
  PlusCircle,
  Eye,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
} from 'lucide-react';
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
import { getReports, deleteReport, listeners } from '@/lib/report-store';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import Link from 'next/link';
import { Separator } from '../ui/separator';

export interface DailyReport {
  id: string;
  date: Date;
  shift: 'pagi' | 'sore';
  omsetBersih: number;
  totalSetor: number;
  createdBy: string;
  details: {
    modalAwal: number;
    pajak: number;
    pemasukan: { name: string; value: number }[];
    pengeluaran: { name: string; value: number }[];
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

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

  const totalOmsetBersih = React.useMemo(() => data.reduce((sum, report) => sum + report.omsetBersih, 0), [data]);
  const totalPajak = React.useMemo(() => data.reduce((sum, report) => sum + report.details.pajak, 0), [data]);
  const totalOmsetKotor = totalOmsetBersih + totalPajak;
  const totalPengeluaran = React.useMemo(() => data.reduce((sum, report) => sum + report.details.pengeluaran.reduce((subSum, item) => subSum + item.value, 0), 0), [data]);
  
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
        {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan Bersih</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOmsetBersih)}</div>
            <p className="text-xs text-muted-foreground">Dari semua laporan yang tersimpan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan Kotor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOmsetKotor)}</div>
             <p className="text-xs text-muted-foreground">Termasuk pajak</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pajak</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPajak)}</div>
            <p className="text-xs text-muted-foreground">Dari semua laporan yang tersimpan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran Offline</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPengeluaran)}</div>
            <p className="text-xs text-muted-foreground">Dari semua laporan yang tersimpan</p>
          </CardContent>
        </Card>
      </div>

       <div className="flex items-center justify-between pt-4">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Cari berdasarkan ID atau pembuat..."
              value={(table.getColumn('id')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('id')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
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
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Detail Laporan: {selectedReport?.id}</DialogTitle>
                <DialogDescription>
                    Informasi lengkap untuk laporan yang dibuat oleh {selectedReport?.createdBy} pada <ClientDate date={selectedReport?.date || new Date()} /> (Shift {selectedReport?.shift}).
                </DialogDescription>
            </DialogHeader>
            {selectedReport && (
                <div className="space-y-6 pt-4 max-h-[60vh] overflow-y-auto pr-4">
                    {/* Financial Summary */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-base">Ringkasan Finansial</h3>
                         <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm p-4 border rounded-lg">
                            <div className="text-muted-foreground">Omset Bersih:</div>
                            <div className="font-semibold text-right">{formatCurrency(selectedReport.omsetBersih)}</div>
                             <div className="text-muted-foreground">Modal Awal:</div>
                            <div className="font-semibold text-right">{formatCurrency(selectedReport.details.modalAwal)}</div>
                             <div className="text-muted-foreground">Pajak:</div>
                            <div className="font-semibold text-right">{formatCurrency(selectedReport.details.pajak)}</div>
                            <Separator className="col-span-2 my-1"/>
                             <div className="text-muted-foreground font-bold">Total Setor:</div>
                            <div className="font-bold text-lg text-right">{formatCurrency(selectedReport.totalSetor)}</div>
                        </div>
                    </div>

                     {/* Income Details */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-base">Rincian Pemasukan Online</h3>
                        <div className="p-4 border rounded-lg">
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Sumber</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedReport.details.pemasukan.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.name || '-'}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.value)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted hover:bg-muted font-bold">
                                         <TableCell>Total Pemasukan</TableCell>
                                         <TableCell className="text-right">{formatCurrency(selectedReport.details.pemasukan.reduce((sum, item) => sum + item.value, 0))}</TableCell>
                                    </TableRow>
                                </TableBody>
                           </Table>
                        </div>
                    </div>
                    
                     {/* Expense Details */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-base">Rincian Pengeluaran Offline</h3>
                        <div className="p-4 border rounded-lg">
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                     {selectedReport.details.pengeluaran.length > 0 ? (
                                        <>
                                            {selectedReport.details.pengeluaran.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.name || '-'}</TableCell>
                                                    <TableCell className="text-right font-medium">{formatCurrency(item.value)}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="bg-muted hover:bg-muted font-bold">
                                                <TableCell>Total Pengeluaran</TableCell>
                                                <TableCell className="text-right">{formatCurrency(selectedReport.details.pengeluaran.reduce((sum, item) => sum + item.value, 0))}</TableCell>
                                            </TableRow>
                                        </>
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground">Tidak ada pengeluaran.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                           </Table>
                        </div>
                    </div>
                </div>
            )}
            <DialogFooter className="pt-4 border-t">
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
