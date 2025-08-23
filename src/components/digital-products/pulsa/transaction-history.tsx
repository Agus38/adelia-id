
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
import { History, Receipt, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';


type TransactionStatus = 'Berhasil' | 'Gagal' | 'Menunggu';

type Transaction = {
  id: string;
  date: Date;
  product: string;
  phoneNumber: string;
  price: number;
  status: TransactionStatus;
  paymentMethod: string;
};

const mockTransactions: Transaction[] = [
  { id: 'TRX123', date: new Date('2024-07-24T10:30:00'), product: 'Telkomsel 10.000', phoneNumber: '081234567890', price: 10500, status: 'Berhasil', paymentMethod: 'Saldo Aplikasi' },
  { id: 'TRX124', date: new Date('2024-07-23T15:00:00'), product: 'XL 25.000', phoneNumber: '087812345678', price: 25100, status: 'Berhasil', paymentMethod: 'Saldo Aplikasi' },
  { id: 'TRX125', date: new Date('2024-07-22T08:45:00'), product: 'Indosat 5.000', phoneNumber: '085787654321', price: 5800, status: 'Gagal', paymentMethod: 'Saldo Aplikasi' },
  { id: 'TRX126', date: new Date('2024-07-21T19:20:00'), product: 'Telkomsel 50.000', phoneNumber: '081234567890', price: 50000, status: 'Berhasil', paymentMethod: 'Saldo Aplikasi' },
  { id: 'TRX127', date: new Date('2024-07-20T11:10:00'), product: 'Tri 10.000', phoneNumber: '089611223344', price: 10900, status: 'Menunggu', paymentMethod: 'Saldo Aplikasi' },
];

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const statusVariant: Record<TransactionStatus, 'default' | 'destructive' | 'secondary'> = {
    'Berhasil': 'default',
    'Gagal': 'destructive',
    'Menunggu': 'secondary'
}

export function TransactionHistory() {
  const [isDetailOpen, setDetailOpen] = React.useState(false);
  const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null);

  const handleRowClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setDetailOpen(true);
  };


  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
             <History className="h-6 w-6 text-muted-foreground" />
            <div>
                <CardTitle>Riwayat Transaksi</CardTitle>
                <CardDescription>Daftar semua transaksi pulsa Anda.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.length > 0 ? mockTransactions.map((tx) => (
                <TableRow key={tx.id} onClick={() => handleRowClick(tx)} className="cursor-pointer">
                  <TableCell className="text-xs text-muted-foreground">
                    {format(tx.date, 'd MMM yyyy, HH:mm', { locale: id })}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{tx.product}</p>
                    <p className="text-xs text-muted-foreground">{tx.phoneNumber}</p>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(tx.price)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusVariant[tx.status]} className={cn(
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

     <Dialog open={isDetailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>
                ID Transaksi: {selectedTx?.id}
            </DialogDescription>
          </DialogHeader>
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
                            <span className="text-muted-foreground">Produk</span>
                            <span className="font-medium">{selectedTx.product}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Nomor Tujuan</span>
                            <span className="font-medium">{selectedTx.phoneNumber}</span>
                        </div>
                    </div>
                </div>

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
                            <span className="font-bold text-base text-primary">{formatCurrency(selectedTx.price)}</span>
                        </div>
                    </div>
                </div>
            </div>
          )}
          <DialogFooter className="grid grid-cols-2 gap-2 pt-4">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
                <X className="mr-2 h-4 w-4"/> Tutup
            </Button>
            <Button>
                <Receipt className="mr-2 h-4 w-4"/> Cetak Struk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
