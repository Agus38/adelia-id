
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
import { Loader2, Eye, ArrowUpCircle, ArrowDownCircle, Target, Scale } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import type { Transaction, Goal, Debt } from '@/lib/budgetflow-store';

interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

interface UserFinancials {
  transactions: Transaction[];
  goals: Goal[];
  debts: Debt[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
const formatDate = (date: Date | Timestamp) => {
    const d = date instanceof Date ? date : date.toDate();
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
}


function UserFinancialsDetail({ user, financials }: { user: User, financials: UserFinancials }) {
    if (!financials) return null;

    const { transactions, goals, debts } = financials;

    return (
        <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transactions">Transaksi</TabsTrigger>
                <TabsTrigger value="goals">Target Tabungan</TabsTrigger>
                <TabsTrigger value="debts">Hutang/Piutang</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Transaksi</CardTitle>
                        <CardDescription>Total {transactions.length} transaksi ditemukan.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length > 0 ? transactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {tx.type === 'income' ? <ArrowUpCircle className="h-4 w-4 text-green-500"/> : <ArrowDownCircle className="h-4 w-4 text-red-500"/>}
                                                <div className="font-medium">{tx.description}</div>
                                            </div>
                                            <div className="text-xs text-muted-foreground ml-6">{tx.category}</div>
                                        </TableCell>
                                        <TableCell>{formatDate(tx.date)}</TableCell>
                                        <TableCell className={cn("text-right font-semibold", tx.type === 'income' ? 'text-green-600' : 'text-red-500')}>{formatCurrency(tx.amount)}</TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={3} className="text-center h-24">Tidak ada transaksi.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="goals" className="mt-4">
                <Card>
                     <CardHeader>
                        <CardTitle>Target Tabungan</CardTitle>
                        <CardDescription>Total {goals.length} target tabungan ditemukan.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto grid gap-4">
                       {goals.length > 0 ? goals.map(goal => (
                           <div key={goal.id} className="p-3 border rounded-lg">
                               <div className="flex justify-between items-center">
                                   <p className="font-semibold">{goal.name}</p>
                                   <Badge><Target className="w-3 h-3 mr-1.5"/>Tercapai: {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%</Badge>
                               </div>
                               <p className="text-sm text-muted-foreground">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
                           </div>
                       )) : <div className="text-center h-24 flex items-center justify-center text-muted-foreground">Tidak ada target tabungan.</div>}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="debts" className="mt-4">
                 <Card>
                     <CardHeader>
                        <CardTitle>Hutang & Piutang</CardTitle>
                         <CardDescription>Total {debts.length} catatan ditemukan.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto grid gap-4">
                         {debts.length > 0 ? debts.map(debt => (
                           <div key={debt.id} className="p-3 border rounded-lg">
                               <div className="flex justify-between items-center">
                                   <p className="font-semibold">{debt.name}</p>
                                   <Badge variant={debt.type === 'debt' ? 'destructive' : 'default'}><Scale className="w-3 h-3 mr-1.5"/>{debt.type === 'debt' ? 'Hutang' : 'Piutang'}</Badge>
                               </div>
                               <p className="text-sm text-muted-foreground">Sisa: {formatCurrency(debt.totalAmount - debt.paidAmount)}</p>
                                {debt.isPaid && <Badge variant="secondary" className="mt-1">Lunas</Badge>}
                           </div>
                       )) : <div className="text-center h-24 flex items-center justify-center text-muted-foreground">Tidak ada data hutang/piutang.</div>}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

export function BudgetFlowManagement() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'fullName', desc: false }]);
  const { toast } = useToast();

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isDetailOpen, setDetailOpen] = React.useState(false);
  const [financials, setFinancials] = React.useState<UserFinancials | null>(null);
  const [isLoadingFinancials, setIsLoadingFinancials] = React.useState(false);

  React.useEffect(() => {
    const q = query(collection(db, "users"), orderBy("fullName"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(usersData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching users: ", error);
      toast({ title: "Gagal Memuat Pengguna", variant: "destructive" });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleViewDetails = async (user: User) => {
    setSelectedUser(user);
    setDetailOpen(true);
    setIsLoadingFinancials(true);
    try {
        const [transactionsSnap, goalsSnap, debtsSnap] = await Promise.all([
            getDocs(collection(db, 'budgetflow', user.id, 'transactions')),
            getDocs(collection(db, 'budgetflow', user.id, 'goals')),
            getDocs(collection(db, 'budgetflow', user.id, 'debts')),
        ]);

        const transactions = transactionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)).sort((a, b) => (b.date as Timestamp).toMillis() - (a.date as Timestamp).toMillis());
        const goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
        const debts = debtsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));

        setFinancials({ transactions, goals, debts });
    } catch (error) {
        console.error(error);
        toast({ title: "Gagal memuat data keuangan", variant: "destructive" });
        setFinancials(null);
    } finally {
        setIsLoadingFinancials(false);
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'fullName',
      header: 'Nama Pengguna',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={row.original.avatarUrl} alt={row.original.fullName} />
            <AvatarFallback>{row.original.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.fullName}</div>
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => (
        <div className="text-right">
            <Button variant="outline" size="sm" onClick={() => handleViewDetails(row.original)}>
                <Eye className="h-4 w-4 mr-2"/> Lihat Data
            </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, globalFilter: filter },
    onGlobalFilterChange: setFilter,
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Cari pengguna..."
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow><TableHead>Nama Pengguna</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={2} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={2} className="h-24 text-center">Tidak ada pengguna.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Selanjutnya</Button>
      </div>
      
      <Dialog open={isDetailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Data Keuangan: {selectedUser?.fullName}</DialogTitle>
                <DialogDescription>{selectedUser?.email}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                {isLoadingFinancials ? (
                     <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : financials && selectedUser ? (
                    <UserFinancialsDetail user={selectedUser} financials={financials} />
                ) : (
                    <div>Gagal memuat data.</div>
                )}
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => setDetailOpen(false)}>Tutup</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
