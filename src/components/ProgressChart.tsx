'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/app/providers';
import { getUserProgress, UserProgress } from '@/lib/firebase-db';

interface ProgressData {
  subjectId: string;
  subjectName: string;
  messagesCount: number;
  completedTopics: number;
  lastAccessed: Date | null;
}

// Map subject IDs to readable names
const subjectNames: Record<string, string> = {
  'math': 'Mathematics',
  'science': 'Science',
  'history': 'History',
  'english': 'English',
  'programming': 'Programming',
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="card flex items-center justify-center p-12">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-40 bg-gray-200 rounded-lg w-full"></div>
    </div>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="card">
    <div className="p-8 text-center">
      <h3 className="text-xl font-medium mb-3">Your Learning Journey</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        You haven't started learning any subjects yet. Choose a subject from above to begin your learning journey!
      </p>
      <div className="inline-flex items-center justify-center rounded-full bg-primary-50 p-3">
        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    </div>
  </div>
);

// Subject progress item component
const SubjectProgressItem = React.memo(({ subject }: { subject: ProgressData }) => {
  // Calculate percentage once
  const progressPercentage = Math.min(subject.completedTopics * 10, 100);
  
  return (
    <div className="border-b pb-8 last:border-b-0 last:pb-0">
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <div>
          <h4 className="font-medium text-lg">{subject.subjectName}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {subject.lastAccessed 
              ? `Last studied: ${subject.lastAccessed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : 'Not started yet'}
          </p>
        </div>
        <div className="mt-2 sm:mt-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
            {subject.completedTopics} topics completed
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-5">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Messages exchanged</p>
          <p className="text-2xl font-medium">{subject.messagesCount}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Topics completed</p>
          <p className="text-2xl font-medium">{subject.completedTopics}</p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div 
            className="bg-primary-600 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
});

SubjectProgressItem.displayName = 'SubjectProgressItem';

export default function ProgressChart() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Parse the progress data with proper error handling
  const parseUserProgress = useCallback((progress: UserProgress): ProgressData => {
    try {
      return {
        subjectId: progress.subjectId || '',
        subjectName: subjectNames[progress.subjectId] || progress.subjectId || 'Unknown Subject',
        messagesCount: progress.messagesCount || 0,
        completedTopics: Array.isArray(progress.completedTopics) ? progress.completedTopics.length : 0,
        lastAccessed: progress.lastAccessed && typeof progress.lastAccessed.toDate === 'function' 
          ? new Date(progress.lastAccessed.toDate()) 
          : null,
      };
    } catch (error) {
      console.error('Error parsing progress data:', error);
      return {
        subjectId: progress.subjectId || '',
        subjectName: 'Error',
        messagesCount: 0,
        completedTopics: 0,
        lastAccessed: null,
      };
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchUserProgress() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userProgress = await getUserProgress(user.uid);
        
        // Transform data for visualization with better error handling
        if (isMounted) {
          const formattedData = userProgress.map(parseUserProgress);
          setProgressData(formattedData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUserProgress();
    
    // Cleanup to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [user, parseUserProgress]);

  // Memoize the content to prevent unnecessary re-renders
  const content = useMemo(() => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (progressData.length === 0) {
      return <EmptyState />;
    }

    return (
      <div className="card overflow-hidden">
        <div className="p-6 md:p-8">
          <h3 className="text-xl font-medium mb-6">Learning Progress</h3>
          
          <div className="space-y-8">
            {progressData.map((subject) => (
              <SubjectProgressItem key={subject.subjectId} subject={subject} />
            ))}
          </div>
        </div>
      </div>
    );
  }, [isLoading, progressData]);

  return content;
} 