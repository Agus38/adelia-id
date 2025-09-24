
'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import { Loader2, Info } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type AgeCalculation = {
  id: string;
  dateOfBirth: Date;
  calculatedAt: Date;
  expiresAt: Date;
};

export function AgeCalculationManagement() {
  const [data, setData] = React.useState<AgeCalculation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'calculatedAt', desc: true }
  ]);
  const { toast } = useToast();

  React.useEffect(() => {
    const q = query(collection(db, "ageCalculations"), orderBy("calculatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const calculations: AgeCalculation[] = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        calculations.push({
          id: doc.id,
          dateOfBirth: docData.dateOfBirth.toDate(),
          calculatedAt: docData.calculatedAt.toDate(),
          expiresAt: docData.expiresAt.toDate(),
        });
      });
      setData(calculations);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching age calculations: ", error);
      toast({
        title: "Gagal Memuat Data",
        description: "Tidak dapat mengambil data dari database.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);
  
  const columns: ColumnDef<AgeCalculation>[] = [
    {
      accessorKey: 'dateOfBirth',
      header: 'Tanggal Lahir',
      cell: ({ row }) => format(row.original.dateOfBirth, 'd MMMM yyyy', { locale: id }),
    },
    {
      accessorKey: 'calculatedAt',
      header: 'Waktu Kalkulasi',
      cell: ({ row }) => format(row.original.calculatedAt, 'd MMM yyyy, HH:mm', { locale: id }),
    },
    {
      accessorKey: 'expiresAt',
      header: 'Waktu Hapus',
       cell: ({ row }) => format(row.original.expiresAt, 'd MMM yyyy, HH:mm', { locale: id }),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Penting: Pengaturan TTL (Time-to-Live)</AlertTitle>
          <AlertDescription>
              Agar data terhapus otomatis, Anda perlu mengaktifkan kebijakan TTL di Firebase Console. Buka Firestore {'>'} TTL, lalu buat kebijakan untuk koleksi `ageCalculations` pada field `expiresAt`.
          </AlertDescription>
       </Alert>
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
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground mt-2">Memuat data...</p>
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
                  Tidak ada data.
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
    </div>
  );
}

    