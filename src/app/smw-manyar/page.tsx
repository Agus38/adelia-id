
'use client';

import * as React from 'react';
import { SmwManyarReportForm } from "@/components/smw-manyar/report-form";
import { usePageAccess } from "@/hooks/use-page-access";
import { FileText, Loader2 } from 'lucide-react';
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";

export const dynamic = 'force-dynamic';

export default function SmwManyarPage() {
  const { hasAccess, isLoading } = usePageAccess('smw-manyar');
  
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
    <div className="flex flex-1 flex-col p-4 pt-6 md:p-8 space-y-4">
      <div className="flex-shrink-0">
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8" />
          <h2 className="text-3xl font-bold tracking-tight">Laporan SMW Manyar</h2>
        </div>
        <p className="text-muted-foreground mt-2">
          Isi formulir di bawah untuk membuat laporan harian dan mengirimkannya via WhatsApp.
        </p>
      </div>
      <div className="flex-1 pt-4">
        <SmwManyarReportForm />
      </div>
    </div>
  );
}
