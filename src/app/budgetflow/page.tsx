
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, BarChart2, Table, PiggyBank, Scale, Landmark, Trash2, Bot } from 'lucide-react';
import { usePageAccess } from "@/hooks/use-page-access";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BudgetFlowDashboard } from '@/components/budgetflow/dashboard';
import { DataTable } from '@/components/budgetflow/data-table';
import { SavingsView } from '@/components/budgetflow/savings-view';
import { DebtsView } from '@/components/budgetflow/debts-view';
import { DateRangePicker } from '@/components/budgetflow/date-range-picker';
import { type DateRange } from 'react-day-picker';
import { subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { resetBudgetflowData } from '@/lib/budgetflow-store';
import { FinancialChatInterface } from '@/components/budgetflow/financial-chat-interface';


function ResetDataDialog() {
  const [open, setOpen] = React.useState(false);
  const [confirmationText, setConfirmationText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { toast } = useToast();
  const CONFIRMATION_WORD = "HAPUS";

  const handleReset = async () => {
    setIsDeleting(true);
    try {
        await resetBudgetflowData();
        toast({
            title: "Data Direset",
            description: "Semua data BudgetFlow Anda telah berhasil dihapus.",
        });
        // Data will automatically refresh due to store listeners
    } catch(error: any) {
        toast({
            title: "Gagal Mereset Data",
            description: error.message || "Terjadi kesalahan yang tidak diketahui.",
            variant: "destructive",
        });
    } finally {
        setIsDeleting(false);
        setConfirmationText('');
        setOpen(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Reset Data</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anda Yakin Ingin Mereset Semua Data?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Semua data transaksi, tabungan, dan hutang/piutang Anda akan dihapus secara permanen.
             Untuk melanjutkan, ketik <strong className="text-foreground">{CONFIRMATION_WORD}</strong> di bawah ini.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
            <Label htmlFor="confirmation-input" className="sr-only">Ketik untuk konfirmasi</Label>
            <Input 
                id="confirmation-input"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={`Ketik "${CONFIRMATION_WORD}"`}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmationText('')}>Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleReset} 
            disabled={confirmationText !== CONFIRMATION_WORD || isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Ya, Hapus Semua Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function BudgetFlowPage() {
  const { hasAccess, isLoading } = usePageAccess('budgetflow');
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const presetRanges = [
    { label: 'Bulan Ini', range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
    { label: '7 Hari Terakhir', range: { from: subDays(new Date(), 6), to: new Date() } },
    { label: '30 Hari Terakhir', range: { from: subDays(new Date(), 29), to: new Date() } },
    { label: 'Tahun Ini', range: { from: startOfYear(new Date()), to: endOfYear(new Date()) } },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return null; // The hook handles redirection.
  }

  return (
    <div className="flex flex-1 flex-col p-4 pt-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                BudgetFlow
              </h2>
              <p className="text-sm text-muted-foreground">
                Dasbor keuangan pribadi Anda.
              </p>
            </div>
          </div>
           <div className="flex items-center gap-2">
            <DateRangePicker date={date} setDate={setDate} presetRanges={presetRanges} />
            <ResetDataDialog />
           </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="dashboard"><BarChart2 className="w-4 h-4 md:mr-2"/><span className="hidden md:inline">Dasbor</span></TabsTrigger>
            <TabsTrigger value="transactions"><Table className="w-4 h-4 md:mr-2"/><span className="hidden md:inline">Transaksi</span></TabsTrigger>
            <TabsTrigger value="savings"><PiggyBank className="w-4 h-4 md:mr-2"/><span className="hidden md:inline">Tabungan</span></TabsTrigger>
            <TabsTrigger value="debts"><Scale className="w-4 h-4 md:mr-2"/><span className="hidden md:inline">Hutang</span></TabsTrigger>
            <TabsTrigger value="ai-consultant"><Bot className="w-4 h-4 md:mr-2"/><span className="hidden md:inline">Konsultan AI</span></TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
             <TabsContent value="dashboard">
                <BudgetFlowDashboard dateRange={date}/>
            </TabsContent>
            <TabsContent value="transactions">
                <DataTable dateRange={date} />
            </TabsContent>
            <TabsContent value="savings">
                <SavingsView />
            </TabsContent>
             <TabsContent value="debts">
                <DebtsView />
            </TabsContent>
            <TabsContent value="ai-consultant">
                <FinancialChatInterface dateRange={date} />
            </TabsContent>
          </div>
        </Tabs>
    </div>
  );
}
