'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/providers';
import { saveChatMessage, createOrUpdateUserProgress } from '@/lib/firebase-db';
import LoadingSpinner from './LoadingSpinner';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
  subjectId?: string;
}

export default function ChatInput({ subjectId, onSendMessage, isProcessing = false }: ChatInputProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user || isSending || isProcessing) return;
    
    try {
      setIsSending(true);
      
      // Save message to Firestore if subjectId is provided
      if (subjectId) {
        await saveChatMessage({
          content: message,
          role: 'user',
          timestamp: null, // Will be set by serverTimestamp() in the function
          subjectId,
          userId: user.uid
        });
        
        // Make sure user progress record exists
        await createOrUpdateUserProgress({
          userId: user.uid,
          subjectId,
          lastAccessed: null, // Will be set by serverTimestamp() in the function
          messagesCount: 0, // This will be incremented by saveChatMessage
          completedTopics: []
        });
      }
      
      // Notify parent component
      onSendMessage(message);
      
      // Clear input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-card px-3 py-4 sm:px-4 sm:py-5 sticky bottom-0">
      <div className="flex items-center gap-2 max-w-4xl mx-auto relative">
        {isProcessing && (
          <div className="absolute -top-12 left-0 w-full flex items-center p-2 bg-background border border-border rounded-md">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm text-muted-foreground">AI Tutor is thinking...</span>
          </div>
        )}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask your tutor a question..."
          className="input rounded-full pr-14 py-3 flex-grow text-base text-foreground bg-background border border-input"
          disabled={isSending || isProcessing || !user}
        />
        <button
          type="submit"
          className="absolute right-2 rounded-full p-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          disabled={isSending || isProcessing || !message.trim() || !user}
          aria-label="Send message"
        >
          {isSending ? (
            <span className="inline-block w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
} 