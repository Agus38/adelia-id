
'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionConfig } from '@/lib/menu-store';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from './use-toast';
import { useUserStore } from '@/lib/user-store';

const LAST_ACTIVITY_KEY = 'lastActivityTime';
let sessionCheckInterval: NodeJS.Timeout | null = null;

export function useSessionManager() {
  const { sessionConfig, isLoading } = useSessionConfig();
  const router = useRouter();
  const { user } = useUserStore();

  const handleSignOut = useCallback(() => {
    signOut(auth).then(() => {
      toast({
        title: "Sesi Anda Telah Berakhir",
        description: "Anda telah dikeluarkan secara otomatis karena tidak aktif.",
        variant: "destructive"
      });
      // The user store listener will handle clearing the user state.
    });
  }, [router]);

  const resetActivityTimer = useCallback(() => {
    localStorage.setItem(LAST_ACTIVITY_KEY, new Date().getTime().toString());
  }, []);
  
  const clearSessionInterval = useCallback(() => {
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const durationMinutes = sessionConfig.durationMinutes;

    const cleanupListeners = () => {
      window.removeEventListener('mousemove', resetActivityTimer);
      window.removeEventListener('keydown', resetActivityTimer);
      window.removeEventListener('click', resetActivityTimer);
      window.removeEventListener('scroll', resetActivityTimer);
      clearSessionInterval();
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    };

    if (durationMinutes <= 0 || !user) {
      cleanupListeners();
      return;
    }
    
    const checkSession = () => {
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (!lastActivity) {
        if (auth.currentUser) {
            handleSignOut();
        }
        return;
      }

      const lastActivityTime = parseInt(lastActivity, 10);
      const now = new Date().getTime();
      const idleTime = now - lastActivityTime;

      if (idleTime > durationMinutes * 60 * 1000) {
        handleSignOut();
      }
    };

    const setupListeners = () => {
      resetActivityTimer();

      window.addEventListener('mousemove', resetActivityTimer);
      window.addEventListener('keydown', resetActivityTimer);
      window.addEventListener('click', resetActivityTimer);
      window.addEventListener('scroll', resetActivityTimer);

      clearSessionInterval();
      sessionCheckInterval = setInterval(checkSession, 60 * 1000); // Check every minute
    };
    
    setupListeners();

    // Clean up on component unmount or when dependencies change
    return () => {
      cleanupListeners();
    };
  }, [sessionConfig, isLoading, user, handleSignOut, resetActivityTimer, clearSessionInterval]);
}
