'use client';

import React, { useState } from 'react';
import { Subject, Topic, SubTopic } from '@/lib/subjects-data';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';

interface LearningPathProps {
  subject: Subject;
  completedTopics?: string[];
}

export default function LearningPath({ subject, completedTopics = [] }: LearningPathProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  
  // Initialize first topic as expanded
  useState(() => {
    if (subject.topics.length > 0) {
      setExpandedTopics(prev => ({
        ...prev,
        [subject.topics[0].id]: true
      }));
    }
  });
  
  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };
  
  const handleSubtopicClick = (topicId: string, subtopicId: string) => {
    // Navigate to tutoring page with context
    router.push(`/tutoring/${subject.id}?topic=${topicId}&subtopic=${subtopicId}`);
  };
  
  const isTopicAvailable = (topic: Topic) => {
    // If no prerequisites, topic is available
    if (!topic.prerequisiteTopicIds || topic.prerequisiteTopicIds.length === 0) {
      return true;
    }
    
    // Check if any prerequisites have been completed
    return topic.prerequisiteTopicIds.every(prereqId => {
      const prereqTopic = subject.topics.find(t => t.id === prereqId);
      if (!prereqTopic) return true;
      
      // Check if any subtopic of the prerequisite has been completed
      return prereqTopic.subtopics.some(subtopic => 
        completedTopics.includes(subtopic.id)
      );
    });
  };
  
  const isSubtopicCompleted = (subtopicId: string) => {
    return completedTopics.includes(subtopicId);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4" style={{ color: subject.color }}>
        {subject.name} Learning Path
      </h2>
      
      <div className="space-y-4">
        {subject.topics.map((topic, index) => {
          const isAvailable = isTopicAvailable(topic);
          const isExpanded = expandedTopics[topic.id] || false;
          
          // Calculate progress percentage for this topic
          const totalSubtopics = topic.subtopics.length;
          const completedSubtopics = topic.subtopics.filter(
            subtopic => isSubtopicCompleted(subtopic.id)
          ).length;
          const progressPercentage = totalSubtopics > 0
            ? Math.round((completedSubtopics / totalSubtopics) * 100)
            : 0;
          
          return (
            <div 
              key={topic.id}
              className={`border rounded-lg overflow-hidden ${
                isAvailable 
                  ? 'border-gray-200' 
                  : 'border-gray-200 bg-gray-50 opacity-75'
              }`}
            >
              {/* Topic Header */}
              <div 
                className={`p-4 flex items-center justify-between cursor-pointer ${
                  isAvailable ? 'hover:bg-gray-50' : ''
                }`}
                onClick={() => isAvailable && toggleTopic(topic.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium">{index + 1}. {topic.title}</h3>
                    <span className={`ml-3 text-xs px-2 py-1 rounded-full ${
                      topic.difficulty === 'beginner' 
                        ? 'bg-green-100 text-green-800' 
                        : topic.difficulty === 'intermediate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {topic.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {completedSubtopics} of {totalSubtopics} complete ({progressPercentage}%)
                  </p>
                </div>
                
                <div className="ml-4">
                  {isAvailable ? (
                    <button className={`p-1 rounded transition-transform duration-200 ${
                      isExpanded ? 'transform rotate-180' : ''
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
              </div>
              
              {/* Subtopics (Collapsed/Expanded) */}
              {isAvailable && isExpanded && (
                <div className="border-t border-gray-200 divide-y divide-gray-200">
                  {topic.subtopics.map((subtopic, subtopicIndex) => {
                    const isCompleted = isSubtopicCompleted(subtopic.id);
                    
                    return (
                      <div 
                        key={subtopic.id}
                        className={`p-4 pl-8 hover:bg-gray-50 ${
                          isCompleted ? 'bg-green-50' : ''
                        }`}
                        onClick={() => handleSubtopicClick(topic.id, subtopic.id)}
                      >
                        <div className="flex items-start">
                          <div 
                            className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                              isCompleted 
                                ? 'bg-green-500 text-white' 
                                : 'border border-gray-300 bg-white'
                            }`}
                          >
                            {isCompleted && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          
                          <div>
                            <h4 className={`text-base font-medium ${isCompleted ? 'text-green-700' : ''}`}>
                              {index + 1}.{subtopicIndex + 1} {subtopic.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{subtopic.description}</p>
                            
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">
                                {subtopic.keyPoints.length} key points • {subtopic.resources.length} learning resources
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 