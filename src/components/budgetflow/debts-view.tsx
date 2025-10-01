
'use client';

import * as React from 'react';
import { useBudgetflowStore, addDebt, updateDebt, deleteDebt, recordDebtPayment, type Debt, type DebtType } from '@/lib/budgetflow-store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { PlusCircle, MoreVertical, Edit, Trash2, ArrowUp, ArrowDown, HandCoins } from 'lucide-react';
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


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

function DebtRecordPaymentDialog({ open, onOpenChange, debt }: { open: boolean, onOpenChange: (open: boolean) => void, debt: Debt }) {
    const [amount, setAmount] = React.useState('');
    const { toast } = useToast();

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
                        <Input id="payment-amount" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
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
                        <Input id="debt-amount" type="number" placeholder="0" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
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

function DebtTable({ title, debts, type }: { title: string, debts: Debt[], type: DebtType }) {
    const [isFormOpen, setFormOpen] = React.useState(false);
    const [isPaymentOpen, setPaymentOpen] = React.useState(false);
    const [isDeleteOpen, setDeleteOpen] = React.useState(false);
    const [selectedDebt, setSelectedDebt] = React.useState<Debt | null>(null);

    const handleEdit = (debt: Debt) => { setSelectedDebt(debt); setFormOpen(true); };
    const handlePayment = (debt: Debt) => { setSelectedDebt(debt); setPaymentOpen(true); };
    const handleDelete = (debt: Debt) => { setSelectedDebt(debt); setDeleteOpen(true); };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead>Sisa</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {debts.length > 0 ? debts.map(debt => (
                                    <TableRow key={debt.id}>
                                        <TableCell>
                                            <p className="font-medium">{debt.name}</p>
                                            <p className="text-xs text-muted-foreground">Total: {formatCurrency(debt.totalAmount)}</p>
                                        </TableCell>
                                        <TableCell className={cn("font-semibold", type === 'debt' ? 'text-red-500' : 'text-green-500')}>
                                            {formatCurrency(debt.totalAmount - debt.paidAmount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handlePayment(debt)}><HandCoins className="mr-2 h-4 w-4"/> Catat Pembayaran</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(debt)}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(debt)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Hapus</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">Tidak ada data</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {selectedDebt && <DebtFormDialog open={isFormOpen} onOpenChange={setFormOpen} debtToEdit={selectedDebt} />}
            {selectedDebt && <DebtRecordPaymentDialog open={isPaymentOpen} onOpenChange={setPaymentOpen} debt={selectedDebt} />}
            {selectedDebt && (
                 <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                            <AlertDialogDescription>Data "{selectedDebt.name}" akan dihapus permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteDebt(selectedDebt.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
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
                <DebtTable title="Daftar Hutang Saya" debts={myDebts} type="debt" />
                <DebtTable title="Daftar Piutang Saya" debts={myReceivables} type="receivable" />
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
