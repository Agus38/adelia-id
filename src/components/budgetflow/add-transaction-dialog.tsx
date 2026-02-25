
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/lib/user-store';
import { addTransaction, updateTransaction, type Transaction, type TransactionType, useBudgetflowStore, addCategory } from '@/lib/budgetflow-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Combobox } from '../ui/combobox';

// --- Transaction Form ---
interface TransactionFormProps {
  type: TransactionType;
  onSaveSuccess: () => void;
  transactionToEdit?: Transaction | null;
}

function TransactionForm({ type, onSaveSuccess, transactionToEdit }: TransactionFormProps) {
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [isSaving, setIsSaving] = React.useState(false);
  const { user } = useUserStore();
  const { toast } = useToast();
  const { incomeCategories, expenseCategories } = useBudgetflowStore();

  React.useEffect(() => {
    if (transactionToEdit && transactionToEdit.type === type) {
        setDescription(transactionToEdit.description);
        setAmount(String(transactionToEdit.amount));
        setCategory(transactionToEdit.category);
        setDate(transactionToEdit.date instanceof Date ? transactionToEdit.date : transactionToEdit.date.toDate());
    } else {
        setDescription('');
        setAmount('');
        setCategory('');
        setDate(new Date());
    }
  }, [transactionToEdit, type]);

  const handleSave = async () => {
    if (!description || !amount || !category || !date || !user) {
        toast({ title: 'Data tidak lengkap', description: 'Harap isi semua kolom.', variant: 'destructive'});
        return;
    }
    
    setIsSaving(true);
    try {
        const transactionData = {
            userId: user.uid,
            type,
            description,
            amount: parseFloat(amount),
            category: category.trim(),
            date,
        };

        if (transactionToEdit) {
            await updateTransaction(user.uid, transactionToEdit.id, transactionData);
            toast({ title: 'Transaksi Diperbarui' });
        } else {
            await addTransaction(transactionData);
            toast({ title: 'Transaksi Disimpan' });
        }
        
        const currentCategories = type === 'income' ? incomeCategories : expenseCategories;
        if (!currentCategories.some(c => c.value.toLowerCase() === category.trim().toLowerCase())) {
            await addCategory(user.uid, category.trim(), type);
        }
        
        onSaveSuccess();
    } catch (error) {
        toast({ title: 'Gagal Menyimpan', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 12) { // Limit to 12 digits (trillions)
      setAmount(value);
    }
  };
  
  const formatDisplayValue = (value: string) => {
    if (!value) return '';
    return Number(value).toLocaleString('id-ID');
  };

  const categories = type === 'income' ? incomeCategories : expenseCategories;
  
  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor={`${type}-description`}>Deskripsi</Label>
        <Input id={`${type}-description`} placeholder={`Contoh: ${type === 'income' ? 'Gaji bulanan' : 'Beli makan siang'}`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${type}-amount`}>Jumlah</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
          <Input id={`${type}-amount`} type="text" inputMode="numeric" placeholder="0" className="pl-8" value={formatDisplayValue(amount)} onChange={handleAmountChange} />
        </div>
      </div>
       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
         <div className="space-y-2">
            <Label htmlFor={`${type}-category`}>Kategori</Label>
            <Combobox options={categories} value={category} onChange={setCategory} placeholder="Pilih atau buat kategori" searchPlaceholder="Cari kategori..." emptyPlaceholder="Kategori tidak ditemukan." />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${type}-date`}>Tanggal</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: id }) : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={id} /></PopoverContent>
            </Popover>
        </div>
       </div>
      <DialogFooter className="pt-6">
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {transactionToEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
        </Button>
      </DialogFooter>
    </div>
  );
}

// --- Main Dialog Component ---
interface AddTransactionDialogProps {
    children: React.ReactNode;
    transactionToEdit?: Transaction | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddTransactionDialog({ children, transactionToEdit, open, onOpenChange }: AddTransactionDialogProps) {
  const handleSaveSuccess = () => {
    if (onOpenChange) onOpenChange(false);
  };
  
  const defaultTab = transactionToEdit?.type || 'expense';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transactionToEdit ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</DialogTitle>
          <DialogDescription>{transactionToEdit ? 'Ubah detail transaksi Anda.' : 'Pilih jenis transaksi dan isi detail di bawah ini.'}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="expense">Pengeluaran</TabsTrigger><TabsTrigger value="income">Pemasukan</TabsTrigger></TabsList>
          <TabsContent value="expense"><TransactionForm type="expense" onSaveSuccess={handleSaveSuccess} transactionToEdit={transactionToEdit} /></TabsContent>
          <TabsContent value="income"><TransactionForm type="income" onSaveSuccess={handleSaveSuccess} transactionToEdit={transactionToEdit} /></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// --- Floating Action Button (FAB) ---
export function AddTransactionButton() {
    const [open, setOpen] = React.useState(false);
    
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
                  <PlusCircle className="h-6 w-6" />
                  <span className="sr-only">Tambah Transaksi</span>
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Tambah Transaksi</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Transaksi Baru</DialogTitle>
            <DialogDescription>Pilih jenis transaksi dan isi detail di bawah ini.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="expense" className="w-full">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="expense">Pengeluaran</TabsTrigger><TabsTrigger value="income">Pemasukan</TabsTrigger></TabsList>
            <TabsContent value="expense"><TransactionForm type="expense" onSaveSuccess={() => setOpen(false)} /></TabsContent>
            <TabsContent value="income"><TransactionForm type="income" onSaveSuccess={() => setOpen(false)} /></TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
}
