
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [showDialog, setShowDialog] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // For browser-level events (close tab, refresh)
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

  // For in-app navigation (Next.js Link, router.push, back/forward)
  useEffect(() => {
    // This part is a bit tricky. We are essentially monkey-patching the router.
    // It's not ideal, but it's a common pattern for this use case until Next.js provides a native API.
    const originalPush = router.push;

    // Type assertion to make TypeScript happy
    (router as any).push = (href: string, options?: any) => {
      if (isDirty && !isNavigating) {
        setNextPath(href);
        setShowDialog(true);
      } else {
        originalPush(href, options);
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      if (isDirty && !isNavigating) {
        // Prevent the default back/forward navigation
        history.pushState(null, '', pathname);
        setNextPath(window.location.pathname); // Or derive from event if needed
        setShowDialog(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      (router as any).push = originalPush;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty, router, pathname, isNavigating]);

  const handleConfirmNavigation = () => {
    setIsNavigating(true); 
    setShowDialog(false);
    if (nextPath) {
      router.push(nextPath);
    }
  };
  
   useEffect(() => {
    if (isNavigating) {
      setIsNavigating(false);
    }
  }, [pathname]);

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


  return { showUnsavedChangesDialog: showDialog, UnsavedChangesDialog };
}
