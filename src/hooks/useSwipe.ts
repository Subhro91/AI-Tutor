'use client';

import { useState, useEffect, useRef } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

interface TouchCoordinates {
  x: number;
  y: number;
}

/**
 * React hook for handling swipe gestures in touch devices
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefaultTouchmoveEvent = false
}: SwipeHandlers) {
  const [touchStart, setTouchStart] = useState<TouchCoordinates | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchCoordinates | null>(null);
  const hasSwiped = useRef(false);

  // Reset when new swipe starts
  const handleTouchStart = (e: TouchEvent) => {
    hasSwiped.current = false;
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
    
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchEnd.x - touchStart.x;
    const distanceY = touchEnd.y - touchStart.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    // Check if swipe distance exceeds threshold
    if (isHorizontalSwipe) {
      if (Math.abs(distanceX) < threshold) return;
      
      if (distanceX > 0 && onSwipeRight && !hasSwiped.current) {
        onSwipeRight();
        hasSwiped.current = true;
      } else if (distanceX < 0 && onSwipeLeft && !hasSwiped.current) {
        onSwipeLeft();
        hasSwiped.current = true;
      }
    } else {
      if (Math.abs(distanceY) < threshold) return;
      
      if (distanceY > 0 && onSwipeDown && !hasSwiped.current) {
        onSwipeDown();
        hasSwiped.current = true;
      } else if (distanceY < 0 && onSwipeUp && !hasSwiped.current) {
        onSwipeUp();
        hasSwiped.current = true;
      }
    }
  };

  useEffect(() => {
    const target = document;
    
    target.addEventListener('touchstart', handleTouchStart);
    target.addEventListener('touchmove', handleTouchMove);
    target.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  // For use in elements where we want to apply swipe directly
  const swipeHandlers = {
    onTouchStart: (e: React.TouchEvent) => handleTouchStart(e.nativeEvent),
    onTouchMove: (e: React.TouchEvent) => handleTouchMove(e.nativeEvent),
    onTouchEnd: handleTouchEnd,
  };

  return swipeHandlers;
} 