'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type Transaction = {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
};

const mockTransactions: Transaction[] = [
  { id: 'tx1', date: new Date(), description: 'Gaji Bulanan', category: 'Gaji', amount: 7500000, type: 'income' },
  { id: 'tx2', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), description: 'Makan siang di warteg', category: 'Makanan', amount: -25000, type: 'expense' },
  { id: 'tx3', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), description: 'Langganan Netflix', category: 'Hiburan', amount: -186000, type: 'expense' },
  { id: 'tx4', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), description: 'Bonus Proyek', category: 'Bonus', amount: 1000000, type: 'income' },
  { id: 'tx5', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), description: 'Beli Bensin Pertamax', category: 'Transportasi', amount: -150000, type: 'expense' },
];

const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(Math.abs(value));

    return value < 0 ? `- ${formatted}` : formatted;
}

export function RecentTransactionsTable() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keterangan</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTransactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {tx.type === 'income' ? (
                    <ArrowUpCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(tx.date, 'd MMM yyyy', { locale: id })} &bull; {tx.category}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className={cn(
                  "text-right font-semibold",
                  tx.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
              )}>
                {formatCurrency(tx.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
