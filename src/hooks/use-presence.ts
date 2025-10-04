
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

    // Create a reference to the special '.info/connected' path in Realtime Database.
    // This path is a boolean value that is true when the client is connected and false when they are not.
    const connectedRef = ref(rtdb, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      // If the user is not connected, we don't need to do anything.
      // The onDisconnect hook will handle the offline status.
      if (snapshot.val() === false) {
        return;
      }

      // If the user is connected, we set up the onDisconnect hook.
      // This hook will set the user's status to offline when they disconnect.
      onDisconnect(userStatusDatabaseRef)
        .set(isOfflineForDatabase)
        .then(() => {
          // Once the onDisconnect is queued, set the user's presence to online.
          set(userStatusDatabaseRef, isOnlineForDatabase);
        });
    });

    // When the component unmounts, we want to remove the listener.
    // We also set the user's status to offline one last time, just in case.
    return () => {
      unsubscribe();
      // Setting status to offline here on cleanup is a good practice for logout.
      set(userStatusDatabaseRef, isOfflineForDatabase);
    };
  }, [user]);
}
