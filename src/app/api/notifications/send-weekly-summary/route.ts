import { NextResponse } from 'next/server';
import { notifyWeeklySummary } from '@/lib/notification-service';
import { getAuth } from 'firebase-admin/auth';
import initAdminApp, { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Mark route as dynamic since it uses request headers
export const dynamic = 'force-dynamic';

// Initialize Firebase Admin if not already initialized
initAdminApp();

// Function to get date from 7 days ago
function getDateFromDaysAgo(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function POST(req: Request) {
  try {
    // Improved security - verify authentication token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token is valid
    try {
      // For server-to-server communication: 
      // If this is called by another server service, use a specific API key
      if (token === process.env.NOTIFICATIONS_API_KEY) {
        // Valid server API key
        if (!process.env.NOTIFICATIONS_API_KEY || process.env.NOTIFICATIONS_API_KEY === 'dev-notifications-key') {
          console.warn('Warning: Using default API key in production is not secure');
        }
      } else {
        // For client access, verify Firebase Auth token
        await getAuth().verifyIdToken(token);
        // Additional check could be done here to ensure user has admin privileges
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - invalid token' },
        { status: 401 }
      );
    }

    // Make sure we have a valid database reference
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return NextResponse.json(
        { error: 'Internal server error - database not available' },
        { status: 500 }
      );
    }

    // Query all user profiles with notifications enabled
    const userProfilesSnapshot = await adminDb.collection('userProfiles').get();

    if (userProfilesSnapshot.empty) {
      return NextResponse.json(
        { message: 'No users found for weekly summary' },
        { status: 200 }
      );
    }

    const oneWeekAgo = getDateFromDaysAgo(7);
    
    // Process each user
    let successCount = 0;
    let errorCount = 0;
    
    for (const userDoc of userProfilesSnapshot.docs) {
      const userData = userDoc.data();
      
      // Skip users who have opted out of notifications
      if (userData.preferences?.notifications === false) {
        continue;
      }
      
      try {
        const userId = userDoc.id;
        
        // Get user progress from the past week
        const progressSnapshot = await adminDb
          .collection('userProgress')
          .where('userId', '==', userId)
          .where('lastAccessed', '>=', Timestamp.fromDate(oneWeekAgo))
          .get();
        
        // Calculate weekly metrics
        let messagesCount = 0;
        let topicsCompleted = 0;
        let minutesStudied = 0; // This would need to be tracked elsewhere
        
        progressSnapshot.forEach(doc => {
          const progressData = doc.data();
          messagesCount += progressData.messagesCount || 0;
          topicsCompleted += (progressData.completedTopics?.length || 0);
          
          // Calculate minutes studied (this is a placeholder - you would need to track this)
          minutesStudied += (progressData.studyMinutes || 0);
        });
        
        // Only send notifications if the user has been active
        if (messagesCount > 0 || topicsCompleted > 0 || minutesStudied > 0) {
          await notifyWeeklySummary(userId, {
            messagesCount, 
            topicsCompleted, 
            minutesStudied
          });
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing weekly summary for user ${userDoc.id}:`, error);
        errorCount++;
      }
    }
    
    return NextResponse.json({
      message: 'Weekly summary notifications processed',
      stats: {
        success: successCount,
        errors: errorCount,
        total: userProfilesSnapshot.size
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing weekly summaries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 