
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  const [editablePrice, setEditablePrice] = React.useState('');

  const handleRowClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setEditablePrice(tx.price.toString());
    setDetailOpen(true);
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '');
      setEditablePrice(value);
  }

  const handlePrintReceipt = () => {
    if (!selectedTx) return;

    const finalPrice = Number(editablePrice) || selectedTx.price;

    const receiptContent = `
        <html>
            <head>
                <title>Struk Transaksi ${selectedTx.id}</title>
                <style>
                    body { font-family: 'sans-serif'; margin: 0; padding: 20px; color: #333; font-size: 14px; }
                    .container { max-width: 320px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px; }
                    h2 { text-align: center; margin-top: 0; margin-bottom: 10px; font-size: 1.2rem; }
                    p { text-align: center; margin: 0; font-size: 0.8rem; color: #777; }
                    hr { border: none; border-top: 1px dashed #ccc; margin: 20px 0; }
                    table { width: 100%; border-collapse: collapse; }
                    td { padding: 5px 0; }
                    .label { color: #555; }
                    .value { text-align: right; font-weight: 500; }
                    .total .value { font-weight: bold; font-size: 1.1rem; }
                    .footer { text-align: center; margin-top: 20px; font-size: 0.8rem; color: #999; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Struk Pembelian</h2>
                    <p>Adelia-ID</p>
                    <hr>
                    <table>
                        <tr><td class="label">ID Transaksi</td><td class="value">${selectedTx.id}</td></tr>
                        <tr><td class="label">Tanggal</td><td class="value">${format(selectedTx.date, 'd MMM yyyy, HH:mm', { locale: id })}</td></tr>
                    </table>
                    <hr>
                    <table>
                        <tr><td class="label">Produk</td><td class="value">${selectedTx.product}</td></tr>
                        <tr><td class="label">No. Tujuan</td><td class="value">${selectedTx.phoneNumber}</td></tr>
                    </table>
                    <hr>
                     <table>
                        <tr class="total"><td class="label">TOTAL</td><td class="value">${formatCurrency(finalPrice)}</td></tr>
                    </table>
                    <hr>
                    <p class="footer">Terima kasih telah bertransaksi!</p>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 100);
                    }
                <\/script>
            </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(receiptContent);
    printWindow?.document.close();
  }

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
                    <p className="text-[11px] text-muted-foreground">{tx.phoneNumber}</p>
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
          <SheetTitle>Detail Transaksi</SheetTitle>
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
                              <span className="font-medium">{formatCurrency(selectedTx.price)}</span>
                          </div>
                      </div>
                  </div>
              </div>
            )}
        </div>
        <SheetFooter className="grid grid-cols-2 gap-2 pt-4">
          <Button variant="outline" onClick={() => setDetailOpen(false)}>
              <X className="mr-2 h-4 w-4"/> Tutup
          </Button>
          <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button disabled={selectedTx?.status !== 'Berhasil'}>
                      <Receipt className="mr-2 h-4 w-4"/> Cetak Struk
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Cetak Struk</AlertDialogTitle>
                      <AlertDialogDescription>
                          Anda dapat mengubah harga jual di bawah ini sebelum mencetak struk. Harga asli adalah {selectedTx ? formatCurrency(selectedTx.price) : ''}.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-2">
                    <Label htmlFor="editable-price">Harga Jual (Opsional)</Label>
                    <Input 
                        id="editable-price"
                        type="text"
                        inputMode="numeric"
                        placeholder="Masukkan harga jual baru"
                        value={editablePrice.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                        onChange={handlePriceChange}
                        className="mt-2 text-right font-bold"
                    />
                  </div>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePrintReceipt}>Cetak</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
    </>
  );
}
