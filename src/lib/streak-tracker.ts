import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { notifyStreak } from './notification-service';

interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: Timestamp;
  streakMilestones: number[];
}

/**
 * Get the current user streak data
 */
export async function getUserStreak(userId: string): Promise<UserStreak | null> {
  try {
    const streakRef = doc(db, 'userStreaks', userId);
    const streakSnap = await getDoc(streakRef);
    
    if (streakSnap.exists()) {
      return streakSnap.data() as UserStreak;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user streak:', error);
    return null;
  }
}

/**
 * Updates the user's login streak when they log in
 */
export async function updateUserLoginStreak(userId: string): Promise<number> {
  try {
    const streakDocRef = doc(db, 'userStreaks', userId);
    const streakDocSnap = await getDoc(streakDocRef);
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalize to midnight
    
    // Create new streak record if none exists
    if (!streakDocSnap.exists()) {
      const newStreak: UserStreak = {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: Timestamp.fromDate(currentDate),
        streakMilestones: [],
      };
      
      await setDoc(streakDocRef, newStreak);
      
      // First login notification
      await notifyStreak(userId, 1);
      
      return 1;
    }
    
    // Get existing streak data
    const streakData = streakDocSnap.data() as UserStreak;
    
    // Normalize stored date to midnight for comparison
    const lastLoginDate = streakData.lastLoginDate.toDate();
    lastLoginDate.setHours(0, 0, 0, 0);
    
    // Calculate days between logins
    const diffTime = currentDate.getTime() - lastLoginDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let { currentStreak, longestStreak, streakMilestones } = streakData;
    let streakIncreased = false;
    
    // Same day login - no streak change
    if (diffDays === 0) {
      return currentStreak;
    }
    
    // Consecutive day login - increase streak
    if (diffDays === 1) {
      currentStreak += 1;
      streakIncreased = true;
    }
    // Skip in streak - reset counter
    else {
      currentStreak = 1;
    }
    
    // Update longest streak if needed
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
    
    // Save updated streak data
    await setDoc(streakDocRef, {
      userId,
      currentStreak,
      longestStreak,
      lastLoginDate: Timestamp.fromDate(currentDate),
      streakMilestones: streakMilestones || [],
    });
    
    // Notify user of milestone streak achievements
    if (streakIncreased) {
      // Important streak milestones
      if ([3, 5, 7, 10, 14, 21, 30, 60, 90, 100, 365].includes(currentStreak) && 
          !streakMilestones?.includes(currentStreak)) {
        
        // Update milestones tracking and notify
        streakMilestones = [...(streakMilestones || []), currentStreak];
        await setDoc(streakDocRef, { streakMilestones }, { merge: true });
        await notifyStreak(userId, currentStreak);
      }
    }
    
    return currentStreak;
  } catch (error) {
    console.error('Error updating user streak:', error);
    return 0;
  }
}

/**
 * Reset a user's streak (for testing)
 */
export async function resetUserStreak(userId: string): Promise<boolean> {
  try {
    const streakRef = doc(db, 'userStreaks', userId);
    
    await setDoc(streakRef, {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: null,
      streakMilestones: [],
    });
    
    return true;
  } catch (error) {
    console.error('Error resetting user streak:', error);
    return false;
  }
} 