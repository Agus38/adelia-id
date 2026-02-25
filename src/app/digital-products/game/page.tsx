
'use client';

import { GameTransactionForm } from '@/components/digital-products/game/transaction-form';

export default function GamePage() {
  return (
    <div className="flex flex-col items-center flex-1 p-4 pt-6 md:p-8 space-y-6">
        <GameTransactionForm />
    </div>
  );
}
