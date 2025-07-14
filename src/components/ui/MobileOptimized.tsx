"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedProps {
  children: React.ReactNode;
  mobileChildren?: React.ReactNode;
  breakpoint?: number;
  className?: string;
}

export function MobileOptimized({ 
  children, 
  mobileChildren,
  breakpoint = 768,
  className 
}: MobileOptimizedProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return (
    <div className={className}>
      {isMobile && mobileChildren ? mobileChildren : children}
    </div>
  );
}

interface HapticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hapticFeedback?: boolean;
  disabled?: boolean;
}

export function HapticButton({ 
  children, 
  onClick,
  className,
  hapticFeedback = true,
  disabled = false 
}: HapticButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    
    // Haptic feedback for mobile devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration
    }
    
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'touch-manipulation select-none active:scale-95 transition-transform',
        'min-h-[44px] min-w-[44px] rounded-lg',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}

interface SwipeableProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export function Swipeable({ 
  children, 
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  className 
}: SwipeableProps) {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  return (
    <div
      className={cn('touch-manipulation', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}