"use client";

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormErrorsProps {
  errors?: string | string[];
  className?: string;
}

export function FormErrors({ errors, className }: FormErrorsProps) {
  if (!errors) return null;
  
  const errorList = Array.isArray(errors) ? errors : [errors];
  
  if (errorList.length === 0) return null;

  return (
    <div 
      className={cn(
        "bg-red-900/20 border border-red-500/30 rounded-md p-3",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex gap-2">
        <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="space-y-1">
          {errorList.map((error, index) => (
            <p key={index} className="text-sm text-red-300">
              {error}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null;
  
  return (
    <p 
      className={cn("text-sm text-red-400 mt-1", className)}
      role="alert"
      aria-live="polite"
    >
      {error}
    </p>
  );
}