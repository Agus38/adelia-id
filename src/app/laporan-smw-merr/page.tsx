
'use client';

import * as React from 'react';
import { usePageAccess } from '@/hooks/use-page-access';
import { Loader2 } from 'lucide-react';
import DailyReportForm from '@/components/laporan-harian/daily-report-form';

export default function DailyReportPage() {
  const { hasAccess, isLoading } = usePageAccess('laporan-smw-merr');

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    // The hook handles redirection, so we can just return null.
    return null;
  }
  
  return <DailyReportForm />;
}
