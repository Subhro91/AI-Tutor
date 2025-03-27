'use client';

import { Suspense, useEffect } from 'react'
import type { User } from 'firebase/auth'
import ProgressChart from '@/components/ProgressChart'
import ContentRecommendations from '@/components/ContentRecommendations'
import SubjectCards from './subject-cards'
import StreakDisplay from './streak-display'
import { useAuth } from '@/app/providers';
import ContentLoader from '@/components/ContentLoader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import PageWrapper from '@/components/PageWrapper';

// Static parts of the page for quick rendering
function WelcomeSection() {
  return (
    <div className="mb-8 max-w-2xl">
      <h1 className="text-4xl font-medium mb-4 tracking-tight">
        Welcome to your learning journey
      </h1>
      <p className="text-gray-600 text-lg">
        Choose a subject to begin your personalized learning experience with AI Tutor
      </p>
    </div>
  );
}

// Loading UI for Suspense boundaries
function LoadingComponent() {
  return <ContentLoader type="card" count={1} />;
}

// Main dashboard component
export default function Dashboard() {
  const { user, loading, streakCount } = useAuth();
  const router = useRouter();
  
  // Prefetch likely navigation paths for instant navigation
  useEffect(() => {
    if (!user) return;
    
    // Prefetch most common routes
    router.prefetch('/profile');
    router.prefetch('/notifications');
    
    // Prefetch subject paths based on user's history
    // These are the most commonly accessed subjects
    router.prefetch('/subjects/math');
    router.prefetch('/subjects/science');
  }, [router, user]);
  
  // Show loading UI while auth state is being determined
  if (loading) {
    return (
      <div className="container-custom py-10">
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" text="Loading your dashboard..." />
        </div>
      </div>
    );
  }
  
  return (
    <PageWrapper>
      <div className="container-custom py-10">
        <WelcomeSection />
        
        <Suspense fallback={<LoadingComponent />}>
          <StreakDisplay streakCount={streakCount || 0} />
        </Suspense>
        
        {/* Content Recommendations */}
        <Suspense fallback={<ContentLoader type="card" count={2} />}>
          <section className="section-spacing">
            <ContentRecommendations />
          </section>
        </Suspense>
        
        {/* Subject Cards */}
        <Suspense fallback={<ContentLoader type="card" count={3} />}>
          <SubjectCards />
        </Suspense>
        
        {/* Progress Summary */}
        <Suspense fallback={<ContentLoader type="card" count={1} />}>
          <section className="section-spacing">
            <h2 className="text-2xl font-medium mb-6 tracking-tight">Your Learning Progress</h2>
            <ProgressChart />
          </section>
        </Suspense>
      </div>
    </PageWrapper>
  );
} 