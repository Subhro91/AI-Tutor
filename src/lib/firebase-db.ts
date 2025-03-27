import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  DocumentData,
  Timestamp,
  writeBatch,
  limit,
  Firestore,
  CollectionReference
} from 'firebase/firestore';

// Types
export interface ChatMessage {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Timestamp | null;
  subjectId: string;
  userId: string;
}

export interface UserProgress {
  userId: string;
  subjectId: string;
  lastAccessed: Timestamp | null;
  messagesCount: number;
  completedTopics: string[];
  score?: number;
}

// Interface for notifications
export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'achievement' | 'streak' | 'milestone' | 'update' | 'summary';
  isRead: boolean;
  createdAt: any; // Firestore timestamp
  link?: string; // Optional link to navigate when clicked
}

// Safely get a collection reference with validation
function getCollection(collectionPath: string): CollectionReference | null {
  try {
    // Make sure db is defined and is a valid Firestore instance
    if (!db) {
      console.error('Firebase Firestore instance not properly initialized');
      return null;
    }
    return collection(db, collectionPath);
  } catch (error) {
    console.error(`Error getting collection ${collectionPath}:`, error);
    return null;
  }
}

// User Progress Operations
export async function createOrUpdateUserProgress(progress: UserProgress) {
  try {
    if (!db) {
      console.error('Firebase Firestore not initialized');
      return { success: false, error: 'Firestore not initialized' };
    }
    
    const progressRef = doc(db, 'userProgress', `${progress.userId}_${progress.subjectId}`);
    
    // Check if document exists
    const docSnap = await getDoc(progressRef);
    
    if (docSnap.exists()) {
      // Update existing record
      await updateDoc(progressRef, {
        ...progress,
        lastAccessed: serverTimestamp(),
      });
    } else {
      // Create new record
      await setDoc(progressRef, {
        ...progress,
        lastAccessed: serverTimestamp(),
      });
    }
    
    return { success: true, id: progressRef.id };
  } catch (error) {
    console.error('Error saving user progress:', error);
    return { success: false, error };
  }
}

export async function getUserProgress(userId: string) {
  try {
    if (!db) {
      console.error('Firebase Firestore not initialized');
      return [];
    }
    
    const progressCollection = getCollection('userProgress');
    if (!progressCollection) return [];
    
    const progressQuery = query(
      progressCollection,
      where('userId', '==', userId),
      orderBy('lastAccessed', 'desc')
    );
    
    const querySnapshot = await getDocs(progressQuery);
    const progress: UserProgress[] = [];
    
    querySnapshot.forEach((doc) => {
      progress.push(doc.data() as UserProgress);
    });
    
    return progress;
  } catch (error) {
    console.error('Error getting user progress:', error);
    return [];
  }
}

export async function getSubjectProgress(userId: string, subjectId: string) {
  try {
    if (!db) {
      console.error('Firebase Firestore not initialized');
      return null;
    }
    
    const progressRef = doc(db, 'userProgress', `${userId}_${subjectId}`);
    const docSnap = await getDoc(progressRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProgress;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting subject progress:', error);
    return null;
  }
}

// Chat History Operations
export async function saveChatMessage(message: ChatMessage) {
  try {
    if (!db) {
      console.error('Firebase Firestore not initialized');
      return { success: false, error: 'Firestore not initialized' };
    }
    
    const messagesCollection = getCollection('chatMessages');
    if (!messagesCollection) {
      return { success: false, error: 'Failed to get messages collection' };
    }
    
    // Add the message
    const docRef = await addDoc(messagesCollection, {
      ...message,
      timestamp: serverTimestamp(),
    });
    
    // Update user progress to increment message count
    const progressRef = doc(db, 'userProgress', `${message.userId}_${message.subjectId}`);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      const progressData = progressDoc.data() as UserProgress;
      await updateDoc(progressRef, {
        messagesCount: (progressData.messagesCount || 0) + 1,
        lastAccessed: serverTimestamp(),
      });
    }
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving chat message:', error);
    return { success: false, error };
  }
}

export async function getChatHistory(userId: string, subjectId: string) {
  try {
    if (!db) {
      console.error('Firebase Firestore not initialized');
      return [];
    }
    
    const messagesCollection = getCollection('chatMessages');
    if (!messagesCollection) return [];
    
    const messagesQuery = query(
      messagesCollection,
      where('userId', '==', userId),
      where('subjectId', '==', subjectId),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(messagesQuery);
    const messages: ChatMessage[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ChatMessage;
      messages.push({
        ...data,
        id: doc.id
      });
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
}

/**
 * Create a new notification for a user
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<string | null> {
  try {
    if (!db) {
      console.error('Firebase Firestore not initialized');
      return null;
    }
    
    // Check if user has notifications enabled
    const userProfileRef = doc(db, 'userProfiles', notification.userId);
    const userProfileSnap = await getDoc(userProfileRef);
    
    if (userProfileSnap.exists()) {
      const userProfile = userProfileSnap.data();
      // Only create notification if user has in-app notifications enabled
      if (userProfile.preferences?.notifications !== false) {
        const notificationData: Omit<Notification, 'id'> = {
          ...notification,
          isRead: false,
          createdAt: serverTimestamp()
        };
        
        const notificationsCollection = getCollection('notifications');
        if (!notificationsCollection) return null;
        
        const docRef = await addDoc(notificationsCollection, notificationData);
        return docRef.id;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(userId: string, limitCount: number = 20): Promise<Notification[]> {
  try {
    if (!db) {
      console.error('Firebase Firestore not initialized');
      return [];
    }
    
    const notificationsCollection = getCollection('notifications');
    if (!notificationsCollection) return [];
    
    const q = query(
      notificationsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    if (!db) {
      console.error('Firebase Firestore not initialized');
      return false;
    }
    
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    if (!db) {
      console.error('Firebase Firestore not initialized');
      return false;
    }
    
    const notificationsCollection = getCollection('notifications');
    if (!notificationsCollection) return false;
    
    const notificationsQuery = query(
      notificationsCollection,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    if (querySnapshot.empty) return true; // No unread notifications
    
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
} 