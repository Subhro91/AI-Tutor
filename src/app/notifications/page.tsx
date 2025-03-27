'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/app/providers';
import Link from 'next/link';

type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'achievement' | 'streak' | 'topic' | 'weekly' | 'system';
  isRead: boolean;
  createdAt: Date;
  link?: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    async function fetchNotifications() {
      try {
        if (!user) return;
        
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        
        const notificationsList: Notification[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          notificationsList.push({
            id: doc.id,
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type,
            isRead: data.isRead,
            createdAt: data.createdAt.toDate(),
            link: data.link,
          });
        });
        
        setNotifications(notificationsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [user, router]);

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Get all unread notifications
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      // Update each notification in Firestore
      const updatePromises = unreadNotifications.map(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        return updateDoc(notificationRef, { isRead: true });
      });
      
      await Promise.all(updatePromises);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === filter);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'streak':
        return '🔥';
      case 'topic':
        return '📚';
      case 'weekly':
        return '📊';
      default:
        return '🔔';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <h1 className="heading-1 mb-6">Notifications</h1>
        <div className="w-full h-64 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="heading-1">Notifications</h1>
        <Link href="/dashboard" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex space-x-2 mb-4 sm:mb-0">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-sm ${filter === 'unread' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Unread
          </button>
          <button 
            onClick={() => setFilter('achievement')}
            className={`px-3 py-1 rounded-lg text-sm ${filter === 'achievement' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Achievements
          </button>
          <button 
            onClick={() => setFilter('streak')}
            className={`px-3 py-1 rounded-lg text-sm ${filter === 'streak' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Streaks
          </button>
        </div>
        
        <button 
          onClick={markAllAsRead}
          className="text-sm text-primary-600 font-medium"
          disabled={!notifications.some(n => !n.isRead)}
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-4">🔔</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No notifications</h3>
          <p className="text-gray-500">
            {filter !== 'all' 
              ? `You don't have any ${filter === 'unread' ? 'unread' : filter} notifications` 
              : "You don't have any notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-4 rounded-lg border ${notification.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}
              onClick={() => {
                if (!notification.isRead) {
                  markAsRead(notification.id);
                }
                if (notification.link) {
                  router.push(notification.link);
                }
              }}
            >
              <div className="flex items-start">
                <div className="mr-4 text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <span className="text-sm text-gray-500">{formatDate(notification.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 mt-1">{notification.message}</p>
                  {notification.link && (
                    <div className="mt-2">
                      <span className="text-primary-600 text-sm font-medium">
                        View details →
                      </span>
                    </div>
                  )}
                </div>
                {!notification.isRead && (
                  <div className="ml-2 h-2 w-2 bg-primary-600 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 