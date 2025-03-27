'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, memo } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { updateUserLoginStreak } from '@/lib/streak-tracker';
import { useFirebase } from '@/lib/useFirebase';

// Create an AuthContext
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  streakCount: number | null;
  authError: boolean;
}>({
  user: null,
  loading: true,
  signOut: async () => {},
  streakCount: null,
  authError: false
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Create a persistent session key to track auth sessions
const SESSION_KEY = 'ai_tutor_session_valid';

// Memoized Providers component for better performance
const ProvidersComponent = ({ children }: { children: React.ReactNode }) => {
  const { auth, firebaseReady } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [streakCount, setStreakCount] = useState<number | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);
  const [initAttempted, setInitAttempted] = useState<boolean>(false);

  // Sign out function - memoized
  const signOut = useMemo(() => async () => {
    try {
      // Set loading to true during sign out to prevent UI flicker
      setLoading(true);
      await firebaseSignOut(auth);
      // Clear session marker
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthError(true);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  // Update streak when user logs in - memoized
  const updateStreak = useMemo(() => async (userId: string) => {
    try {
      const count = await updateUserLoginStreak(userId);
      setStreakCount(count);
    } catch (error) {
      console.error('Error updating streak:', error);
      // Non-critical error - don't set authError here
    }
  }, []);

  // Set session persistence on initial load - use lazy initialization
  useEffect(() => {
    // Only proceed if Firebase is ready
    if (!firebaseReady) return;
    
    // Set Firebase persistence to session only (cleared when browser is closed)
    let isSubscribed = true;
    
    const setupAuth = async () => {
      try {
        await setPersistence(auth, browserSessionPersistence);
        setInitAttempted(true);
      } catch (error) {
        console.error('Error setting auth persistence:', error);
        setAuthError(true);
        setInitAttempted(true);
        // Continue without persistence
      }
      
      // Check if this is a new session (page reload or server restart)
      const sessionValid = sessionStorage.getItem(SESSION_KEY);
      
      if (!sessionValid && isSubscribed) {
        // Force sign out if this is a new session
        try {
          await firebaseSignOut(auth);
        } catch (error) {
          console.error('Error signing out on new session:', error);
          // Continue without sign out - not a critical error
        }
      }
    };
    
    setupAuth();
    
    return () => {
      isSubscribed = false;
    };
  }, [auth, firebaseReady]);

  // Auth state listener - optimize with cleanup
  useEffect(() => {
    // Only proceed if Firebase is ready
    if (!firebaseReady) return;
    
    let isSubscribed = true;
    let authTimeout: NodeJS.Timeout;
    
    // Set a timeout to mark loading as complete even if auth doesn't respond
    authTimeout = setTimeout(() => {
      if (loading && isSubscribed) {
        console.log('Auth state listener timeout - continuing without auth');
        setLoading(false);
        setAuthError(true);
      }
    }, 5000); // 5 second timeout
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isSubscribed) return;
      
      // Clear the timeout since auth responded
      clearTimeout(authTimeout);
      
      setUser(currentUser);
      
      // Update streak if user is logged in
      if (currentUser) {
        // Mark session as valid when user logs in
        sessionStorage.setItem(SESSION_KEY, 'true');
        try {
          await updateStreak(currentUser.uid);
        } catch (e) {
          // Non-critical error, continue without streak
          console.log('Error updating streak:', e);
        }
      } else {
        setStreakCount(null);
      }
      
      setLoading(false);
    }, (error) => {
      // Handle auth state errors
      console.error('Auth state error:', error);
      setAuthError(true);
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      isSubscribed = false;
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, [auth, firebaseReady, loading, updateStreak]);

  // Force finish loading after a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Forcing auth loading to complete after timeout');
        setLoading(false);
      }
    }, 8000);
    
    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    loading: loading || !firebaseReady,
    signOut,
    streakCount,
    authError
  }), [user, loading, firebaseReady, signOut, streakCount, authError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Use memo to prevent unnecessary re-renders
export const Providers = memo(ProvidersComponent);

// Export default for compatibility
export default Providers; 