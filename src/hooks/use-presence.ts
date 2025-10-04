
'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/user-store';
import { rtdb } from '@/lib/firebase';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';

export function usePresence() {
  const { user } = useUserStore();

  useEffect(() => {
    if (!user) {
      return;
    }

    const uid = user.uid;
    const userStatusDatabaseRef = ref(rtdb, '/status/' + uid);

    const isOfflineForDatabase = {
      state: 'offline',
      last_changed: serverTimestamp(),
    };

    const isOnlineForDatabase = {
      state: 'online',
      last_changed: serverTimestamp(),
    };

    // Use onValue to listen for connection status
    const connectedRef = ref(rtdb, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) {
        return;
      }

      // If we are connected, then set the user's presences to online.
      onDisconnect(userStatusDatabaseRef)
        .set(isOfflineForDatabase)
        .then(() => {
          // Once the onDisconnect is queued, set the user's presence to online.
          set(userStatusDatabaseRef, isOnlineForDatabase);
        });
    });

    return () => {
      // Clean up the listener when the component unmounts or user logs out
      unsubscribe();
      // Set the user's presence to offline immediately on logout/cleanup
      set(userStatusDatabaseRef, isOfflineForDatabase);
    };
  }, [user]);
}
