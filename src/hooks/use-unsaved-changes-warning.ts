
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useUnsavedChangesWarning(isDirty: boolean) {
  const pathname = usePathname();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        const message = "Data belum disimpan. Apakah kamu yakin ingin meninggalkan halaman ini?";
        event.returnValue = message; // Standard for most browsers
        return message; // For some older browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;

    const handlePopState = (event: PopStateEvent) => {
        if (isDirty) {
            if (!window.confirm("Data belum disimpan. Apakah kamu yakin ingin meninggalkan halaman ini?")) {
                // This is a bit of a hack to prevent back navigation
                // It pushes the current state back onto the history stack
                history.pushState(null, '', pathname);
            }
        }
    }

    window.addEventListener('popstate', handlePopState);

    history.pushState = (...args) => {
        if (isDirty) {
            if (window.confirm("Data belum disimpan. Apakah kamu yakin ingin meninggalkan halaman ini?")) {
                originalPush.apply(history, args);
            }
        } else {
            originalPush.apply(history, args);
        }
    };
    
    history.replaceState = (...args) => {
       if (isDirty) {
            if (window.confirm("Data belum disimpan. Apakah kamu yakin ingin meninggalkan halaman ini?")) {
                originalReplace.apply(history, args);
            }
        } else {
            originalReplace.apply(history, args);
        }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPush;
      history.replaceState = originalReplace;
    };
  }, [isDirty, pathname]);

}
