
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

export function useUnsavedChangesWarning(isDirty: boolean) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  useEffect(() => {
    // For closing tab/reloading page
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?";
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    // For Next.js Link navigation
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && isDirty) {
        const targetUrl = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // Only intercept internal navigation
        if (targetUrl.origin === currentUrl.origin && targetUrl.pathname !== currentUrl.pathname) {
          e.preventDefault();
          setNextPath(link.href);
          setShowDialog(true);
        }
      }
    };
    
    document.addEventListener('click', handleLinkClick);

    // For browser back/forward buttons
    const handlePopState = (event: PopStateEvent) => {
        if (isDirty) {
            // This is a tricky part. We prevent the default back navigation
            // by pushing the current state back to history.
            window.history.pushState(null, '', window.location.href);
            setShowDialog(true);
            // We don't have a reliable nextPath for popstate, so we use router.back()
            setNextPath('__BACK__'); 
        }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty]);

  const handleConfirmNavigation = () => {
    if (nextPath) {
      // Temporarily remove the 'beforeunload' listener to allow navigation
      window.removeEventListener('beforeunload', () => {});
      
      if (nextPath === '__BACK__') {
          router.back();
      } else {
          router.push(nextPath);
      }
    }
    setShowDialog(false);
  };

  const handleCancelNavigation = () => {
    setShowDialog(false);
    setNextPath(null);
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
