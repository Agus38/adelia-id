
'use client';

import { CalculatorUI } from "@/components/kalkulator/calculator-ui";
import { Calculator, Loader2 } from 'lucide-react';
import { usePageAccess } from "@/hooks/use-page-access";

export default function KalkulatorPage() {
    const { hasAccess, isLoading } = usePageAccess('kalkulator');

    if (isLoading) {
        return (
        <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        );
    }

    if (!hasAccess) {
        return null; // The hook will handle the redirect.
    }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <CalculatorUI />
      </div>
    </div>
  );
}
