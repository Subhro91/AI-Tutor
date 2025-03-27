'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { getUserProgress } from '@/lib/firebase-db';
import { getRecommendations, ContentRecommendation } from '@/lib/recommendation-engine';

// Separated loading skeleton for better performance
const LoadingSkeleton = () => (
  <div className="card animate-pulse">
    <div className="h-8 bg-gray-200 rounded mb-4 w-2/3"></div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="mb-3">
        <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    ))}
  </div>
);

// Extracted recommendation item to memoized component
const RecommendationItem = React.memo(({ 
  recommendation, 
  onClick 
}: { 
  recommendation: ContentRecommendation; 
  onClick: (rec: ContentRecommendation) => void;
}) => {
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
      onClick={() => onClick(recommendation)}
    >
      <div className="flex items-start">
        {/* Icon based on type */}
        <div className="flex-shrink-0 mr-3">
          {recommendation.type === 'topic' && (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          
          {recommendation.type === 'subtopic' && (
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          )}
          
          {recommendation.type === 'resource' && (
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="text-lg font-medium">{recommendation.title}</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${
              recommendation.difficulty === 'beginner' 
                ? 'bg-green-100 text-green-800' 
                : recommendation.difficulty === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {recommendation.difficulty}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
          
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <span className="text-sm font-medium" style={{ color: `var(--${recommendation.subjectId}-color, #3182CE)` }}>
                {recommendation.subject}
              </span>
              {recommendation.parentTitle && (
                <>
                  <span className="mx-1">•</span>
                  <span>{recommendation.parentTitle}</span>
                </>
              )}
            </div>
            
            <div>
              <span className="italic">{recommendation.reason}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

RecommendationItem.displayName = 'RecommendationItem';

export default function ContentRecommendations() {
  const { user } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetch recommendations when component mounts
  useEffect(() => {
    let isMounted = true;
    
    async function fetchRecommendations() {
      if (!user) return;
      
      try {
        setLoading(true);
        const userProgress = await getUserProgress(user.uid);
        const recs = await getRecommendations(userProgress, user.uid);
        
        if (isMounted) {
          setRecommendations(recs);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchRecommendations();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [user]);
  
  // Memoized click handler to prevent re-renders
  const handleRecommendationClick = useCallback((recommendation: ContentRecommendation) => {
    if (recommendation.type === 'topic' || recommendation.type === 'subtopic') {
      // For topics or subtopics, navigate to the tutoring page
      let url = `/tutoring/${recommendation.subjectId}`;
      
      // Add query parameters if it's a subtopic
      if (recommendation.type === 'subtopic') {
        // Extract the topic ID from the subtopic ID
        // Assuming format like "math-algebra-expressions" where "math-algebra" is the topic ID
        const topicId = recommendation.id.split('-').slice(0, -1).join('-');
        url += `?topic=${topicId}&subtopic=${recommendation.id}`;
      }
      
      router.push(url);
    } else if (recommendation.type === 'resource') {
      // For resources, just navigate to the subject page for now
      router.push(`/tutoring/${recommendation.subjectId}`);
    }
  }, [router]);
  
  // Memoize content to avoid unnecessary re-renders
  const content = useMemo(() => {
    if (loading) {
      return <LoadingSkeleton />;
    }
    
    if (recommendations.length === 0) {
      return (
        <div className="card">
          <h3 className="heading-2 mb-3">Recommended for You</h3>
          <p className="paragraph">Start learning a subject to get personalized recommendations!</p>
        </div>
      );
    }
    
    return (
      <div className="card">
        <h3 className="heading-2 mb-4">Recommended for You</h3>
        
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <RecommendationItem 
              key={rec.id} 
              recommendation={rec} 
              onClick={handleRecommendationClick} 
            />
          ))}
        </div>
      </div>
    );
  }, [loading, recommendations, handleRecommendationClick]);
  
  return content;
} 