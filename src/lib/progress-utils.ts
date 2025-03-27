import { getSubjectProgress, createOrUpdateUserProgress, getUserProgress } from './firebase-db';
import { notifyTopicCompletion, notifyAchievement } from './notification-service';
import { subjects } from './subjects-data';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { collection, getDoc, getDocs, setDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { UserProgress } from './firebase-db';

// Subject topic maps to track progress
export const subjectTopics: Record<string, string[]> = {
  math: [
    'Basic Arithmetic',
    'Algebra',
    'Geometry',
    'Trigonometry',
    'Calculus',
    'Statistics',
    'Probability',
    'Linear Algebra',
    'Discrete Mathematics',
    'Number Theory'
  ],
  science: [
    'Physics: Mechanics',
    'Physics: Electricity',
    'Chemistry: Elements',
    'Chemistry: Reactions',
    'Biology: Cells',
    'Biology: Ecosystems',
    'Astronomy',
    'Earth Science',
    'Scientific Method',
    'Lab Techniques'
  ],
  english: [
    'Grammar',
    'Vocabulary',
    'Reading Comprehension',
    'Writing Essays',
    'Literature Analysis',
    'Poetry',
    'Creative Writing',
    'Public Speaking',
    'Research Skills',
    'Critical Thinking'
  ],
  history: [
    'Ancient Civilizations',
    'Middle Ages',
    'Renaissance',
    'Industrial Revolution',
    'World War I',
    'World War II',
    'Cold War',
    'American History',
    'European History',
    'Asian History'
  ],
  programming: [
    'Programming Basics',
    'Data Types & Variables',
    'Control Structures',
    'Functions & Methods',
    'Object-Oriented Programming',
    'Data Structures',
    'Algorithms',
    'Web Development',
    'Databases',
    'Software Engineering'
  ]
};

// Topic tracking maps
const subjectKeywords: Record<string, Record<string, string[]>> = {
  math: {
    'algebra': ['equation', 'variable', 'polynomial', 'quadratic', 'linear'],
    'calculus': ['derivative', 'integral', 'limit', 'differential', 'rate of change'],
    'geometry': ['shape', 'angle', 'triangle', 'circle', 'polygon'],
    'statistics': ['probability', 'distribution', 'average', 'standard deviation', 'correlation'],
    'trigonometry': ['sine', 'cosine', 'tangent', 'angle', 'radian']
  },
  
  science: {
    'physics': ['force', 'energy', 'motion', 'quantum', 'relativity'],
    'chemistry': ['reaction', 'element', 'molecule', 'compound', 'atom', 'bond'],
    'biology': ['cell', 'dna', 'evolution', 'organism', 'protein'],
    'astronomy': ['planet', 'star', 'galaxy', 'solar system', 'black hole'],
    'geology': ['rock', 'mineral', 'plate tectonic', 'earthquake', 'volcano']
  },
  
  english: {
    'grammar': ['syntax', 'tense', 'punctuation', 'sentence', 'clause'],
    'writing': ['essay', 'paragraph', 'narrative', 'descriptive', 'persuasive'],
    'literature': ['novel', 'poem', 'character', 'theme', 'symbolism'],
    'vocabulary': ['word', 'synonym', 'antonym', 'definition', 'connotation'],
    'rhetoric': ['argument', 'persuasion', 'ethos', 'pathos', 'logos']
  },
  
  history: {
    'ancient': ['mesopotamia', 'egypt', 'rome', 'greece', 'china'],
    'medieval': ['feudal', 'castle', 'knight', 'crusade', 'monastery'],
    'renaissance': ['humanism', 'art', 'reformation', 'exploration', 'perspective'],
    'modern': ['industrial', 'revolution', 'war', 'democracy', 'nation'],
    'world-wars': ['trench', 'holocaust', 'fascism', 'allies', 'axis']
  },
  
  programming: {
    'basics': ['variable', 'loop', 'function', 'condition', 'array'],
    'data-structures': ['algorithm', 'tree', 'stack', 'queue', 'hash'],
    'web-dev': ['html', 'css', 'javascript', 'api', 'server'],
    'databases': ['sql', 'query', 'table', 'schema', 'join'],
    'machine-learning': ['model', 'training', 'neural', 'dataset', 'prediction']
  }
};

// Function to detect topics in a message
export async function detectTopicsInMessage(
  message: string, 
  subject: string,
  userId: string
): Promise<string[]> {
  // Simple keyword detection
  const lowerCaseMessage = message.toLowerCase();
  const keywords = subjectKeywords[subject] || {};
  const detectedTopics: string[] = [];
  
  Object.entries(keywords).forEach(([topic, topicKeywords]) => {
    // Check for topic keywords in message
    if (topicKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
      detectedTopics.push(topic);
    }
  });
  
  // Update progress if topics found
  if (detectedTopics.length > 0) {
    await updateUserCompletedTopics(userId, subject, detectedTopics);
  }
  
  return detectedTopics;
}

// Update user completed topics
export async function updateUserCompletedTopics(
  userId: string, 
  subjectId: string, 
  newTopics: string[]
): Promise<boolean> {
  try {
    // Get current progress
    const progress = await getUserProgress(userId);
    
    // Find subject progress record
    const subjectProgress = progress.find(p => p.subjectId === subjectId);
    
    if (subjectProgress) {
      const existingTopics = subjectProgress.completedTopics || [];
      
      // Filter out already completed topics
      const trulyNewTopics = newTopics.filter(topic => !existingTopics.includes(topic));
      
      if (trulyNewTopics.length > 0) {
        const subject = subjects.find(s => s.id === subjectId);
        if (subject) {
          // Process each newly completed topic
          for (const topicId of trulyNewTopics) {
            let topicName = topicId;
            
            // Find if this is a subtopic
            for (const topic of subject.topics) {
              const subtopic = topic.subtopics.find(st => st.id === topicId);
              if (subtopic) {
                // Send completion notification
                await notifyTopicCompletion(userId, subject.name, subtopic.title);
                break;
              }
            }
          }
          
          // Check for achievement milestones
          const updatedTotalCount = existingTopics.length + trulyNewTopics.length;
          
          // 5 topics milestone
          if (existingTopics.length < 5 && updatedTotalCount >= 5) {
            await notifyAchievement(
              userId, 
              "Fast Learner", 
              `You've completed 5 topics in ${subject.name}. Keep up the great work!`
            );
          }
          
          // 10 topics milestone
          if (existingTopics.length < 10 && updatedTotalCount >= 10) {
            await notifyAchievement(
              userId, 
              "Knowledge Explorer", 
              `You've completed 10 topics in ${subject.name}. You're making excellent progress!`
            );
          }
          
          // 25 topics milestone
          if (existingTopics.length < 25 && updatedTotalCount >= 25) {
            await notifyAchievement(
              userId, 
              "Master Student", 
              `You've completed 25 topics in ${subject.name}. You're becoming a master!`
            );
          }
        }
      }
      
      // Update complete topic list
      const allCompletedTopics = [...existingTopics, ...trulyNewTopics];
      
      // Save to database
      const progressDocRef = doc(db, 'userProgress', `${userId}_${subjectId}`);
      await updateDoc(progressDocRef, {
        completedTopics: allCompletedTopics,
        lastUpdated: Timestamp.now()
      });
      
      return true;
    } else {
      // Create new progress record
      const newProgress = {
        userId,
        subjectId,
        completedTopics: newTopics,
        lastAccessed: Timestamp.now(),
        lastUpdated: Timestamp.now(),
        createdAt: Timestamp.now()
      };
      
      await setDoc(doc(db, 'userProgress', `${userId}_${subjectId}`), newProgress);
      return true;
    }
  } catch (error) {
    console.error('Error updating user topics:', error);
    return false;
  }
} 