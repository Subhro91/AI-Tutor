'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import Link from 'next/link';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { Bell } from 'lucide-react';
import { useFirebase } from '@/lib/useFirebase';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const { auth, firebaseReady } = useFirebase();
  const [token, setToken] = useState<string | null>(null);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  
  // Use ref to track unread count to avoid dependency cycle
  const unreadCountRef = useRef(0);
  // Store current token to prevent unnecessary updates
  const tokenRef = useRef<string | null>(null);
  // Store local notifications to prevent unnecessary updates
  const notificationsRef = useRef<Notification[]>([]);
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Use effect for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Get auth token when available - use stable references
  useEffect(() => {
    if (!firebaseReady || !auth || !isMountedRef.current) return;
    
    // Don't make this function async to avoid race conditions
    const getToken = () => {
      // Only proceed if still mounted
      if (!isMountedRef.current) return;
      
      const fetchToken = async () => {
        try {
          if (auth.currentUser) {
            const newToken = await auth.currentUser.getIdToken();
            
            // Only update if token has changed and component is still mounted
            if (newToken && newToken !== tokenRef.current && isMountedRef.current) {
              tokenRef.current = newToken;
              setToken(newToken);
            }
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
          if (tokenRef.current !== null && isMountedRef.current) {
            tokenRef.current = null;
            setToken(null);
          }
        }
      };
      
      fetchToken();
    };
    
    getToken();
    // Stable dependencies
  }, [auth?.currentUser?.uid, firebaseReady]);

  // Create a fetcher function that includes the auth token
  const fetchWithToken = useCallback(async (url: string) => {
    if (!token) return null;
    
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      return response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }, [token]);

  // Fetch notifications using SWR with memoized config
  const swrConfig = useMemo(() => ({
    refreshInterval: 30000, // refresh every 30 seconds
    fallbackData: { success: true, data: [], isMockData: true },
    revalidateOnFocus: true,
    dedupingInterval: 5000, // 5 seconds
    revalidateIfStale: false,
    shouldRetryOnError: false,
    onSuccess: (data: { success: boolean; data: Notification[]; isMockData?: boolean }) => {
      // Preserve read status of notifications that were locally marked as read
      // but might not be updated on the server yet
      if (data?.data && notificationsRef.current.length > 0) {
        const updatedNotifications = data.data.map((notification: Notification) => {
          // Check if this notification was previously marked as read locally
          const existingNotification = notificationsRef.current.find(
            n => n.id === notification.id && n.isRead
          );
          
          // If it was marked as read locally, keep it as read regardless of server state
          if (existingNotification) {
            return { ...notification, isRead: true };
          }
          
          return notification;
        });
        
        // Only update if there's a real change (ignoring read status changes we just fixed)
        const normalizeForComparison = (notifs: Notification[]) => 
          notifs.map(n => ({ ...n, isRead: true }));
          
        if (JSON.stringify(normalizeForComparison(updatedNotifications)) !== 
            JSON.stringify(normalizeForComparison(notificationsRef.current))) {
          notificationsRef.current = updatedNotifications;
          setLocalNotifications(updatedNotifications);
        } else {
          // Even if the content hasn't changed, ensure read status is preserved
          notificationsRef.current = updatedNotifications;
          setLocalNotifications(updatedNotifications);
        }
        
        // Update unread count ref based on our corrected data
        unreadCountRef.current = updatedNotifications.filter(
          (notification: Notification) => !notification.isRead
        ).length;
        
        // Return our modified data to update the SWR cache
        return {
          ...data,
          data: updatedNotifications
        };
      }
      
      return data;
    }
  }), []);
  
  const { data, error, mutate } = useSWR(
    token ? `/api/notifications?limit=5` : null,
    fetchWithToken,
    swrConfig
  );

  // Update local state when data changes from the API - prevent unnecessary updates
  useEffect(() => {
    if (!data?.data || !isMountedRef.current) return;
    
    // The initial setting of notifications
    if (notificationsRef.current.length === 0) {
      notificationsRef.current = data.data;
      setLocalNotifications(data.data);
      
      // Update unread count ref
      unreadCountRef.current = data.data.filter(
        (notification: Notification) => !notification.isRead
      ).length;
    }
  }, [data]);
  
  // Handle loading state
  const isLoading = !data && !error;
  
  // Compute isMockData flag
  const isMockData = data?.isMockData || false;
  
  // Mark a notification as read - with stable function reference
  const markAsRead = useCallback(async (id: string) => {
    if (!token || !isMountedRef.current) return;
    
    try {
      // Update local state immediately - avoid reference changes
      setLocalNotifications(currentNotifications => {
        const updated = currentNotifications.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        );
        
        // Only update refs if there was a change
        if (JSON.stringify(updated) !== JSON.stringify(notificationsRef.current)) {
          // Update unread count ref
          unreadCountRef.current = updated.filter(n => !n.isRead).length;
          notificationsRef.current = updated;
        }
        
        return updated;
      });
      
      // Optimistically update the SWR cache to prevent flashing
      mutate(
        (oldData: { success: boolean; data: Notification[]; isMockData?: boolean } | undefined) => {
          if (!oldData || !oldData.data) return oldData;
          
          const updatedData = {
            ...oldData,
            data: oldData.data.map((notification: Notification) => 
              notification.id === id ? { ...notification, isRead: true } : notification
            )
          };
          
          return updatedData;
        },
        false // Don't revalidate from the server yet
      );
      
      // Make API call to persist the change
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      
      // Revalidate after a longer delay to ensure server has time to process
      if (isMountedRef.current) {
        setTimeout(() => isMountedRef.current && mutate(), 2000);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Don't revalidate on error to prevent read status from reverting
    }
  }, [token, mutate]);
  
  // Store markAsRead in ref to break circular dependency
  const markAsReadRef = useRef(markAsRead);
  
  useEffect(() => {
    markAsReadRef.current = markAsRead;
  }, [markAsRead]);
  
  // Mark all notifications as read - with stable function reference
  const markAllAsRead = useCallback(async () => {
    if (!token || !isMountedRef.current) return;
    
    try {
      // Only update if there are unread notifications
      if (unreadCountRef.current === 0) return;
      
      // Update local state immediately
      setLocalNotifications(currentNotifications => {
        // Only mark as read if not already all read
        if (currentNotifications.some(n => !n.isRead)) {
          const updated = currentNotifications.map(notification => ({ 
            ...notification, 
            isRead: true 
          }));
          
          // Reset unread count ref
          unreadCountRef.current = 0;
          notificationsRef.current = updated;
          return updated;
        }
        return currentNotifications;
      });
      
      // Optimistically update the SWR cache
      mutate(
        (oldData: { success: boolean; data: Notification[]; isMockData?: boolean } | undefined) => {
          if (!oldData || !oldData.data) return oldData;
          
          const updatedData = {
            ...oldData,
            data: oldData.data.map((notification: Notification) => ({ 
              ...notification, 
              isRead: true 
            }))
          };
          
          return updatedData;
        },
        false // Don't revalidate from the server yet
      );
      
      // Make API call to persist the change
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }).catch(err => {
        console.error('Error marking all notifications as read:', err);
      });
      
      // Revalidate after a longer delay to ensure server has time to process
      if (isMountedRef.current) {
        setTimeout(() => {
          if (isMountedRef.current) {
            mutate();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error in markAllAsRead function:', error);
      // Don't revalidate on error to prevent read status from reverting
    }
  }, [token, mutate]);
  
  // Store markAllAsRead in ref to break circular dependency
  const markAllAsReadRef = useRef(markAllAsRead);
  
  useEffect(() => {
    markAllAsReadRef.current = markAllAsRead;
  }, [markAllAsRead]);
  
  // Toggle notifications panel - breaking the circular dependency
  const toggleNotifications = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setShowNotifications(prev => {
      const isOpening = !prev;
      
      // If opening the panel and there are unread notifications, mark them as read
      if (isOpening && unreadCountRef.current > 0) {
        // Small delay to ensure the panel is visible first
        setTimeout(() => {
          if (isMountedRef.current && markAllAsReadRef.current) {
            markAllAsReadRef.current();
          }
        }, 300);
      }
      
      return isOpening;
    });
  }, []); // Empty dependency array to prevent recreation
  
  // Stable component render
  return (
    <div className="relative">
      <button 
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCountRef.current > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCountRef.current}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCountRef.current > 0 && (
              <button
                onClick={() => markAllAsReadRef.current?.()}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : localNotifications.length > 0 ? (
            <div>
              {localNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => markAsReadRef.current(notification.id)}
                >
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    {!notification.isRead && (
                      <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm mt-1">{notification.message}</p>
                </div>
              ))}
              
              {isMockData && (
                <div className="p-2 text-xs text-center text-gray-500 bg-gray-50 dark:bg-gray-700/50">
                  Showing sample notifications (demo mode)
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 