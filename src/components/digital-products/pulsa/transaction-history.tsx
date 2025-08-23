
'use client';

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
import { History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type TransactionStatus = 'Berhasil' | 'Gagal' | 'Menunggu';

type Transaction = {
  id: string;
  date: Date;
  product: string;
  phoneNumber: string;
  price: number;
  status: TransactionStatus;
};

const mockTransactions: Transaction[] = [
  { id: 'TRX123', date: new Date('2024-07-24T10:30:00'), product: 'Telkomsel 10.000', phoneNumber: '081234567890', price: 10500, status: 'Berhasil' },
  { id: 'TRX124', date: new Date('2024-07-23T15:00:00'), product: 'XL 25.000', phoneNumber: '087812345678', price: 25100, status: 'Berhasil' },
  { id: 'TRX125', date: new Date('2024-07-22T08:45:00'), product: 'Indosat 5.000', phoneNumber: '085787654321', price: 5800, status: 'Gagal' },
  { id: 'TRX126', date: new Date('2024-07-21T19:20:00'), product: 'Telkomsel 50.000', phoneNumber: '081234567890', price: 50000, status: 'Berhasil' },
  { id: 'TRX127', date: new Date('2024-07-20T11:10:00'), product: 'Tri 10.000', phoneNumber: '089611223344', price: 10900, status: 'Menunggu' },
];

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const statusVariant: Record<TransactionStatus, 'default' | 'destructive' | 'secondary'> = {
    'Berhasil': 'default',
    'Gagal': 'destructive',
    'Menunggu': 'secondary'
}

export function TransactionHistory() {
  return (
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
                <TableRow key={tx.id}>
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
  );
}
