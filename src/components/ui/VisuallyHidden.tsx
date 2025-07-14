"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
}

export function VisuallyHidden({ 
  children, 
  className 
}: VisuallyHiddenProps) {
  return (
    <span className={cn("sr-only", className)}>
      {children}
    </span>
  );
}