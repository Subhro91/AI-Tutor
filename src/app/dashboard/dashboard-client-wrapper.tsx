'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/app/providers';
import { getUserProgress } from '@/lib/firebase-db';
import type { User } from 'firebase/auth';

type DashboardClientWrapperProps = {
  children: (user: User | null, streakCount: number) => ReactNode;
};

export default function DashboardClientWrapper({ children }: DashboardClientWrapperProps) {
  const { user, loading, streakCount } = useAuth();
  const [hasProgress, setHasProgress] = useState<boolean>(false);
  
  // Check if user has any progress data
  useEffect(() => {
    const checkProgress = async () => {
      if (!user) return;
      
      try {
        const progress = await getUserProgress(user.uid);
        setHasProgress(progress.length > 0);
      } catch (error) {
        console.error('Error checking progress:', error);
      }
    };
    
    checkProgress();
  }, [user]);

  // During loading, show a minimal skeleton
  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-12 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Ensure we're calling the children function, not just passing it as a child
  // Add type check to make sure children is a function before calling it
  if (typeof children !== 'function') {
    console.error('DashboardClientWrapper expects children to be a function');
    return <div>Error: Invalid children prop</div>;
  }
  
  // Call the children function with user and streakCount
  try {
    const childContent = children(user, streakCount || 0);
    return <>{childContent}</>;
  } catch (error) {
    console.error('Error rendering dashboard content:', error);
    return <div>Something went wrong displaying your dashboard</div>;
  }
} 