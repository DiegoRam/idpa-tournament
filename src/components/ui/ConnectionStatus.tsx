"use client";

import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConnectionStatus() {
  const { isOnline } = useOfflineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2 px-4 py-2 bg-orange-900/90 text-orange-100 rounded-lg shadow-lg backdrop-blur-sm">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Offline Mode</span>
      </div>
    </div>
  );
}

export function ConnectionIndicator({ className }: { className?: string }) {
  const { isOnline } = useOfflineStatus();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm text-muted-foreground">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-orange-500" />
          <span className="text-sm text-orange-500">Offline</span>
        </>
      )}
    </div>
  );
}