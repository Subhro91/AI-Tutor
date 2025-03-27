'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/app/providers';
import { getChatHistory, ChatMessage } from '@/lib/firebase-db';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import ContentLoader from './ContentLoader';

interface ChatHistoryProps {
  subjectId: string;
  refreshChat?: number;
}

export default function ChatHistory({ subjectId, refreshChat = 0 }: ChatHistoryProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const isAtBottomRef = useRef(true);

  // Function to check if scroll is at bottom
  const checkIfAtBottom = useCallback(() => {
    if (!chatContainerRef.current) return true;
    
    const container = chatContainerRef.current;
    const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    // If less than 100px from bottom, consider at bottom
    return scrollBottom < 100;
  }, []);

  // Add scroll event listener to track if user is at bottom
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      isAtBottomRef.current = checkIfAtBottom();
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [checkIfAtBottom]);

  // Function to scroll to the latest message
  const scrollToLatestMessage = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!messagesEndRef.current) return;
    
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior,
        block: 'end',
      });
    }, 100);
  }, []);

  // Fetch chat history when component mounts or when subject changes
  useEffect(() => {
    async function fetchChatHistory() {
      if (!user || !subjectId) return;
      
      setIsLoading(true);
      try {
        const history = await getChatHistory(user.uid, subjectId);
        setMessages(history);
        prevMessagesLengthRef.current = history.length;
        
        // Mark initial load as complete
        setInitialLoadComplete(true);
        
        // Scroll to bottom on initial load with instant behavior
        scrollToLatestMessage('auto');
        // Initial state is at bottom
        isAtBottomRef.current = true;
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChatHistory();
  }, [user, subjectId, scrollToLatestMessage]);

  // Update messages when they change without setting loading state
  useEffect(() => {
    // Only run if initial load is complete and not currently loading
    if (!isLoading && initialLoadComplete && (user && subjectId)) {
      const updateMessages = async () => {
        try {
          // Remember current scroll position and if user was at bottom
          const wasAtBottom = isAtBottomRef.current;
          
          const history = await getChatHistory(user.uid, subjectId);
          const hasNewMessages = history.length > prevMessagesLengthRef.current;
          
          if (hasNewMessages) {
            // Store current scroll position before updating content
            const container = chatContainerRef.current;
            const scrollTop = container?.scrollTop || 0;
            const scrollHeight = container?.scrollHeight || 0;
            
            // Update messages
            setMessages(history);
            prevMessagesLengthRef.current = history.length;
            
            // If user was already at bottom, scroll to new content
            if (wasAtBottom) {
              setTimeout(() => scrollToLatestMessage(), 50);
            } else {
              // If not at bottom, maintain relative scroll position
              setTimeout(() => {
                if (container) {
                  // Calculate how much content was added
                  const newScrollHeight = container.scrollHeight;
                  const addedHeight = newScrollHeight - scrollHeight;
                  
                  // Adjust scroll position to maintain the same relative view
                  container.scrollTop = scrollTop + addedHeight;
                }
              }, 50);
            }
          } else {
            // No new messages, just update the state
            setMessages(history);
            prevMessagesLengthRef.current = history.length;
          }
        } catch (error) {
          console.error('Error updating chat messages:', error);
        }
      };
      
      updateMessages();
    }
  }, [user, subjectId, refreshChat, isLoading, initialLoadComplete, scrollToLatestMessage]);

  // Message component for better rendering
  const Message = React.memo(({ message, isLast }: { message: ChatMessage, isLast: boolean }) => (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      id={`message-${message.id}`}
      ref={isLast ? messagesEndRef : undefined}
    >
      <div 
        className={`rounded-xl px-5 py-3 max-w-[85%] sm:max-w-[75%] shadow-sm ${
          message.role === 'user' 
            ? 'bg-primary/10 text-foreground ml-auto' 
            : 'bg-card border border-border text-foreground'
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <span className={`font-medium text-sm ${message.role === 'user' ? 'text-primary' : 'text-foreground'}`}>
            {message.role === 'user' ? 'You' : 'AI Tutor'}
          </span>
          {message.timestamp && (
            <span className="text-xs text-muted-foreground ml-2">
              {new Date(message.timestamp.toDate()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>
        <div className="prose prose-sm max-w-none text-foreground dark:prose-invert leading-relaxed">
          {message.role === 'assistant' ? (
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {message.content}
            </ReactMarkdown>
          ) : (
            message.content
          )}
        </div>
      </div>
    </div>
  ));

  Message.displayName = 'Message';

  if (isLoading) {
    return <ContentLoader type="chat" count={3} />;
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 h-full">
        <div className="mb-4 p-3 rounded-full bg-primary/10">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2 text-foreground">Start a Conversation</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Ask your AI tutor a question about this subject to begin your learning journey!
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={chatContainerRef}
      className="flex flex-col overflow-y-auto h-full px-2 py-4"
    >
      <div className="space-y-4">
        {messages.map((message, index) => (
          <Message 
            key={message.id || `message-${index}`} 
            message={message} 
            isLast={index === messages.length - 1}
          />
        ))}
      </div>
    </div>
  );
} 