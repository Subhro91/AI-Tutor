import { Subject, Topic, SubTopic, Resource } from './subjects-data';
import { subjects } from './subjects-data';
import { UserProgress } from './firebase-db';

// Interface for recommendation results
export interface ContentRecommendation {
  type: 'topic' | 'subtopic' | 'resource';
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  parentTitle?: string; // For subtopics and resources
  subject: string;
  subjectId: string;
  reason: string;
}

/**
 * Recommends the next topics or resources based on user progress
 */
export function getRecommendations(
  userProgress: UserProgress[],
  userId: string,
  limit: number = 5
): ContentRecommendation[] {
  const recommendations: ContentRecommendation[] = [];
  
  // Get all subjects user has interacted with
  const userSubjectIds = userProgress.map(progress => progress.subjectId);
  
  // Map subject IDs to completed topics
  const completedTopicsBySubject = userProgress.reduce((acc, progress) => {
    acc[progress.subjectId] = progress.completedTopics || [];
    return acc;
  }, {} as Record<string, string[]>);
  
  // First, recommend topics from subjects user has already started
  userSubjectIds.forEach(subjectId => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    
    const completedTopics = completedTopicsBySubject[subjectId] || [];
    
    // Find topics that aren't completed yet
    const incompleteTopics = subject.topics.filter(topic => {
      // Check if any subtopics from this topic are in completed list
      const topicSubtopicIds = topic.subtopics.map(subtopic => subtopic.id);
      const hasCompletedAnySubtopic = topicSubtopicIds.some(id => completedTopics.includes(id));
      
      // Consider topic incomplete if user hasn't completed any subtopic
      return !hasCompletedAnySubtopic;
    });
    
    // Filter topics that have prerequisites
    const availableTopics = incompleteTopics.filter(topic => {
      // If topic has no prerequisites, it's available
      if (!topic.prerequisiteTopicIds || topic.prerequisiteTopicIds.length === 0) {
        return true;
      }
      
      // Topic is available if all prerequisites are completed
      return topic.prerequisiteTopicIds.every(prereqId => {
        const prereqTopic = subject.topics.find(t => t.id === prereqId);
        if (!prereqTopic) return true; // If prerequisite not found, consider it met
        
        const prereqSubtopicIds = prereqTopic.subtopics.map(subtopic => subtopic.id);
        // Consider prerequisite met if at least one subtopic is completed
        return prereqSubtopicIds.some(id => completedTopics.includes(id));
      });
    });
    
    // Add topic recommendations
    availableTopics.slice(0, 2).forEach(topic => {
      recommendations.push({
        type: 'topic',
        id: topic.id,
        title: topic.title,
        description: topic.description,
        difficulty: topic.difficulty,
        subject: subject.name,
        subjectId: subject.id,
        reason: 'Based on your current progress'
      });
      
      // Also recommend first subtopic of each topic
      if (topic.subtopics.length > 0) {
        const firstSubtopic = topic.subtopics[0];
        recommendations.push({
          type: 'subtopic',
          id: firstSubtopic.id,
          title: firstSubtopic.title,
          description: firstSubtopic.description,
          difficulty: topic.difficulty,
          parentTitle: topic.title,
          subject: subject.name,
          subjectId: subject.id,
          reason: 'Next step in your learning path'
        });
      }
    });
    
    // Find partially completed topics
    const partiallyCompletedTopics = subject.topics.filter(topic => {
      const topicSubtopicIds = topic.subtopics.map(subtopic => subtopic.id);
      const completedSubtopics = topicSubtopicIds.filter(id => completedTopics.includes(id));
      
      // Topic is partially completed if some but not all subtopics are completed
      return completedSubtopics.length > 0 && completedSubtopics.length < topicSubtopicIds.length;
    });
    
    // For partially completed topics, recommend next subtopic
    partiallyCompletedTopics.forEach(topic => {
      const topicSubtopicIds = topic.subtopics.map(subtopic => subtopic.id);
      const completedSubtopicIds = topicSubtopicIds.filter(id => completedTopics.includes(id));
      
      // Find the first subtopic not completed
      const nextSubtopic = topic.subtopics.find(subtopic => !completedSubtopicIds.includes(subtopic.id));
      
      if (nextSubtopic) {
        recommendations.push({
          type: 'subtopic',
          id: nextSubtopic.id,
          title: nextSubtopic.title,
          description: nextSubtopic.description,
          difficulty: topic.difficulty,
          parentTitle: topic.title,
          subject: subject.name,
          subjectId: subject.id,
          reason: 'Continue where you left off'
        });
      }
    });
  });
  
  // If user hasn't started any subjects or recommendations are too few, 
  // suggest beginner topics from other subjects
  if (recommendations.length < limit) {
    const unusedSubjects = subjects.filter(subject => !userSubjectIds.includes(subject.id));
    
    unusedSubjects.forEach(subject => {
      // Find beginner topics
      const beginnerTopics = subject.topics.filter(topic => topic.difficulty === 'beginner');
      
      if (beginnerTopics.length > 0) {
        const firstTopic = beginnerTopics[0];
        
        recommendations.push({
          type: 'topic',
          id: firstTopic.id,
          title: firstTopic.title,
          description: firstTopic.description,
          difficulty: firstTopic.difficulty,
          subject: subject.name,
          subjectId: subject.id,
          reason: 'Explore a new subject'
        });
      }
    });
  }
  
  // If there are still not enough recommendations, add popular resources
  if (recommendations.length < limit) {
    // Find resources from beginner topics
    subjects.forEach(subject => {
      const beginnerTopics = subject.topics.filter(topic => topic.difficulty === 'beginner');
      
      beginnerTopics.slice(0, 1).forEach(topic => {
        topic.subtopics.slice(0, 1).forEach(subtopic => {
          subtopic.resources.slice(0, 1).forEach(resource => {
            recommendations.push({
              type: 'resource',
              id: `${subtopic.id}-${resource.title.toLowerCase().replace(/\s+/g, '-')}`,
              title: resource.title,
              description: resource.description,
              difficulty: resource.difficulty,
              parentTitle: subtopic.title,
              subject: subject.name,
              subjectId: subject.id,
              reason: 'Popular resource for beginners'
            });
          });
        });
      });
    });
  }
  
  // Return limited number of recommendations, avoid duplicates based on ID
  const uniqueRecommendations = Array.from(
    new Map(recommendations.map(item => [item.id, item])).values()
  );
  
  return uniqueRecommendations.slice(0, limit);
}

