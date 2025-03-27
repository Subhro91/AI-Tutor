'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/providers';
import { saveChatMessage, createOrUpdateUserProgress } from '@/lib/firebase-db';

interface ChatInputProps {
  subjectId: string;
  onMessageSent: (message: string) => void;
}

export default function ChatInput({ subjectId, onMessageSent }: ChatInputProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user || !subjectId || isSending) return;
    
    try {
      setIsSending(true);
      
      // Save message to Firestore
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
      
      // Notify parent component
      onMessageSent(message);
      
      // Clear input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white px-3 py-4 sm:px-4 sm:py-5 sticky bottom-0">
      <div className="flex items-center gap-2 max-w-4xl mx-auto relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask your tutor a question..."
          className="form-input rounded-full pr-14 py-3 focus:border-primary-300 flex-grow text-base"
          disabled={isSending || !user}
        />
        <button
          type="submit"
          className="absolute right-2 rounded-full p-2 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors"
          disabled={isSending || !message.trim() || !user}
          aria-label="Send message"
        >
          {isSending ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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