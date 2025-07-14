"use client";

import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'button' | 'table';
  count?: number;
}

export function LoadingSkeleton({ 
  className, 
  variant = 'text',
  count = 1 
}: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-slate-700/50 rounded";
  
  const variants = {
    text: "h-4 w-full",
    card: "h-32 w-full",
    avatar: "h-10 w-10 rounded-full",
    button: "h-9 w-24",
    table: "h-12 w-full"
  };

  const skeletonClass = cn(baseClasses, variants[variant], className);

  if (count === 1) {
    return <div className={skeletonClass} aria-hidden="true" />;
  }

  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={skeletonClass} />
      ))}
    </div>
  );
}

export function TournamentCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4" aria-hidden="true">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <LoadingSkeleton variant="text" className="h-6 w-3/4" />
          <LoadingSkeleton variant="text" className="h-4 w-1/2" />
        </div>
        <LoadingSkeleton variant="button" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <LoadingSkeleton variant="text" className="h-3 w-16" />
          <LoadingSkeleton variant="text" className="h-4 w-20" />
        </div>
        <div className="space-y-1">
          <LoadingSkeleton variant="text" className="h-3 w-12" />
          <LoadingSkeleton variant="text" className="h-4 w-16" />
        </div>
      </div>
      <div className="flex gap-2">
        <LoadingSkeleton className="h-5 w-12 rounded-full" />
        <LoadingSkeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="bg-slate-800 rounded-lg p-4">
        <LoadingSkeleton variant="text" className="h-5 w-32 mb-2" />
        <div className="grid grid-cols-6 gap-4 text-sm font-medium mb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="text" className="h-4" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 py-2 border-b border-slate-700 last:border-0">
            {Array.from({ length: 6 }).map((_, j) => (
              <LoadingSkeleton key={j} variant="text" className="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}