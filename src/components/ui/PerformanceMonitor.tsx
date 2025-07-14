"use client";

import { useEffect } from 'react';
import { trackWebVitals } from '@/lib/analytics';

export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    trackWebVitals();

    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      
      if (navigationEntries.length > 0) {
        const navigation = navigationEntries[0];
        
        // Calculate key timing metrics
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          download: navigation.responseEnd - navigation.responseStart,
          domInteractive: navigation.domInteractive - navigation.fetchStart,
          domComplete: navigation.domComplete - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart
        };

        if (process.env.NODE_ENV === 'development') {
          console.table(metrics);
        }
      }
    }

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        
        // Log slow resources in development
        if (process.env.NODE_ENV === 'development' && resource.duration > 1000) {
          console.warn(`Slow resource: ${resource.name} took ${Math.round(resource.duration)}ms`);
        }
      }
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource monitoring not supported:', error);
    }

    return () => {
      resourceObserver.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}