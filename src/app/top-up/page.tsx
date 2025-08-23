
import { UserBalanceCard } from "@/components/digital-products/pulsa/user-balance-card";
import { TopUpForm } from "@/components/top-up/top-up-form";

export default function TopUpPage() {
  return (
    <div className="flex flex-col items-center flex-1 p-4 pt-6 md:p-8">
      <UserBalanceCard />
      <TopUpForm />
    </div>
  );
}
