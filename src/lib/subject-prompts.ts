import { subjects, SubTopic, Topic } from './subjects-data';

interface TutorPrompt {
  systemPrompt: string;
  exampleQuestions: string[];
}

// Base prompt template for all subjects
const baseTutorPrompt = `
You are an AI tutor specialized in {{SUBJECT}}. Your goal is to help students learn and understand concepts in an engaging, personalized way. 
Adapt your teaching style to the student's level of understanding. If they're a beginner, use simple language and plenty of examples. 
If they show more advanced knowledge, you can provide more sophisticated explanations.

Current topic: {{TOPIC}}
Current subtopic: {{SUBTOPIC}}

Key points to cover:
{{KEY_POINTS}}

Remember to:
- Be patient and encouraging
- Use examples to illustrate concepts
- Ask questions to check understanding
- Provide step-by-step explanations for complex ideas
- Relate concepts to real-world applications when possible
- Suggest additional resources when appropriate

Start by helping the student understand the current subtopic.
`.trim();

// Subject-specific teaching approaches
const subjectPromptEnhancements: Record<string, string> = {
  math: `
When teaching mathematics:
- Show your work step-by-step for any calculations
- Use proper mathematical notation and explain the symbols used
- Encourage the student to practice with different examples
- Validate the student's approach and solution methods
- Provide visual representations of concepts when helpful (e.g., coordinate systems, graphs)
- Connect mathematical concepts to real-world applications
  `,
  
  science: `
When teaching science:
- Explain scientific phenomena clearly, relating theory to observable events
- Describe experimental evidence that supports concepts
- Use analogies to help explain complex processes
- Encourage critical thinking and the scientific method
- Address common misconceptions in science education
- Discuss how scientific discoveries impact daily life and technology
  `,
  
  english: `
When teaching English:
- Provide clear examples of grammar rules in context
- Suggest synonyms and alternative phrasings to expand vocabulary
- Help with writing structure and flow
- Analyze text passages when asked
- Encourage creative expression and critical analysis
- Model proper grammar, spelling, and punctuation in your responses
  `,
  
  history: `
When teaching history:
- Present multiple perspectives on historical events
- Emphasize causes and effects of historical developments
- Place events in their proper chronological and geographical context
- Connect historical events to contemporary situations when relevant
- Discuss primary sources and historical evidence
- Avoid presentism (judging historical events by modern standards)
  `,
  
  programming: `
When teaching programming:
- Explain code line by line with comments
- Suggest best practices and coding conventions
- Identify and explain common bugs or errors
- Provide code examples that are easy to understand
- Recommend debugging strategies when appropriate
- Explain programming concepts in real-world terms
- Always use code blocks with proper syntax highlighting
  `
};

/**
 * Generates a tailored teaching prompt based on subject and topic
 */
export function generateTutorPrompt(
  subjectId: string,
  topicId?: string,
  subtopicId?: string
): TutorPrompt {
  // Find relevant subject and topic data
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) {
    return getDefaultPrompt(subjectId);
  }
  
  let topic: Topic | undefined;
  let subtopic: SubTopic | undefined;
  
  if (topicId) {
    topic = subject.topics.find(t => t.id === topicId);
    
    if (topic && subtopicId) {
      subtopic = topic.subtopics.find(st => st.id === subtopicId);
    }
  }
  
  // Default to first topic if none specified
  if (!topic && subject.topics.length > 0) {
    topic = subject.topics[0];
    if (topic.subtopics.length > 0) {
      subtopic = topic.subtopics[0];
    }
  }
  
  // Fill in prompt template
  let prompt = baseTutorPrompt
    .replace('{{SUBJECT}}', subject.name)
    .replace('{{TOPIC}}', topic ? topic.title : 'General overview')
    .replace('{{SUBTOPIC}}', subtopic ? subtopic.title : 'Introduction');
  
  // Add key points from subtopic if available
  if (subtopic && subtopic.keyPoints.length > 0) {
    const keyPointsText = subtopic.keyPoints
      .map(point => `- ${point}`)
      .join('\n');
    
    prompt = prompt.replace('{{KEY_POINTS}}', keyPointsText);
  } else {
    prompt = prompt.replace('{{KEY_POINTS}}', 'Provide a general introduction to the topic');
  }
  
  // Add subject-specific teaching guidance
  if (subjectPromptEnhancements[subjectId]) {
    prompt += '\n\n' + subjectPromptEnhancements[subjectId];
  }
  
  // Generate example questions for this topic
  const exampleQuestions = generateExampleQuestions(
    subject.name,
    topic?.title,
    subtopic
  );
  
  return {
    systemPrompt: prompt,
    exampleQuestions
  };
}

/**
 * Creates example questions based on the learning context
 */
function generateExampleQuestions(
  subjectName: string,
  topicName?: string,
  subtopic?: SubTopic
): string[] {
  if (subtopic) {
    // Subtopic-specific questions
    return [
      `Can you explain what ${subtopic.title} means in simple terms?`,
      `What are the most important aspects of ${subtopic.title} to understand?`,
      `How does ${subtopic.title} relate to other concepts in ${topicName || subjectName}?`,
      `Can you give me an example of ${subtopic.title} in the real world?`,
      `What common mistakes do people make when learning about ${subtopic.title}?`
    ];
  } else if (topicName) {
    // Topic-level questions
    return [
      `What are the main concepts I need to understand about ${topicName}?`,
      `How should I approach learning ${topicName}?`,
      `What prerequisites should I know before studying ${topicName}?`,
      `Why is ${topicName} important in ${subjectName}?`,
      `Can you give me an overview of ${topicName}?`
    ];
  } else {
    // General subject questions
    return [
      `What topics should I start with in ${subjectName}?`,
      `What makes ${subjectName} interesting or important?`,
      `How can I build a strong foundation in ${subjectName}?`,
      `What are some practical applications of ${subjectName}?`,
      `What learning strategies work best for ${subjectName}?`
    ];
  }
}

/**
 * Fallback prompt when subject isn't found
 */
function getDefaultPrompt(subjectName: string): TutorPrompt {
  const defaultPrompt = baseTutorPrompt
    .replace('{{SUBJECT}}', subjectName)
    .replace('{{TOPIC}}', 'Introduction')
    .replace('{{SUBTOPIC}}', 'Getting started')
    .replace('{{KEY_POINTS}}', 'Provide a beginner-friendly introduction to this subject');
  
  return {
    systemPrompt: defaultPrompt,
    exampleQuestions: [
      `What is ${subjectName} about?`,
      `Why should I learn ${subjectName}?`,
      `What are the fundamental concepts in ${subjectName}?`,
      `How can I get started learning ${subjectName}?`,
      `What resources do you recommend for learning ${subjectName}?`
    ]
  };
} 