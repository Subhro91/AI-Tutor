'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/app/providers';
import { getChatHistory, ChatMessage } from '@/lib/firebase-db';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import ContentLoader from './ContentLoader';
import { 
  ChatBubble, 
  ChatBubbleMessage 
} from '@/components/ui/chat-bubble';
import { ChatMessageList } from '@/components/ui/chat-message-list';

interface ChatHistoryProps {
  subjectId: string;
  refreshChat?: number;
}

export default function ChatHistory({ subjectId, refreshChat = 0 }: ChatHistoryProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
        
        // Initial state is at bottom
        isAtBottomRef.current = true;
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChatHistory();
  }, [user, subjectId]);

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
            
            // Update autoScroll based on whether user was at bottom
            isAtBottomRef.current = wasAtBottom;
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
  }, [user, subjectId, refreshChat, isLoading, initialLoadComplete]);

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
      className="flex flex-col h-full overflow-hidden"
    >
      <ChatMessageList autoScroll={isAtBottomRef.current}>
        {messages.map((message, index) => (
          <ChatBubble
            key={message.id || `message-${index}`}
            variant={message.role === 'user' ? 'sent' : 'received'}
          >
            <ChatBubbleMessage
              variant={message.role === 'user' ? 'sent' : 'received'}
              className="mx-2"
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`font-medium text-sm ${message.role === 'user' ? 'text-white' : ''}`}>
                  {message.role === 'user' ? 'You' : 'AI Tutor'}
                </span>
                {message.timestamp && (
                  <span className={`text-xs ml-2 ${message.role === 'user' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                    {new Date(message.timestamp.toDate()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
              <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'text-white dark:text-white' : 'dark:prose-invert text-foreground'} leading-relaxed`}>
                {message.role === 'assistant' ? (
                  <ReactMarkdown 
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                      pre: ({ node, ...props }) => (
                        <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs" {...props} />
                      ),
                      code: ({ node, className, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !className || !match;
                        return isInline ? 
                          <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props} /> :
                          <code className={className} {...props} />;
                      },
                      a: ({ node, ...props }) => (
                        <a className={`${message.role === 'user' ? 'text-white underline' : 'text-primary hover:underline'}`} {...props} />
                      )
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            </ChatBubbleMessage>
          </ChatBubble>
        ))}
      </ChatMessageList>
    </div>
  );
} 