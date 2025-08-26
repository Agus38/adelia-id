
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Receipt, X, Copy, Bolt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';


type TransactionStatus = 'Berhasil' | 'Gagal' | 'Menunggu';

type Transaction = {
  id: string;
  date: Date;
  product: string;
  customerId: string;
  customerName: string;
  price: number;
  status: TransactionStatus;
  paymentMethod: string;
  sn?: string;
};

const mockTransactions: Transaction[] = [
  { id: 'PLN123', date: new Date('2024-07-24T12:00:00'), product: 'Token Listrik 50.000', customerId: '51234567890', customerName: 'JANE DOE', price: 50000, status: 'Berhasil', paymentMethod: 'Saldo Aplikasi', sn: '1234-5678-9012-3456-7890' },
  { id: 'PLN124', date: new Date('2024-07-23T18:00:00'), product: 'Token Listrik 20.000', customerId: '50987654321', customerName: 'JOHN SMITH', price: 20000, status: 'Berhasil', paymentMethod: 'Saldo Aplikasi', sn: '0987-6543-2109-8765-4321' },
];

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const statusVariant: Record<TransactionStatus, 'default' | 'destructive' | 'secondary'> = {
    'Berhasil': 'default',
    'Gagal': 'destructive',
    'Menunggu': 'secondary'
}

export function TransactionHistoryTokenListrik() {
  const [isDetailOpen, setDetailOpen] = React.useState(false);
  const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null);
  const { toast } = useToast();

  const handleRowClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setDetailOpen(true);
  };
  
  const handleCopySn = (sn: string) => {
    navigator.clipboard.writeText(sn);
    toast({
        title: "Token Berhasil Disalin!",
        description: "Token listrik telah disalin ke clipboard Anda.",
    });
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
             <History className="h-6 w-6 text-muted-foreground" />
            <div>
                <CardTitle>Riwayat Transaksi</CardTitle>
                <CardDescription>Daftar semua transaksi token listrik Anda.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-2 py-3 text-xs md:px-4">Tanggal</TableHead>
                <TableHead className="px-2 py-3 text-xs md:px-4">Keterangan</TableHead>
                <TableHead className="text-right px-2 py-3 text-xs md:px-4">Jumlah</TableHead>
                <TableHead className="text-center px-2 py-3 text-xs md:px-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.length > 0 ? mockTransactions.map((tx) => (
                <TableRow key={tx.id} onClick={() => handleRowClick(tx)} className="cursor-pointer">
                  <TableCell className="px-2 py-2 text-[11px] text-muted-foreground md:px-4 md:text-sm">
                    {format(tx.date, 'd MMM, HH:mm', { locale: id })}
                  </TableCell>
                  <TableCell className="px-2 py-2 md:px-4">
                    <p className="font-medium text-xs md:text-sm">{tx.product}</p>
                    <p className="text-[11px] text-muted-foreground">ID: {tx.customerId}</p>
                  </TableCell>
                  <TableCell className="text-right font-medium px-2 py-2 text-xs md:px-4 md:text-sm">{formatCurrency(tx.price)}</TableCell>
                  <TableCell className="text-center px-2 py-2 md:px-4">
                    <Badge variant={statusVariant[tx.status]} className={cn(
                        'text-[10px] px-1.5 py-0.5 md:text-xs md:px-2.5',
                        tx.status === 'Berhasil' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                        tx.status === 'Gagal' && 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
                        'border-none'
                    )}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Belum ada riwayat transaksi.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <Sheet open={isDetailOpen} onOpenChange={setDetailOpen}>
      <SheetContent side="bottom" className="rounded-t-lg max-h-[80vh]">
        <SheetHeader className="text-left">
          <SheetTitle>Detail Transaksi Token Listrik</SheetTitle>
          <SheetDescription>
              ID Transaksi: {selectedTx?.id}
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto py-4">
            {selectedTx && (
              <div className="space-y-4 pt-2">
                  <div className="p-4 space-y-3 rounded-lg border text-sm">
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant={statusVariant[selectedTx.status]} className={cn(
                              selectedTx.status === 'Berhasil' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                              selectedTx.status === 'Gagal' && 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
                              'border-none'
                          )}>
                              {selectedTx.status}
                          </Badge>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Tanggal</span>
                          <span className="font-medium">{format(selectedTx.date, 'd MMM yyyy, HH:mm', { locale: id })}</span>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <p className="text-sm font-semibold">Rincian Pembelian</p>
                      <Separator/>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                              <span className="text-muted-foreground">ID Pelanggan</span>
                              <span className="font-medium">{selectedTx.customerId}</span>
                          </div>
                           <div className="flex justify-between">
                              <span className="text-muted-foreground">Nama Pelanggan</span>
                              <span className="font-medium">{selectedTx.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-muted-foreground">Produk</span>
                              <span className="font-medium">{selectedTx.product}</span>
                          </div>
                      </div>
                  </div>
                  
                   {selectedTx.sn && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Token</p>
                      <Separator/>
                       <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                            <span className="font-mono font-bold text-base md:text-lg tracking-wider">{selectedTx.sn}</span>
                             <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleCopySn(selectedTx.sn!)}>
                                <Copy className="h-4 w-4" />
                             </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                      <p className="text-sm font-semibold">Rincian Pembayaran</p>
                      <Separator/>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                              <span className="text-muted-foreground">Metode Pembayaran</span>
                              <span className="font-medium">{selectedTx.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Harga</span>
                              <span className="font-medium">{formatCurrency(selectedTx.price)}</span>
                          </div>
                      </div>
                  </div>
              </div>
            )}
        </div>
        <SheetFooter className="grid grid-cols-1 pt-4">
          <Button variant="outline" onClick={() => setDetailOpen(false)}>
              <X className="mr-2 h-4 w-4"/> Tutup
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
    </>
  );
}
