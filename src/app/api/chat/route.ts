import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerativeModel, ChatSession } from '@google/generative-ai';
import { detectTopicsInMessage } from '@/lib/progress-utils';

// Prevent caching responses
export const dynamic = 'force-dynamic';

// Global AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model cache
let modelCache: GenerativeModel | null = null;

// Type definitions
type MessageRole = 'user' | 'assistant' | 'system';

interface Message {
  role: MessageRole;
  content: string;
}

type GeminiMessage = {
  role: 'user' | 'model';
  parts: string;
};

// Safety guardrails
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Model configuration
const generationConfig = {
  temperature: 0.65,
  maxOutputTokens: 1500,
  topK: 40,
  topP: 0.95,
};

export async function POST(request: Request) {
  try {
    // Response headers
    const responseHeaders = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-transform',
    };

    const { messages, subject, userId } = await request.json();

    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Format messages for Gemini
    const history: GeminiMessage[] = [];
    let systemPrompt = '';
    let userMessage = '';
    
    messages.forEach((msg: Message, index: number) => {
      const isLastMessage = index === messages.length - 1;
      
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else if (msg.role === 'user') {
        if (isLastMessage) {
          userMessage = msg.content;
        } else {
          history.push({ role: 'user', parts: msg.content });
        }
      } else if (msg.role === 'assistant') {
        history.push({ role: 'model', parts: msg.content });
      }
    });

    // Default system prompt if none provided
    if (!systemPrompt) {
      const subjectTitle = subject.charAt(0).toUpperCase() + subject.slice(1);
      systemPrompt = `You are an AI tutor specializing in ${subjectTitle}. Provide accurate and concise assistance to help the student learn effectively. Use clear examples and be direct in your explanations.`;
    }

    // Initialize or reuse model
    if (!modelCache) {
      modelCache = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        safetySettings,
      });
    }

    // Start chat session
    const chat: ChatSession = modelCache.startChat({
      history,
      generationConfig,
    });

    // Combine system context with user message
    const fullUserPrompt = `${systemPrompt}\n\nUser question: ${userMessage}`;
    
    // Add timeout to prevent hanging requests
    const responsePromise = chat.sendMessage(fullUserPrompt);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 15000);
    });
    
    const result = await Promise.race([responsePromise, timeoutPromise]);
    const response = await result.response;
    const text = response.text();
    
    // Track user progress in background
    if (userId && subject) {
      detectTopicsInMessage(text, subject, userId).catch((err: unknown) => {
        console.error('Error detecting topics:', err);
      });
    }

    return NextResponse.json(
      { message: text }, 
      { headers: responseHeaders }
    );
  } catch (error: unknown) {
    console.error('Error in chat API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get response from AI';
    const status = errorMessage === 'Request timed out' ? 504 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
} 