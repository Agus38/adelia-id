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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { addTransaction, type TransactionType } from '@/lib/budgetflow-store';
import { incomeCategories, expenseCategories } from '@/lib/budgetflow-store';

interface TransactionFormProps {
  type: TransactionType;
  onSaveSuccess: () => void;
}

function TransactionForm({ type, onSaveSuccess }: TransactionFormProps) {
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [isSaving, setIsSaving] = React.useState(false);
  const { user } = useUserStore();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!description || !amount || !category || !date || !user) {
        toast({ title: 'Data tidak lengkap', description: 'Harap isi semua kolom.', variant: 'destructive'});
        return;
    }
    
    setIsSaving(true);
    try {
        await addTransaction({
            userId: user.uid,
            type,
            description,
            amount: parseFloat(amount),
            category,
            date,
        });
        toast({ title: 'Transaksi Disimpan', description: 'Transaksi baru telah berhasil ditambahkan.' });
        onSaveSuccess();
    } catch (error) {
        toast({ title: 'Gagal Menyimpan', description: 'Terjadi kesalahan saat menyimpan transaksi.', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };

  const categories = type === 'income' ? incomeCategories : expenseCategories;
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${type}-description`}>Deskripsi</Label>
        <Input id={`${type}-description`} placeholder={`Contoh: ${type === 'income' ? 'Gaji bulanan' : 'Beli makan siang'}`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${type}-amount`}>Jumlah</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            Rp
          </span>
          <Input id={`${type}-amount`} type="number" placeholder="0" className="pl-8" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${type}-category`}>Kategori</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id={`${type}-category`}>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
       <div className="space-y-2">
            <Label htmlFor={`${type}-date`}>Tanggal Transaksi</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: id }) : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={id} />
              </PopoverContent>
            </Popover>
        </div>
      <DialogFooter className="pt-4">
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Transaksi
        </Button>
      </DialogFooter>
    </div>
  );
}

export function AddTransactionDialog() {
  const [open, setOpen] = React.useState(false);

  const handleSaveSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Tabs defaultValue="expense" className="w-full">
          <DialogHeader className="mb-4">
            <DialogTitle>Tambah Transaksi Baru</DialogTitle>
            <DialogDescription>
              Pilih jenis transaksi dan isi detail di bawah ini.
            </DialogDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
              <TabsTrigger value="income">Pemasukan</TabsTrigger>
            </TabsList>
          </DialogHeader>
          
          <TabsContent value="expense" className="space-y-4">
            <TransactionForm type="expense" onSaveSuccess={handleSaveSuccess} />
          </TabsContent>
          <TabsContent value="income" className="space-y-4">
            <TransactionForm type="income" onSaveSuccess={handleSaveSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}