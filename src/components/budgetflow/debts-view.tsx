
'use client';

import * as React from 'react';
import { useBudgetflowStore, addDebt, updateDebt, deleteDebt, recordDebtPayment, type Debt, type DebtType } from '@/lib/budgetflow-store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { PlusCircle, MoreVertical, Edit, Trash2, ArrowUp, ArrowDown, HandCoins, PiggyBank } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import type { Timestamp } from 'firebase/firestore';


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

function DebtRecordPaymentDialog({ open, onOpenChange, debt }: { open: boolean, onOpenChange: (open: boolean) => void, debt: Debt }) {
    const [amount, setAmount] = React.useState('');
    const { toast } = useToast();

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 12) {
            setAmount(value);
        }
    };
    
    const formatDisplayValue = (value: string) => {
        if (!value) return '';
        return Number(value).toLocaleString('id-ID');
    };

    const handleSave = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast({ title: "Jumlah tidak valid", variant: "destructive" });
            return;
        }
        try {
            await recordDebtPayment(debt.id, parseFloat(amount), debt.name);
            toast({ title: "Pembayaran dicatat" });
            onOpenChange(false);
            setAmount('');
        } catch (error) {
            toast({ title: "Gagal mencatat pembayaran", variant: "destructive" });
        }
    };
    
    return (
         <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Catat Pembayaran: {debt.name}</DialogTitle>
                    <DialogDescription>Masukkan jumlah yang dibayarkan atau diterima.</DialogDescription>
                </DialogHeader>
                 <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="payment-amount">Jumlah Pembayaran</Label>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                            <Input id="payment-amount" type="text" inputMode="numeric" placeholder="0" className="pl-8" value={formatDisplayValue(amount)} onChange={handleAmountChange} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button onClick={handleSave}>Simpan Pembayaran</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function DebtFormDialog({ open, onOpenChange, debtToEdit }: { open: boolean, onOpenChange: (open: boolean) => void, debtToEdit?: Debt }) {
    const [name, setName] = React.useState('');
    const [totalAmount, setTotalAmount] = React.useState('');
    const [type, setType] = React.useState<DebtType>('debt');
    const [dueDate, setDueDate] = React.useState<Date | undefined>();
    const { toast } = useToast();

    React.useEffect(() => {
        if (debtToEdit) {
            setName(debtToEdit.name);
            setTotalAmount(String(debtToEdit.totalAmount));
            setType(debtToEdit.type);
            setDueDate(debtToEdit.dueDate ? (debtToEdit.dueDate as Timestamp).toDate() : undefined);
        } else {
            setName('');
            setTotalAmount('');
            setType('debt');
            setDueDate(undefined);
        }
    }, [debtToEdit, open]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 12) {
            setTotalAmount(value);
        }
    };
    
    const formatDisplayValue = (value: string) => {
        if (!value) return '';
        return Number(value).toLocaleString('id-ID');
    };

    const handleSave = async () => {
        if (!name || !totalAmount) {
            toast({ title: "Data tidak lengkap", variant: "destructive" });
            return;
        }
        try {
            const amount = parseFloat(totalAmount);
            const data: any = { name, totalAmount: amount, type, dueDate };
            if (debtToEdit) {
                await updateDebt(debtToEdit.id, data);
                toast({ title: "Data diperbarui" });
            } else {
                await addDebt({ ...data, paidAmount: 0, isPaid: false });
                toast({ title: "Data baru ditambahkan" });
            }
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Gagal menyimpan", variant: "destructive" });
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{debtToEdit ? 'Edit' : 'Tambah'} Hutang/Piutang</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <RadioGroup value={type} onValueChange={(v) => setType(v as DebtType)} className="grid grid-cols-2 gap-4">
                        <div>
                            <RadioGroupItem value="debt" id="r-debt" className="peer sr-only" />
                            <Label htmlFor="r-debt" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <ArrowDown className="mb-3 h-6 w-6 text-red-500" />Hutang
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="receivable" id="r-receivable" className="peer sr-only" />
                             <Label htmlFor="r-receivable" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                               <ArrowUp className="mb-3 h-6 w-6 text-green-500" />Piutang
                            </Label>
                        </div>
                    </RadioGroup>
                    <div className="space-y-2">
                        <Label htmlFor="debt-name">Nama/Deskripsi</Label>
                        <Input id="debt-name" placeholder={type === 'debt' ? "Hutang ke siapa?" : "Siapa yang berhutang?"} value={name} onChange={e => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="debt-amount">Jumlah Total</Label>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                            <Input id="debt-amount" type="text" inputMode="numeric" placeholder="0" className="pl-8" value={formatDisplayValue(totalAmount)} onChange={handleAmountChange} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Jatuh Tempo (Opsional)</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !dueDate && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dueDate ? format(dueDate, 'PPP', { locale: id }) : <span>Pilih tanggal</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus locale={id} /></PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button onClick={handleSave}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DebtCard({ debt }: { debt: Debt }) {
    const [isFormOpen, setFormOpen] = React.useState(false);
    const [isPaymentOpen, setPaymentOpen] = React.useState(false);
    const [isDeleteOpen, setDeleteOpen] = React.useState(false);

    const progress = (debt.paidAmount / debt.totalAmount) * 100;
    const remainingAmount = debt.totalAmount - debt.paidAmount;

    return (
        <>
            <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{debt.name}</p>
                        <p className="text-xs text-muted-foreground">Total: {formatCurrency(debt.totalAmount)}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPaymentOpen(true)}><HandCoins className="mr-2 h-4 w-4"/> Catat Pembayaran</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFormOpen(true)}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div>
                     <p className="text-sm font-medium">Sisa: <span className={cn(debt.type === 'debt' ? 'text-red-500' : 'text-green-500')}>{formatCurrency(remainingAmount)}</span></p>
                    <Progress value={progress} className="h-2 mt-1" />
                </div>
            </div>
            <DebtFormDialog open={isFormOpen} onOpenChange={setFormOpen} debtToEdit={debt} />
            <DebtRecordPaymentDialog open={isPaymentOpen} onOpenChange={setPaymentOpen} debt={debt} />
            <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                        <AlertDialogDescription>Data "{debt.name}" akan dihapus permanen.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteDebt(debt.id)}>Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}


export function DebtsView() {
    const { debts } = useBudgetflowStore();
    const [isAddDialogOpen, setAddDialogOpen] = React.useState(false);

    const myDebts = debts.filter(d => d.type === 'debt' && !d.isPaid);
    const myReceivables = debts.filter(d => d.type === 'receivable' && !d.isPaid);
    const paidOff = debts.filter(d => d.isPaid);

    return (
        <div className="space-y-6">
             <div className="flex justify-end">
                <Button onClick={() => setAddDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Tambah Data Baru
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Daftar Hutang Saya</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {myDebts.length > 0 ? myDebts.map(debt => <DebtCard key={debt.id} debt={debt} />)
                            : <p className="text-muted-foreground text-sm">Tidak ada hutang aktif.</p>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Daftar Piutang Saya</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         {myReceivables.length > 0 ? myReceivables.map(debt => <DebtCard key={debt.id} debt={debt} />)
                            : <p className="text-muted-foreground text-sm">Tidak ada piutang aktif.</p>}
                    </CardContent>
                </Card>
            </div>
            {paidOff.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Riwayat Lunas</CardTitle></CardHeader>
                    <CardContent>
                       <Table>
                         <TableBody>
                            {paidOff.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell>{d.name}</TableCell>
                                    <TableCell>{d.type === 'debt' ? 'Hutang' : 'Piutang'}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(d.totalAmount)}</TableCell>
                                    <TableCell className="text-right"><Badge>Lunas</Badge></TableCell>
                                </TableRow>
                            ))}
                         </TableBody>
                       </Table>
                    </CardContent>
                </Card>
            )}
            <DebtFormDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
        </div>
    );
}

