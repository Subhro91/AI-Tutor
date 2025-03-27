'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
});

export default function PageTransition() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Create the style element
    const style = document.createElement('style');
    style.textContent = `
      #nprogress .bar {
        background: #4f46e5 !important;
        height: 3px !important;
      }
      
      #nprogress .peg {
        box-shadow: 0 0 10px #4f46e5, 0 0 5px #4f46e5 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    NProgress.start();
    
    // Finish the progress after a short delay to make it visible
    const timer = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
} 