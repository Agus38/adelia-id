
import { PulsaTransactionForm } from "@/components/digital-products/pulsa/transaction-form";
import { UserBalanceCard } from "@/components/digital-products/pulsa/user-balance-card";

export default function PulsaPage() {
  return (
    <div className="flex flex-col items-center flex-1 p-4 pt-6 md:p-8">
      <UserBalanceCard />
      <PulsaTransactionForm />
    </div>
  );
}
