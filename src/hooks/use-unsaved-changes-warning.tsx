
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from './use-toast';
import { AlertTriangle } from 'lucide-react';

let nextPath: string | null = null;
let isNavigating = false;


export function useUnsavedChangesWarning(isDirty: boolean) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { toast, dismiss } = useToast();

  const [showDialog, setShowDialog] = useState(false);

  const handleLinkClick = useCallback((e: MouseEvent) => {
    if (!isDirty || isNavigating) return;

    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.href && link.target !== '_blank') {
      const targetUrl = new URL(link.href);
      const currentUrl = new URL(window.location.href);

      // Only intercept internal navigation
      if (targetUrl.origin === currentUrl.origin && targetUrl.pathname !== currentUrl.pathname) {
        e.preventDefault();
        nextPath = link.getAttribute('href');
        setShowDialog(true);
      }
    }
  }, [isDirty, router]);


  // For closing tab/reloading page
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty && !isNavigating) {
        event.preventDefault();
        event.returnValue = "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?";
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [isDirty, handleLinkClick]);


  const proceed = () => {
    isNavigating = true;
    if (nextPath) {
      router.push(nextPath);
    }
  };

  const handleConfirmNavigation = () => {
    setShowDialog(false);
    proceed();
  };

  const handleCancelNavigation = () => {
    setShowDialog(false);
    nextPath = null;
  };
  

  const UnsavedChangesDialog = useCallback(() => (
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Perubahan Belum Disimpan</AlertDialogTitle>
              <AlertDialogDescription>
                  Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman ini? Perubahan Anda akan hilang.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelNavigation}>Batal</AlertDialogCancel>
              <AlertDialogAction asChild>
                  <Button variant="destructive" onClick={handleConfirmNavigation}>Tinggalkan Halaman</Button>
              </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
  ), [showDialog]);


  return { UnsavedChangesDialog };
}
