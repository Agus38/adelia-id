
'use client';

import * as React from 'react';
import { useBudgetflowStore, addGoal, updateGoal, deleteGoal, adjustGoalAmount, type Goal } from '@/lib/budgetflow-store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { PlusCircle, MoreVertical, Edit, Trash2, PiggyBank, Target, Minus, Plus } from 'lucide-react';
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

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

// --- Goal Card ---
function GoalCard({ goal }: { goal: Goal }) {
    const [isAdjustDialogOpen, setAdjustDialogOpen] = React.useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        <CardDescription>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</CardDescription>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}><Edit className="mr-2 h-4 w-4"/> Edit Target</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Hapus Target</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent>
                    <Progress value={progress} className="h-2"/>
                    <p className="text-xs text-muted-foreground mt-1.5">{progress.toFixed(1)}% tercapai</p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setAdjustDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        <Minus className="h-4 w-4 mr-2" />
                        Ubah Saldo
                    </Button>
                </CardFooter>
            </Card>

            <AdjustGoalDialog open={isAdjustDialogOpen} onOpenChange={setAdjustDialogOpen} goal={goal} />
            <GoalFormDialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen} goalToEdit={goal} />
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Target Tabungan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Target "{goal.name}" akan dihapus permanen.
                            Transaksi yang terkait tidak akan terhapus.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteGoal(goal.id)}>Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

// --- Add/Edit Goal Dialog ---
function GoalFormDialog({ open, onOpenChange, goalToEdit }: { open: boolean, onOpenChange: (open: boolean) => void, goalToEdit?: Goal }) {
    const [name, setName] = React.useState('');
    const [targetAmount, setTargetAmount] = React.useState('');
    const { toast } = useToast();

    React.useEffect(() => {
        if (goalToEdit) {
            setName(goalToEdit.name);
            setTargetAmount(String(goalToEdit.targetAmount));
        } else {
            setName('');
            setTargetAmount('');
        }
    }, [goalToEdit, open]);

    const handleSave = async () => {
        if (!name || !targetAmount) {
            toast({ title: "Data tidak lengkap", variant: "destructive" });
            return;
        }
        try {
            const amount = parseFloat(targetAmount);
            if (goalToEdit) {
                await updateGoal(goalToEdit.id, { name, targetAmount: amount });
                toast({ title: "Target diperbarui" });
            } else {
                await addGoal({ name, targetAmount: amount, currentAmount: 0 });
                toast({ title: "Target baru ditambahkan" });
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
                    <DialogTitle>{goalToEdit ? 'Edit Target' : 'Buat Target Tabungan Baru'}</DialogTitle>
                    <DialogDescription>Isi detail untuk target tabungan Anda.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="goal-name">Nama Target</Label>
                        <Input id="goal-name" placeholder="Contoh: Dana Darurat, Liburan" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="goal-amount">Jumlah Target</Label>
                        <Input id="goal-amount" type="number" placeholder="0" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
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

// --- Adjust Goal Balance Dialog ---
function AdjustGoalDialog({ open, onOpenChange, goal }: { open: boolean, onOpenChange: (open: boolean) => void, goal: Goal }) {
    const [amount, setAmount] = React.useState('');
    const [type, setType] = React.useState<'add' | 'subtract'>('add');
    const { toast } = useToast();

    const handleAdjust = async () => {
        if (!amount) {
            toast({ title: "Jumlah tidak boleh kosong", variant: "destructive" });
            return;
        }
        try {
            const adjustAmount = type === 'add' ? parseFloat(amount) : -parseFloat(amount);
            const description = type === 'add' ? `Menabung untuk "${goal.name}"` : `Ambil dari tabungan "${goal.name}"`;
            await adjustGoalAmount(goal.id, adjustAmount, goal.name);
            toast({ title: "Saldo tabungan diperbarui" });
            onOpenChange(false);
            setAmount('');
        } catch (error) {
            toast({ title: "Gagal memperbarui saldo", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ubah Saldo: {goal.name}</DialogTitle>
                    <DialogDescription>Tambah atau kurangi saldo untuk target tabungan ini. Transaksi yang sesuai akan dibuat.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     <div className="flex items-center space-x-2">
                        <Button variant={type === 'add' ? 'default' : 'outline'} onClick={() => setType('add')} className="flex-1"><Plus className="h-4 w-4 mr-2"/>Tambah Saldo</Button>
                        <Button variant={type === 'subtract' ? 'default' : 'outline'} onClick={() => setType('subtract')} className="flex-1"><Minus className="h-4 w-4 mr-2"/>Kurangi Saldo</Button>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="adjust-amount">Jumlah</Label>
                        <Input id="adjust-amount" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button onClick={handleAdjust}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Main View Component ---
export function SavingsView() {
  const { goals } = useBudgetflowStore();
  const [isAddDialogOpen, setAddDialogOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5"/>Target Tabungan</CardTitle>
            <CardDescription>Lacak kemajuan target keuangan Anda.</CardDescription>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Buat Target Baru
        </Button>
      </CardHeader>
      <CardContent>
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-48 border-2 border-dashed rounded-lg">
            <PiggyBank className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="font-medium">Belum ada target tabungan.</p>
            <p className="text-sm text-muted-foreground">Klik "Buat Target Baru" untuk memulai.</p>
          </div>
        )}
      </CardContent>

      <GoalFormDialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen} />
    </Card>
  );
}
