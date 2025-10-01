
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Loader2, Target, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useBudgetflowStore, expenseCategories, addBudget, updateBudget, deleteBudget, type Budget } from '@/lib/budgetflow-store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export function BudgetsView() {
  const { budgets, transactions, loading } = useBudgetflowStore();
  const { toast } = useToast();

  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [editingBudget, setEditingBudget] = React.useState<Budget | null>(null);

  const monthlyExpenses = React.useMemo(() => {
    const expensesMap: { [key: string]: number } = {};
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    transactions.forEach(tx => {
      const txDate = tx.date instanceof Date ? tx.date : tx.date.toDate();
      if (tx.type === 'expense' && txDate >= startOfMonth) {
        expensesMap[tx.category] = (expensesMap[tx.category] || 0) + tx.amount;
      }
    });
    return expensesMap;
  }, [transactions]);

  const handleSaveBudget = async () => {
    if (!selectedCategory || !amount) {
      toast({ title: 'Data tidak lengkap', description: 'Harap pilih kategori dan masukkan jumlah.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, { category: selectedCategory, amount: parseFloat(amount) });
        toast({ title: 'Anggaran Diperbarui' });
      } else {
        await addBudget({ category: selectedCategory, amount: parseFloat(amount) });
        toast({ title: 'Anggaran Ditambahkan' });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({ title: 'Gagal Menyimpan', description: 'Terjadi kesalahan saat menyimpan anggaran.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDialog = (budget: Budget | null = null) => {
    if (budget) {
      setEditingBudget(budget);
      setSelectedCategory(budget.category);
      setAmount(String(budget.amount));
    } else {
      setEditingBudget(null);
      setSelectedCategory('');
      setAmount('');
    }
    setDialogOpen(true);
  };
  
  const handleDeleteBudget = async (id: string) => {
      try {
          await deleteBudget(id);
          toast({ title: 'Anggaran Dihapus' });
      } catch (error) {
          toast({ title: 'Gagal Menghapus', variant: 'destructive'});
      }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setAmount(value);
  };

  const formatDisplayValue = (value: string) => {
    if (!value) return '';
    return Number(value).toLocaleString('id-ID');
  };
  
  const availableCategories = expenseCategories.filter(cat => !budgets.some(b => b.category === cat && b.id !== editingBudget?.id));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div className='flex items-center gap-2'>
              <Target />
              <div>
                <CardTitle>Anggaran Bulanan</CardTitle>
                <CardDescription>
                  Atur dan lacak batas pengeluaran bulanan Anda.
                </CardDescription>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Buat Anggaran
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBudget ? 'Edit' : 'Buat'} Anggaran</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!!editingBudget}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Pilih kategori pengeluaran" />
                      </SelectTrigger>
                      <SelectContent>
                        {editingBudget && <SelectItem value={editingBudget.category}>{editingBudget.category}</SelectItem>}
                        {availableCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah Anggaran</Label>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            Rp
                        </span>
                        <Input
                            id="amount"
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            className="pl-8"
                            value={formatDisplayValue(amount)}
                            onChange={handleAmountChange}
                        />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
                  <Button onClick={handleSaveBudget} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center items-center h-48"> <Loader2 className="h-8 w-8 animate-spin"/> </div>
        ) : budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Belum ada anggaran yang dibuat.</p>
                <p className="text-sm text-muted-foreground">Klik 'Buat Anggaran' untuk memulai.</p>
            </div>
        ) : (
          <div className="space-y-4">
            {budgets.map(budget => {
              const spent = monthlyExpenses[budget.category] || 0;
              const progress = Math.min((spent / budget.amount) * 100, 100);
              const isOverBudget = spent > budget.amount;
              return (
                <div key={budget.id} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{budget.category}</p>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleOpenDialog(budget)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteBudget(budget.id)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </div>
                  <Progress value={progress} className={isOverBudget ? "h-2 [&>div]:bg-destructive" : "h-2"} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(spent)} / {formatCurrency(budget.amount)}</span>
                    <span className={isOverBudget ? "font-semibold text-destructive" : ""}>
                      {isOverBudget 
                        ? `Lewat ${formatCurrency(spent - budget.amount)}`
                        : `${formatCurrency(budget.amount - spent)} tersisa`
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
