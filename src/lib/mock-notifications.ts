/**
 * Mock notifications data for development when Firebase Admin is not configured
 */

export type MockNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'achievement' | 'streak' | 'topic' | 'weekly' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
};

/**
 * Generate mock notifications for a user
 */
export function getMockNotifications(userId: string, limit: number = 10): MockNotification[] {
  const baseNotifications: MockNotification[] = [
    {
      id: 'mock1',
      userId,
      title: 'Welcome to AI Tutor!',
      message: 'Thanks for joining. Explore different subjects to get started.',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/dashboard'
    },
    {
      id: 'mock2',
      userId,
      title: 'You started a learning streak!',
      message: 'Keep learning daily to build your streak.',
      type: 'streak',
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'mock3',
      userId,
      title: 'New math content available',
      message: 'Check out new algebra lessons and practice exercises.',
      type: 'topic',
      isRead: true, 
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      link: '/subjects/math'
    },
    {
      id: 'mock4',
      userId,
      title: '3-day streak achieved!',
      message: 'Congratulations on your consistent learning. Keep it up!',
      type: 'achievement',
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'mock5',
      userId,
      title: 'Weekly Progress Summary',
      message: 'You spent 2 hours learning this week across 3 subjects.',
      type: 'weekly',
      isRead: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      link: '/profile'
    }
  ];
  
  // Return limited number of notifications
  return baseNotifications.slice(0, limit);
} 