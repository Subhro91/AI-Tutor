'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { subjects } from '@/lib/subjects-data';
import { Button } from '@/components/ui/button';
import PageWrapper from '@/components/PageWrapper';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useEffect } from 'react';

export default function SubjectsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  const handleSubjectClick = (subjectId: string) => {
    router.push(`/subjects/${subjectId}`);
  };
  
  const handleStartTutoring = (subjectId: string) => {
    router.push(`/tutoring/${subjectId}`);
  };
  
  if (loading) {
    return (
      <div className="container-custom py-10">
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" text="Loading subjects..." />
        </div>
      </div>
    );
  }
  
  return (
    <PageWrapper>
      <div className="container-custom py-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-4xl font-medium mb-4 tracking-tight">
            All Subjects
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Explore our range of subjects and find what interests you the most
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subjects.map((subject) => (
            <div 
              key={subject.id} 
              className="subject-card" 
              style={{ borderLeft: `4px solid ${subject.color}` }}
            >
              <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">{subject.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{subject.description}</p>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {subject.topics.length} topics • {subject.topics.reduce((count, topic) => count + topic.subtopics.length, 0)} lessons
              </div>
              
              <div className="mb-6">
                <div className="font-medium text-sm mb-2 dark:text-gray-200">Topics include:</div>
                <ul className="pl-5 list-disc space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                  {subject.topics.slice(0, 3).map(topic => (
                    <li key={topic.id}>{topic.title}</li>
                  ))}
                  {subject.topics.length > 3 && <li>And more...</li>}
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <Button 
                  className="flex-1" 
                  onClick={() => handleSubjectClick(subject.id)}
                >
                  View Learning Path
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => handleStartTutoring(subject.id)}
                >
                  Start Tutoring
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
} 