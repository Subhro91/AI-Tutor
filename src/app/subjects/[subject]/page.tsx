'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { subjects } from '@/lib/subjects-data';
import { getSubjectProgress } from '@/lib/firebase-db';
import LearningPath from '@/components/LearningPath';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSwipe } from '@/hooks/useSwipe';

export default function SubjectPage() {
  const { subject: subjectId } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [activeSubtopicIndex, setActiveSubtopicIndex] = useState(0);
  
  // Find subject data
  const subject = subjects.find(s => s.id === subjectId);
  
  // Redirect if subject not found
  useEffect(() => {
    if (!loading && !subject) {
      router.push('/dashboard');
    }
  }, [subject, loading, router]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  // Fetch user's progress for this subject
  useEffect(() => {
    async function fetchProgress() {
      if (!user || !subjectId) return;
      
      try {
        setIsLoading(true);
        const progress = await getSubjectProgress(user.uid, subjectId as string);
        
        if (progress) {
          setCompletedTopics(progress.completedTopics || []);
        }
      } catch (error) {
        console.error('Error fetching subject progress:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProgress();
  }, [user, subjectId]);
  
  // Handle swipe for topics
  const navigateToPrevTopic = () => {
    if (!subject) return;
    if (activeTopicIndex > 0) {
      setActiveTopicIndex(activeTopicIndex - 1);
      setActiveSubtopicIndex(0);
    }
  };

  const navigateToNextTopic = () => {
    if (!subject) return;
    if (activeTopicIndex < subject.topics.length - 1) {
      setActiveTopicIndex(activeTopicIndex + 1);
      setActiveSubtopicIndex(0);
    }
  };

  // Handle swipe for subtopics
  const navigateToPrevSubtopic = () => {
    const currentTopic = subject?.topics[activeTopicIndex];
    if (!currentTopic) return;
    
    if (activeSubtopicIndex > 0) {
      setActiveSubtopicIndex(activeSubtopicIndex - 1);
    } else if (activeTopicIndex > 0) {
      // If at the first subtopic, go to the previous topic's last subtopic
      const prevTopic = subject.topics[activeTopicIndex - 1];
      setActiveTopicIndex(activeTopicIndex - 1);
      setActiveSubtopicIndex(prevTopic.subtopics.length - 1);
    }
  };

  const navigateToNextSubtopic = () => {
    const currentTopic = subject?.topics[activeTopicIndex];
    if (!currentTopic) return;
    
    if (activeSubtopicIndex < currentTopic.subtopics.length - 1) {
      setActiveSubtopicIndex(activeSubtopicIndex + 1);
    } else if (activeTopicIndex < subject.topics.length - 1) {
      // If at the last subtopic, go to the next topic's first subtopic
      setActiveTopicIndex(activeTopicIndex + 1);
      setActiveSubtopicIndex(0);
    }
  };

  // Setup swipe handlers
  const topicSwipeHandlers = useSwipe({
    onSwipeLeft: navigateToNextTopic,
    onSwipeRight: navigateToPrevTopic,
    threshold: 50,
  });
  
  const subtopicSwipeHandlers = useSwipe({
    onSwipeLeft: navigateToNextSubtopic,
    onSwipeRight: navigateToPrevSubtopic,
    threshold: 50,
  });
  
  const handleStartLearning = () => {
    if (!subject) return;
    
    // Find first available topic and subtopic
    const firstTopic = subject.topics[0];
    if (firstTopic && firstTopic.subtopics.length > 0) {
      const firstSubtopic = firstTopic.subtopics[0];
      router.push(`/tutoring/${subject.id}?topic=${firstTopic.id}&subtopic=${firstSubtopic.id}`);
    } else {
      router.push(`/tutoring/${subject.id}`);
    }
  };
  
  if (loading || isLoading || !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading subject information...</p>
      </div>
    );
  }
  
  const currentTopic = subject.topics[activeTopicIndex];
  const currentSubtopic = currentTopic?.subtopics[activeSubtopicIndex];

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 
            className="text-3xl font-bold mb-2 dark:text-gray-100" 
            style={{ color: subject.color }}
          >
            {subject.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{subject.description}</p>
        </div>
        
        <Button 
          className="px-6 py-2"
          onClick={handleStartLearning}
        >
          Start Learning
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <LearningPath subject={subject} completedTopics={completedTopics} />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">About this Subject</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">What you'll learn</h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700 dark:text-gray-300">
              {subject.topics.slice(0, 5).map(topic => (
                <li key={topic.id}>{topic.title}</li>
              ))}
              {subject.topics.length > 5 && <li>And more...</li>}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Prerequisites</h3>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              {subject.topics.some(t => t.prerequisiteTopicIds && t.prerequisiteTopicIds.length > 0)
                ? "Some topics in this subject have prerequisites. These will be unlocked as you progress."
                : "No prerequisites needed for this subject. Start learning right away!"}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Learning Format</h3>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              This subject is divided into topics and subtopics. Each subtopic includes key points, 
              resources, and practice materials. Your AI tutor will guide you through the content
              and answer your questions in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Topics Navigation - Desktop */}
      <div className="hidden md:flex mb-4 border-b dark:border-gray-700">
        {subject.topics.map((topic, index) => (
          <button
            key={topic.id}
            className={`px-4 py-2 font-medium ${
              index === activeTopicIndex 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => {
              setActiveTopicIndex(index);
              setActiveSubtopicIndex(0);
            }}
          >
            {topic.title}
          </button>
        ))}
      </div>

      {/* Topics Navigation - Mobile (with swipe) */}
      <div 
        className="md:hidden mb-4 relative"
        {...topicSwipeHandlers}
      >
        <div className="flex justify-between items-center">
          <button 
            className="p-2"
            onClick={navigateToPrevTopic}
            disabled={activeTopicIndex === 0}
          >
            <svg className={`w-5 h-5 ${activeTopicIndex === 0 ? 'text-gray-300 dark:text-gray-700' : 'text-gray-600 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <span className="font-medium dark:text-gray-200">
            Topic {activeTopicIndex + 1} of {subject.topics.length}
          </span>
          
          <button 
            className="p-2"
            onClick={navigateToNextTopic}
            disabled={activeTopicIndex === subject.topics.length - 1}
          >
            <svg className={`w-5 h-5 ${activeTopicIndex === subject.topics.length - 1 ? 'text-gray-300 dark:text-gray-700' : 'text-gray-600 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="text-center my-2">
          <span className="font-medium text-lg dark:text-gray-200">{currentTopic.title}</span>
        </div>
      </div>

      {/* Topic Content */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="dark:text-gray-100">{currentTopic.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 dark:text-gray-300">{currentTopic.description}</p>
            
            <h3 className="font-semibold text-lg mb-3 dark:text-gray-100">Subtopics</h3>
            
            {/* Subtopics Navigation - Desktop */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentTopic.subtopics.map((subtopic, index) => (
                  <button
                    key={subtopic.id}
                    className={`p-3 rounded-lg text-left ${
                      index === activeSubtopicIndex
                        ? 'bg-primary-100 text-primary-800 border border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800'
                        : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setActiveSubtopicIndex(index)}
                  >
                    <div className="font-medium">{subtopic.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {subtopic.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtopics Navigation - Mobile (with swipe) */}
            <div 
              className="md:hidden"
              {...subtopicSwipeHandlers}
            >
              <div className="flex justify-between items-center mb-2">
                <button 
                  className="p-2"
                  onClick={navigateToPrevSubtopic}
                  disabled={activeSubtopicIndex === 0 && activeTopicIndex === 0}
                >
                  <svg className={`w-5 h-5 ${activeSubtopicIndex === 0 && activeTopicIndex === 0 ? 'text-gray-300 dark:text-gray-700' : 'text-gray-600 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="font-medium text-sm dark:text-gray-300">
                  Lesson {activeSubtopicIndex + 1} of {currentTopic.subtopics.length}
                </span>
                
                <button 
                  className="p-2"
                  onClick={navigateToNextSubtopic}
                  disabled={
                    activeSubtopicIndex === currentTopic.subtopics.length - 1 && 
                    activeTopicIndex === subject.topics.length - 1
                  }
                >
                  <svg className={`w-5 h-5 ${activeSubtopicIndex === currentTopic.subtopics.length - 1 && activeTopicIndex === subject.topics.length - 1 ? 'text-gray-300 dark:text-gray-700' : 'text-gray-600 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <h4 className="font-medium text-primary-900 dark:text-primary-300 mb-1">{currentSubtopic.title}</h4>
                <p className="text-sm text-primary-800 dark:text-primary-200">{currentSubtopic.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Subtopic Content */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="dark:text-gray-100">{currentSubtopic.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none dark:prose-invert">
              <p>{currentSubtopic.description}</p>
              
              <h3>Key Points</h3>
              <ul>
                {currentSubtopic.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href={`/tutoring/${subjectId}?topic=${currentTopic.id}&subtopic=${currentSubtopic.id}`}>
                  <Button className="w-full sm:w-auto">Start Learning This Topic</Button>
                </Link>
                
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full sm:w-auto">Back to Dashboard</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 