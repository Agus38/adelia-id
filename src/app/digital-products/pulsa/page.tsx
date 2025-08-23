
import { PulsaTransactionForm } from "@/components/digital-products/pulsa/transaction-form";
import { UserBalanceCard } from "@/components/digital-products/pulsa/user-balance-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionHistory } from "@/components/digital-products/pulsa/transaction-history";


export default function PulsaPage() {
  return (
    <div className="flex flex-col items-center flex-1 p-4 pt-6 md:p-8 space-y-6">
      <UserBalanceCard />
        <Tabs defaultValue="buy-pulsa" className="w-full max-w-lg">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy-pulsa">Beli Pulsa</TabsTrigger>
            <TabsTrigger value="history">Riwayat Transaksi</TabsTrigger>
          </TabsList>
          <TabsContent value="buy-pulsa" className="mt-6">
            <PulsaTransactionForm />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
             <TransactionHistory />
          </TabsContent>
        </Tabs>
    </div>
  );
}
