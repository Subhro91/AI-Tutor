'use client';

import Link from 'next/link';
import PageWrapper from '@/components/PageWrapper';

export default function NotFound() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-16 sm:py-24">
        <div className="text-center max-w-md">
          <h2 className="text-6xl font-bold text-primary-600 mb-2">404</h2>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h1>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="inline-block px-6 py-3 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors w-full"
            >
              Go to Dashboard
            </Link>
            
            <Link 
              href="/" 
              className="inline-block px-6 py-3 rounded-md bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
} 