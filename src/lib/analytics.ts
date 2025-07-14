"use client";

// Performance monitoring utilities
export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  try {
    // FCP - First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          reportMetric('FCP', entry.startTime);
        }
      }
    });
    observer.observe({ entryTypes: ['paint'] });

    // LCP - Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      reportMetric('LCP', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // FID - First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reportMetric('FID', (entry as any).processingStart - entry.startTime);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(entry as any).hadRecentInput) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          clsValue += (entry as any).value;
        }
      }
      reportMetric('CLS', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

  } catch (error) {
    console.warn('Performance monitoring not supported:', error);
  }
}

function reportMetric(name: string, value: number) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${Math.round(value)}ms`);
  }

  // In production, send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: send to Google Analytics, Vercel Analytics, etc.
    if ('gtag' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag('event', 'web_vitals', {
        custom_parameter_name: name,
        custom_parameter_value: Math.round(value),
      });
    }
  }
}

export function trackUserAction(action: string, category: string = 'User', data?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${category}:${action}`, data);
  }

  // In production, send to analytics
  if (process.env.NODE_ENV === 'production' && 'gtag' in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: data?.label,
      value: data?.value,
    });
  }
}

export function trackPageView(path: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] Page view: ${path}`);
  }

  if (process.env.NODE_ENV === 'production' && 'gtag' in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
      page_path: path,
    });
  }
}