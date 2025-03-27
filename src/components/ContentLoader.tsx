import React from 'react';

interface ContentLoaderProps {
  type?: 'card' | 'text' | 'list' | 'chat' | 'profile';
  count?: number;
  className?: string;
}

export default function ContentLoader({
  type = 'card',
  count = 1,
  className = ''
}: ContentLoaderProps) {
  const renderLoader = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white rounded-xl shadow-sm p-5 w-full ${className}`}>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded-md w-1/3 animate-pulse"></div>
          </div>
        );

      case 'text':
        return (
          <div className={`w-full ${className}`}>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
        );

      case 'list':
        return (
          <div className={`w-full space-y-3 ${className}`}>
            {Array(count).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'chat':
        return (
          <div className={`w-full space-y-4 ${className}`}>
            <div className="flex justify-start w-full">
              <div className="rounded-xl px-4 py-3 max-w-[70%] bg-white border border-gray-100 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            <div className="flex justify-end w-full">
              <div className="rounded-xl px-4 py-3 max-w-[70%] bg-primary-50 animate-pulse">
                <div className="h-3 bg-gray-200 bg-opacity-60 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 bg-opacity-60 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 bg-opacity-60 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className={`w-full ${className}`}>
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 bg-gray-200 rounded-full animate-pulse mb-4"></div>
              <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
            </div>
            <div className="space-y-3 mt-4">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="mb-4">
          {renderLoader()}
        </div>
      ))}
    </div>
  );
} 