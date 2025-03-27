import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Formats Firebase private key for proper use
 */
function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  
  // Return as-is if properly formatted
  if (key.includes('-----BEGIN PRIVATE KEY-----') && key.includes('\n')) {
    return key;
  }
  
  // Replace escaped newlines
  if (key.includes('\\n')) {
    return key.replace(/\\n/g, '\n');
  }
  
  return key;
}

// Singleton instances
let adminApp: admin.app.App | undefined;
let adminDb: admin.firestore.Firestore | null = null;

/**
 * Initialize Firebase Admin SDK with error handling
 */
export function initAdminApp() {
  try {
    // Return existing instance if available
    if (adminApp) {
      return adminApp;
    }
    
    // Get environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // Log credential status without revealing values
    console.log(`Initializing Firebase Admin: Project ID ${projectId ? '✓' : '✗'}, Client Email ${clientEmail ? '✓' : '✗'}, Private Key ${privateKey ? '✓' : '✗'}`);
    
    // Bail out if missing credentials
    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase Admin SDK initialization failed: Missing credentials');
      return null;
    }
    
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    
    // Initialize with credentials
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey
      })
    });
    
    adminDb = getFirestore(adminApp);
    
    console.log('Firebase Admin SDK initialized successfully');
    return adminApp;
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    return null;
  }
}

// Auto-initialize on server
if (typeof window === 'undefined') {
  initAdminApp();
}

export { adminDb };

export default initAdminApp; 