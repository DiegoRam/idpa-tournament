"use client";

import { InstallPrompt } from "@/components/ui/InstallPrompt";
import { SkipNavigation } from "@/components/ui/SkipNavigation";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";
import { PerformanceMonitor } from "@/components/ui/PerformanceMonitor";
import { OfflineStatus } from "@/components/ui/OfflineStatus";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <PerformanceMonitor />
      <SkipNavigation />
      <ErrorBoundary>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </ErrorBoundary>
      <OfflineStatus />
      <InstallPrompt variant="banner" />
    </ToastProvider>
  );
}