/**
 * Get resources for a specific subtopic
 */
export function getResourcesForSubtopic(
  subjectId: string,
  topicId: string,
  subtopicId: string
): Resource[] {
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return [];
  
  const topic = subject.topics.find(t => t.id === topicId);
  if (!topic) return [];
  
  const subtopic = topic.subtopics.find(st => st.id === subtopicId);
  if (!subtopic) return [];
  
  return subtopic.resources;
}

/**
 * Get next logical subtopic based on current progress
 */
export function getNextSubtopic(
  subjectId: string,
  currentSubtopicId: string
): SubTopic | null {
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return null;
  
  // Find the topic containing current subtopic
  let currentTopic: Topic | undefined;
  let currentSubtopicIndex = -1;
  
  for (const topic of subject.topics) {
    const subtopicIndex = topic.subtopics.findIndex(st => st.id === currentSubtopicId);
    if (subtopicIndex !== -1) {
      currentTopic = topic;
      currentSubtopicIndex = subtopicIndex;
      break;
    }
  }
  
  if (!currentTopic || currentSubtopicIndex === -1) return null;
  
  // If there's another subtopic in the same topic, return that
  if (currentSubtopicIndex < currentTopic.subtopics.length - 1) {
    return currentTopic.subtopics[currentSubtopicIndex + 1];
  }
  
  // Otherwise, find the next topic and its first subtopic
  const currentTopicIndex = subject.topics.findIndex(t => t.id === currentTopic!.id);
  if (currentTopicIndex === -1 || currentTopicIndex >= subject.topics.length - 1) return null;
  
  const nextTopic = subject.topics[currentTopicIndex + 1];
  if (nextTopic.subtopics.length === 0) return null;
  
  return nextTopic.subtopics[0];
} 