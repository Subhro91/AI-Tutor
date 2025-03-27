import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  fullPage?: boolean;
  text?: string;
}

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  fullPage = false,
  text
}: LoadingSpinnerProps) {
  // Define sizes
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  // Define colors
  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };
  
  const spinnerElement = (
    <div 
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin border-2 inline-block`}
      role="status"
      aria-label="Loading"
    />
  );
  
  // Full page spinner with backdrop
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50">
        {spinnerElement}
        {text && <p className="mt-4 text-gray-700 font-medium">{text}</p>}
      </div>
    );
  }
  
  // Regular spinner
  return (
    <div className="flex items-center justify-center space-x-2">
      {spinnerElement}
      {text && <span className="text-gray-700">{text}</span>}
    </div>
  );
} 