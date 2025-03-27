'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import ChatHistory from '@/components/ChatHistory'
import ChatInput from '@/components/ChatInput'
import { saveChatMessage, createOrUpdateUserProgress, getSubjectProgress } from '@/lib/firebase-db'
import { generateTutorPrompt } from '@/lib/subject-prompts'
import { subjects, SubTopic, Topic } from '@/lib/subjects-data'
import { updateUserCompletedTopics } from '@/lib/progress-utils'
import LoadingSpinner from '@/components/LoadingSpinner'

// Message types
type MessageRole = 'user' | 'assistant' | 'system'

interface Message {
  role: MessageRole
  content: string
  timestamp: Date
}

export default function TutoringPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const subject = params.subject as string
  const topicId = searchParams.get('topic')
  const subtopicId = searchParams.get('subtopic')
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [subjectData, setSubjectData] = useState<{
    name: string;
    topic?: Topic;
    subtopic?: SubTopic;
  } | null>(null)
  const [exampleQuestions, setExampleQuestions] = useState<string[]>([])
  const [refreshChat, setRefreshChat] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Load subject, topic and subtopic data
  useEffect(() => {
    if (subject) {
      const subjectObj = subjects.find(s => s.id === subject)
      if (subjectObj) {
        const result: { name: string; topic?: Topic; subtopic?: SubTopic } = {
          name: subjectObj.name
        }
        
        // Find topic if specified
        if (topicId) {
          const topic = subjectObj.topics.find(t => t.id === topicId)
          if (topic) {
            result.topic = topic
            
            // Find subtopic if specified
            if (subtopicId) {
              const subtopic = topic.subtopics.find(st => st.id === subtopicId)
              if (subtopic) {
                result.subtopic = subtopic
              }
            }
          }
        }
        
        setSubjectData(result)
        
        // Get AI tutor prompt with example questions
        const tutorPrompt = generateTutorPrompt(subject, topicId || undefined, subtopicId || undefined)
        setExampleQuestions(tutorPrompt.exampleQuestions)
      }
    }
  }, [subject, topicId, subtopicId])

  // Initialize user progress when session starts
  useEffect(() => {
    if (user && subject) {
      // Initialize or update user progress for this subject
      const initializeProgress = async () => {
        try {
          const progress = await getSubjectProgress(user.uid, subject)
          
          await createOrUpdateUserProgress({
            userId: user.uid,
            subjectId: subject,
            lastAccessed: null, // Will be set by serverTimestamp() in the function
            messagesCount: progress?.messagesCount || 0,
            completedTopics: progress?.completedTopics || []
          });
        } catch (error) {
          console.error('Error initializing progress:', error);
        }
      };
      
      initializeProgress();
    }
  }, [user, subject]);

  // Remove the unnecessary auto-scroll effect since ChatHistory handles this now
  useEffect(() => {
    // This comment is left intentionally to indicate that scrolling is 
    // now fully managed by the ChatHistory component
  }, [messages]);

  const handleMessageSent = async (messageContent: string) => {
    // Add message to local state for immediate display
    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    }
    
    // First update the local state
    setMessages((prev) => [...prev, userMessage])
    
    // Then force refresh the chat history immediately to reflect the user message
    setRefreshChat(prev => prev + 1)
    
    setIsProcessing(true)
    
    try {
      // Get subject-specific prompt
      const tutorPrompt = generateTutorPrompt(subject, topicId || undefined, subtopicId || undefined)
      
      // Use the last 10 messages for context (to avoid token limits)
      const recentMessages = messages.slice(-10);
      
      // Make real API call to the AI service
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: tutorPrompt.systemPrompt },
            ...recentMessages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: messageContent }
          ],
          subject,
          userId: user?.uid
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }
      
      const data = await response.json()
      
      // Save AI's response to Firestore
      if (user) {
        await saveChatMessage({
          content: data.message,
          role: 'assistant',
          timestamp: null, // Will be set by serverTimestamp() in the function
          subjectId: subject,
          userId: user.uid
        });
        
        // If a subtopic is being studied, mark it as completed
        if (subtopicId && topicId) {
          await updateUserCompletedTopics(user.uid, subject, [subtopicId]);
        }
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, assistantMessage])
      // Force refresh chat history to ensure all DB writes are complete
      setRefreshChat(prev => prev + 1);
      
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  // Simulate loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your tutoring session..." />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-4 min-h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold capitalize text-foreground">{subjectData?.name || subject} Tutoring</h1>
        {subjectData?.topic && (
          <div className="flex items-center mt-1">
            <span className="text-foreground font-medium">{subjectData.topic.title}</span>
            {subjectData.subtopic && (
              <>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-muted-foreground">{subjectData.subtopic.title}</span>
              </>
            )}
          </div>
        )}
        <p className="text-muted-foreground mt-1">Ask any question to get personalized help</p>
      </div>

      {/* Example questions */}
      {exampleQuestions.length > 0 && messages.length === 0 && (
        <div className="mb-4 bg-primary/5 dark:bg-primary/10 rounded-lg p-4">
          <h3 className="font-medium text-primary mb-2">Try asking:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQuestions.map((question, index) => (
              <button
                key={index}
                className="text-left text-primary bg-primary/10 hover:bg-primary/20 rounded-md px-3 py-2 text-sm transition-colors"
                onClick={() => handleMessageSent(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat container with improved scrolling */}
      <div className="flex-1 mb-4 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ChatHistory subjectId={subject} refreshChat={refreshChat} />
        </div>
      </div>

      {/* Input area */}
      <div className="mt-auto">
        <ChatInput 
          onSendMessage={handleMessageSent} 
          isProcessing={isProcessing}
          subjectId={subject}
        />
      </div>
    </div>
  )
} 