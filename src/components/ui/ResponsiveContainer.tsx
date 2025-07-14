"use client";

import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'mobile-first' | 'full-width';
}

export function ResponsiveContainer({ 
  children, 
  className,
  variant = 'default' 
}: ResponsiveContainerProps) {
  const variants = {
    'default': 'container mx-auto px-4 sm:px-6 lg:px-8',
    'mobile-first': 'w-full px-4 sm:max-w-2xl sm:mx-auto lg:max-w-4xl xl:max-w-6xl',
    'full-width': 'w-full px-2 sm:px-4'
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
}

interface MobileStackProps {
  children: React.ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}

export function MobileStack({ 
  children, 
  className,
  gap = 'md' 
}: MobileStackProps) {
  const gaps = {
    sm: 'space-y-2 sm:space-y-0 sm:space-x-2',
    md: 'space-y-4 sm:space-y-0 sm:space-x-4',
    lg: 'space-y-6 sm:space-y-0 sm:space-x-6'
  };

  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center',
      gaps[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface TouchTargetProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TouchTarget({ 
  children, 
  className,
  size = 'md' 
}: TouchTargetProps) {
  const sizes = {
    sm: 'min-h-[40px] min-w-[40px]',
    md: 'min-h-[44px] min-w-[44px]',
    lg: 'min-h-[48px] min-w-[48px]'
  };

  return (
    <div className={cn(
      'flex items-center justify-center touch-manipulation',
      sizes[size],
      className
    )}>
      {children}
    </div>
  );
}