'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // This will ensure the error is displayed in the Next.js development overlay
      // with its full context, which is exactly what we want for debugging.
      // We are essentially re-throwing it as an uncaught exception.
      if (error instanceof FirestorePermissionError) {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component does not render anything to the DOM.
  return null;
}
