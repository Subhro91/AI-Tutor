import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './firebase';
import { uploadFileWithCORS } from './storage-helper';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  createdAt?: Timestamp;
  lastUpdated?: Timestamp;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
  };
  learningGoals?: {
    dailyGoalMinutes?: number;
    weeklyGoalDays?: number;
    focusSubjects?: string[];
  };
}

/**
 * Get a user's profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'userProfiles', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Create a new user profile
 */
export async function createUserProfile(profile: UserProfile): Promise<boolean> {
  try {
    const userRef = doc(db, 'userProfiles', profile.uid);
    
    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      preferences: profile.preferences || {
        notifications: true,
        emailUpdates: true
      },
      learningGoals: profile.learningGoals || {
        dailyGoalMinutes: 30,
        weeklyGoalDays: 5,
        focusSubjects: []
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
}

/**
 * Update user profile information
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  try {
    const userRef = doc(db, 'userProfiles', userId);
    
    await updateDoc(userRef, {
      ...updates,
      lastUpdated: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

/**
 * Upload a profile photo to Firebase Storage
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File
): Promise<string | null> {
  try {
    // Use the new CORS-friendly upload helper
    const downloadURL = await uploadFileWithCORS(
      `profilePhotos/${userId}`,
      file,
      (progress) => {
        console.log('Upload progress: ' + progress + '%');
      }
    );
    
    if (downloadURL) {
      // Update the user profile with the new photo URL
      await updateUserProfile(userId, { photoURL: downloadURL });
      return downloadURL;
    }
    
    return null;
  } catch (error) {
    console.error('Error in profile photo upload process:', error);
    return null;
  }
}

/**
 * Delete a profile photo from Firebase Storage
 */
export async function deleteProfilePhoto(userId: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, `profilePhotos/${userId}`);
    
    await deleteObject(storageRef);
    
    // Update user profile to remove photo URL
    await updateUserProfile(userId, { photoURL: '' });
    
    return true;
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    return false;
  }
}

/**
 * Update user learning goals
 */
export async function updateLearningGoals(
  userId: string,
  goals: UserProfile['learningGoals']
): Promise<boolean> {
  try {
    const userRef = doc(db, 'userProfiles', userId);
    
    await updateDoc(userRef, {
      learningGoals: goals,
      lastUpdated: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating learning goals:', error);
    return false;
  }
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: UserProfile['preferences']
): Promise<boolean> {
  try {
    const userRef = doc(db, 'userProfiles', userId);
    
    await updateDoc(userRef, {
      preferences: preferences,
      lastUpdated: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
} 