// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';

// Firebase config from env vars
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Define variables for Firebase services
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Track client-side initialization
let isFirebaseInitialized = false;

// Client-side only initialization
if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized on client');
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    isFirebaseInitialized = true;

    // Dev environment emulator connection
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('Connected to Firebase emulators');
      } catch (error) {
        console.error('Failed to connect to Firebase emulators:', error);
      }
    }
  } catch (error) {
    console.error('Firebase client initialization error:', error);
    isFirebaseInitialized = false;

    // Fallback dummy implementations
    auth = {
      currentUser: null,
      onAuthStateChanged: (cb: any) => {
        cb(null);
        return () => {};
      },
      signInWithEmailAndPassword: async () => {
        throw new Error('Firebase Auth is not available');
      },
      createUserWithEmailAndPassword: async () => {
        throw new Error('Firebase Auth is not available');
      },
      signOut: async () => Promise.resolve(),
      signInWithPopup: async () => {
        throw new Error('Firebase Auth is not available');
      },
      signInWithRedirect: async () => {
        throw new Error('Firebase Auth is not available');
      }
    } as unknown as Auth;
    
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
  }
} else {
  // Server-side placeholders
  console.log('Creating server-side Firebase placeholders');
  app = {} as FirebaseApp;
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {}
  } as unknown as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

// Export Firebase instances
export { app, auth, db, storage, isFirebaseInitialized }; 