'use client';

import { useState, useEffect } from 'react';
import { app, auth, db, storage, isFirebaseInitialized } from './firebase';

// Hook to safely access Firebase in components
export function useFirebase() {
  const [firebaseReady, setFirebaseReady] = useState(isFirebaseInitialized);
  
  useEffect(() => {
    // If Firebase is already initialized, mark as ready
    if (isFirebaseInitialized) {
      setFirebaseReady(true);
    } else {
      console.error('Firebase was not initialized properly');
      setFirebaseReady(false);
    }
  }, []);
  
  return { app, auth, db, storage, firebaseReady };
}

export default useFirebase; 