/**
 * Smart fetcher function with retry logic and error handling
 */
import { getAuth } from 'firebase/auth';
import { auth } from './firebase';

// Utility to add exponential backoff for retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type FetcherOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  retry?: number;
  retryDelay?: number;
  useAuth?: boolean;
};

/**
 * Enhanced fetcher for SWR with retry logic
 */
export const fetcher = async (url: string, options: FetcherOptions = {}) => {
  const { 
    method = 'GET', 
    body, 
    headers = {}, 
    credentials = 'same-origin',
    retry = 3,
    retryDelay = 300,
    useAuth = true
  } = options;

  // Default headers for JSON
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  // Add auth token if signed in and useAuth is true
  if (useAuth) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const token = await user.getIdToken();
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Unable to get auth token');
    }
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: defaultHeaders,
    credentials,
    body: body ? JSON.stringify(body) : undefined
  };

  let error = null;
  let retries = 0;

  // Try with exponential backoff
  while (retries <= retry) {
    try {
      const response = await fetch(url, requestOptions);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If it's a 401 error related to auth, don't retry
        if (response.status === 401) {
          throw new Error(
            JSON.stringify({
              status: response.status,
              statusText: 'Unauthorized',
              data: errorData
            })
          );
        }
        
        // Construct a meaningful error
        throw new Error(
          JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            data: errorData
          })
        );
      }

      // For successful responses, parse JSON or return text
      return response.headers.get('Content-Type')?.includes('application/json')
        ? await response.json()
        : await response.text();
    } catch (err: any) {
      error = err;
      
      // Don't retry 401 errors
      if (err.message && err.message.includes('"status":401')) {
        break;
      }
      
      retries++;
      
      // Don't sleep if we're not going to retry
      if (retries <= retry) {
        // Exponential backoff with jitter
        const delay = Math.min(1000 * 2 ** retries, 10000) + Math.random() * retryDelay;
        await sleep(delay);
      }
    }
  }

  // If we exhausted all retries, throw the last error
  throw error;
};

/**
 * Custom fetcher function for SWR
 * Automatically includes auth token for authenticated endpoints
 */
const swrFetcher = async (url: string) => {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // If user is authenticated, add token to headers
    if (currentUser) {
      const token = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make request with proper headers
    const response = await fetch(url, { headers });
    
    // Handle error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `API error: ${response.status} - ${errorData?.error || response.statusText}`
      );
    }
    
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export default swrFetcher; 