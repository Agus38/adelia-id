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
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useBudgetflowStore } from '@/lib/budgetflow-store';

const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(Math.abs(value));

    return formatted;
}

export function RecentTransactionsTable() {
  const { transactions } = useBudgetflowStore();

  const recentTransactions = React.useMemo(() => {
    return [...transactions]
      .sort((a, b) => (b.date instanceof Date ? b.date.getTime() : b.date.toMillis()) - (a.date instanceof Date ? a.date.getTime() : a.date.toMillis()))
      .slice(0, 5);
  }, [transactions]);
  
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
          {recentTransactions.map((tx) => (
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
                      {format(tx.date instanceof Date ? tx.date : tx.date.toDate(), 'd MMM yyyy', { locale: id })} &bull; {tx.category}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className={cn(
                  "text-right font-semibold",
                  tx.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
              )}>
                {tx.type === 'expense' && '- '}
                {formatCurrency(tx.amount)}
              </TableCell>
            </TableRow>
          ))}
          {recentTransactions.length === 0 && (
            <TableRow>
                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                    Belum ada transaksi.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
