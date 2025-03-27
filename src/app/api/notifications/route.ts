import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase/firestore';
import { collection, query, orderBy, limit as firestoreLimit, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { initAdminApp } from '@/lib/firebase-admin';

interface MockNotification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Use a session-persistent mock store to simulate database behavior
const mockStore = {
  notifications: new Map<string, MockNotification>(),
  initialized: false,
  
  // Initialize mock data if not already done
  init(count = 5) {
    if (this.initialized) return;
    
    const types = ['achievement', 'streak', 'topic', 'system'];
    const messages = [
      'You completed a new lesson!',
      'You maintained a 3-day streak!',
      'New content available in Mathematics',
      'Welcome to AI Tutor!',
      'Your progress report is ready',
    ];
    
    for (let i = 0; i < count; i++) {
      const id = `mock-notification-${i}`;
      this.notifications.set(id, {
        id,
        type: types[Math.floor(Math.random() * types.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        isRead: Math.random() > 0.7,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      });
    }
    
    this.initialized = true;
  },
  
  // Get all notifications
  getNotifications(limit = 10) {
    this.init();
    return Array.from(this.notifications.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
  
  // Mark a notification as read
  markAsRead(id: string) {
    if (this.notifications.has(id)) {
      const notification = this.notifications.get(id);
      if (notification) {
        notification.isRead = true;
        this.notifications.set(id, notification);
        return true;
      }
    }
    return false;
  },
  
  // Mark all notifications as read
  markAllAsRead() {
    // Convert map entries to array for iteration
    Array.from(this.notifications.entries()).forEach(([id, notification]) => {
      notification.isRead = true;
      this.notifications.set(id, notification);
    });
    return true;
  }
};

// GET handler for fetching notifications
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam) : 10;
  
  // Get the user ID from the request header or cookie
  const authHeader = request.headers.get('authorization');
  let userId = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.substring(7);
  }
  
  // If no valid auth, return mock data
  if (!userId) {
    console.log('No valid authentication provided, using mock data');
    return NextResponse.json({
      success: true,
      data: mockStore.getNotifications(limit),
      isMockData: true
    });
  }
  
  console.log('Authenticated request for user:', userId);
  
  // Always return mock data until Firebase is properly configured
  return NextResponse.json({
    success: true,
    data: mockStore.getNotifications(limit),
    isMockData: true
  });
}

// POST handler for marking notifications as read
export async function POST(request: NextRequest) {
  try {
    const { id, markAllRead } = await request.json();
    
    // Get the user ID from the request header
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      userId = authHeader.substring(7);
    }
    
    if (markAllRead) {
      console.log('[MOCK] Marking all notifications as read');
      mockStore.markAllAsRead();
    } else if (id) {
      console.log(`[MOCK] Marking notification ${id} as read`);
      mockStore.markAsRead(id);
    }
    
    return NextResponse.json({ 
      success: true, 
      mock: true 
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 