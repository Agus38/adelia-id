

import { TokenListrikTransactionForm } from "@/components/digital-products/token-listrik/transaction-form";
import { UserBalanceCard } from "@/components/digital-products/pulsa/user-balance-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionHistoryTokenListrik } from "@/components/digital-products/token-listrik/transaction-history";


export default function TokenListrikPage() {
  return (
    <div className="flex flex-col items-center flex-1 p-4 pt-6 md:p-8 space-y-6">
      <UserBalanceCard />
        <Tabs defaultValue="buy-token-listrik" className="w-full max-w-lg">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy-token-listrik">Beli Token</TabsTrigger>
            <TabsTrigger value="history">Riwayat Transaksi</TabsTrigger>
          </TabsList>
          <TabsContent value="buy-token-listrik" className="mt-6">
            <TokenListrikTransactionForm />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
             <TransactionHistoryTokenListrik />
          </TabsContent>
        </Tabs>
    </div>
  );
}
