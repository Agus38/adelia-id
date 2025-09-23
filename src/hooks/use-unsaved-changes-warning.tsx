
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useIsMobile } from './use-mobile';
import { useToast } from './use-toast';
import { AlertTriangle } from 'lucide-react';

// A global variable to store the navigation state. This is a bit of a workaround
// to deal with how Next.js router and browser events interact.
let isNavigationConfirmed = false;
let confirmedPath = '';

export function useUnsavedChangesWarning(isDirty: boolean) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { toast, dismiss } = useToast();

  const [showDialog, setShowDialog] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  // For closing tab/reloading page - this will always use the browser's default prompt
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty && !isNavigationConfirmed) {
        event.preventDefault();
        event.returnValue = "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?";
        return event.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // For Next.js Link navigation
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (isNavigationConfirmed) {
        return;
      }

      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && isDirty) {
        const targetUrl = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        if (targetUrl.origin === currentUrl.origin && targetUrl.pathname !== currentUrl.pathname) {
          e.preventDefault();
          setNextPath(link.getAttribute('href')); // Use getAttribute to get relative path
          triggerWarning();
        }
      }
    };
    
    document.addEventListener('click', handleLinkClick, true); // Use capture phase

    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [isDirty, isMobile, toast]); // Add dependencies

  // For browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
        if(isDirty && !isNavigationConfirmed) {
            history.pushState(null, '', window.location.href);
            setNextPath('__BACK__'); // Special value for router.back()
            triggerWarning();
        } else {
            isNavigationConfirmed = false; // Reset on successful navigation
            confirmedPath = '';
        }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
        window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty]); // Add dependencies

  const proceedWithNavigation = useCallback(() => {
    if (!nextPath) return;

    isNavigationConfirmed = true;
    confirmedPath = nextPath;

    if (nextPath === '__BACK__') {
      router.back();
    } else {
      router.push(nextPath);
    }
  }, [nextPath, router]);


  const handleConfirmNavigation = () => {
    setShowDialog(false);
    proceedWithNavigation();
  };
  
  const handleMobileConfirm = () => {
    dismiss();
    proceedWithNavigation();
  };

  const handleCancelNavigation = () => {
    setShowDialog(false);
    setNextPath(null);
    dismiss();
  };

  const triggerWarning = () => {
      if (isMobile) {
          toast({
              title: (
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Perubahan Belum Disimpan
                </div>
              ),
              description: "Apakah Anda yakin ingin meninggalkan halaman? Perubahan Anda akan hilang.",
              duration: Infinity, // Keep it open until user interaction
              action: (
                <div className="flex w-full gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={handleCancelNavigation} className="w-full">
                        Batal
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleMobileConfirm} className="w-full">
                        Tinggalkan
                    </Button>
                </div>
              ),
          });
      } else {
          setShowDialog(true);
      }
  };

  const UnsavedChangesDialog = useCallback(() => {
    if (isMobile) return null; // Don't render AlertDialog on mobile
    return (
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
    );
  }, [showDialog, isMobile]);

  return { UnsavedChangesDialog };
}
