
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionConfig } from '@/lib/menu-store';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from './use-toast';

const LAST_ACTIVITY_KEY = 'lastActivityTime';
let activityTimeout: NodeJS.Timeout | null = null;
let sessionCheckInterval: NodeJS.Timeout | null = null;

export function useSessionManager() {
  const { sessionConfig, isLoading } = useSessionConfig();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const durationMinutes = sessionConfig.durationMinutes;

    // If duration is 0, session management is disabled. Clean up and return.
    if (durationMinutes <= 0) {
      clearAllTimers();
      return;
    }
    
    const handleSignOut = () => {
      signOut(auth).then(() => {
        toast({
          title: "Sesi Anda Telah Berakhir",
          description: "Anda telah dikeluarkan secara otomatis karena tidak aktif.",
          variant: "destructive"
        });
        // We don't use router.push here because the onAuthStateChanged listener will handle it.
      });
    };

    const checkSession = () => {
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (!lastActivity) return;

      const lastActivityTime = parseInt(lastActivity, 10);
      const now = new Date().getTime();
      const idleTime = now - lastActivityTime;

      if (idleTime > durationMinutes * 60 * 1000) {
        handleSignOut();
      }
    };

    const resetActivityTimer = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, new Date().getTime().toString());
    };

    const clearAllTimers = () => {
      if (activityTimeout) clearTimeout(activityTimeout);
      if (sessionCheckInterval) clearInterval(sessionCheckInterval);
    };

    const setupListeners = () => {
      // Set initial activity time on login/load
      resetActivityTimer();

      // Set up event listeners to track user activity
      window.addEventListener('mousemove', resetActivityTimer);
      window.addEventListener('keydown', resetActivityTimer);
      window.addEventListener('click', resetActivityTimer);
      window.addEventListener('scroll', resetActivityTimer);

      // Start the interval to check for inactivity
      clearAllTimers(); // Ensure no multiple intervals are running
      sessionCheckInterval = setInterval(checkSession, 60 * 1000); // Check every minute
    };

    const cleanupListeners = () => {
      window.removeEventListener('mousemove', resetActivityTimer);
      window.removeEventListener('keydown', resetActivityTimer);
      window.removeEventListener('click', resetActivityTimer);
      window.removeEventListener('scroll', resetActivityTimer);
      clearAllTimers();
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    };
    
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, set up the session manager
        setupListeners();
      } else {
        // User is signed out, clean up everything
        cleanupListeners();
      }
    });

    // Clean up on component unmount
    return () => {
      unsubscribe();
      cleanupListeners();
    };
  }, [sessionConfig, isLoading, router]);
}
