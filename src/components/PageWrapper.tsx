'use client';

import { ReactNode, useEffect, useState } from 'react';

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  return (
    <div className={`${isVisible ? 'page-transition-in' : 'opacity-0'}`}>
      {children}
    </div>
  );
} 