'use client';

import React, { useState, FormEvent } from 'react';
import { useAuth } from '@/app/providers';
import { saveChatMessage, createOrUpdateUserProgress } from '@/lib/firebase-db';
import { CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInput as ChatInputUI } from '@/components/ui/chat-input';
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

  const handleSubmit = async (e: FormEvent) => {
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
    <div className="border-t border-border bg-card px-3 py-4 sm:px-4 sm:py-5 sticky bottom-0">
      {isProcessing && (
        <div className="absolute -top-12 left-0 w-full flex items-center p-2 bg-background border border-border rounded-md">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-muted-foreground">AI Tutor is thinking...</span>
        </div>
      )}
      
      <form
        onSubmit={handleSubmit}
        className="relative rounded-lg border bg-background p-1 max-w-4xl mx-auto focus-within:border-primary"
      >
        <ChatInputUI
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask your tutor a question..."
          className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none"
          disabled={isSending || isProcessing || !user}
        />
        
        <div className="flex justify-end p-3 pt-0">
          <Button 
            type="submit" 
            size="sm" 
            className="gap-1.5"
            disabled={isSending || isProcessing || !message.trim() || !user}
          >
            {isSending ? (
              <span className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Send Message
                <CornerDownLeft className="size-3.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 