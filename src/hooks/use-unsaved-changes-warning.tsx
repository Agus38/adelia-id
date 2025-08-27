
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
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?";
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    // This is a workaround for Next.js Link/router.push
    const originalPush = router.push;
    (router as any).push = (href: string, options?: any) => {
      if (isDirty && !isNavigating) {
        setNextPath(href);
        setShowDialog(true);
      } else {
        originalPush(href, options);
      }
    };
    
    // This handles browser back/forward navigation
    router.beforePopState(({ as }) => {
      if (isDirty && !isNavigating) {
        setShowDialog(true);
        setNextPath(as); // Store the path for back navigation
        return false; // Prevent navigation
      }
      return true; // Allow navigation
    });

    return () => {
      (router as any).push = originalPush;
      router.beforePopState(() => true); // Deregister the handler
    };
  }, [router, isDirty, isNavigating]);


  const handleConfirmNavigation = () => {
    setIsNavigating(true);
    if (nextPath) {
      // Check if it's a back/forward navigation
      if (window.location.pathname !== nextPath) {
        router.push(nextPath);
      } else {
        // This is a popstate event (back button)
        // We need to bypass the `beforePopState` guard temporarily
        // A simple router.back() might be blocked again.
        // The state `isNavigating` handles this. We re-trigger the back action.
        window.history.back();
      }
    }
    setShowDialog(false);
  };
  
  // Reset the navigating flag once navigation is complete
  useEffect(() => {
      if (isNavigating) {
          setIsNavigating(false);
      }
  }, [nextPath, isNavigating]);


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
