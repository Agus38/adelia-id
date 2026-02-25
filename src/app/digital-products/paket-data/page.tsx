

import { PaketDataTransactionForm } from "@/components/digital-products/paket-data/transaction-form";
import { UserBalanceCard } from "@/components/digital-products/pulsa/user-balance-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionHistoryPaketData } from "@/components/digital-products/paket-data/transaction-history";


export default function PaketDataPage() {
  return (
    <div className="flex flex-col items-center flex-1 p-4 pt-6 md:p-8 space-y-6">
      <UserBalanceCard />
        <Tabs defaultValue="buy-paket-data" className="w-full max-w-lg">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy-paket-data">Beli Paket Data</TabsTrigger>
            <TabsTrigger value="history">Riwayat Transaksi</TabsTrigger>
          </TabsList>
          <TabsContent value="buy-paket-data" className="mt-6">
            <PaketDataTransactionForm />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
             <TransactionHistoryPaketData />
          </TabsContent>
        </Tabs>
    </div>
  );
}
