"use client";

import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { Badge } from "@/components/ui/badge";
import { WifiOff } from "lucide-react";

interface OfflineBadgeProps {
  showWhenOnline?: boolean;
}

export function OfflineBadge({ showWhenOnline = false }: OfflineBadgeProps) {
  const { isOnline } = useOfflineStatus();

  if (isOnline && !showWhenOnline) return null;

  return (
    <Badge 
      variant={isOnline ? "secondary" : "destructive"} 
      className="gap-1.5"
    >
      {!isOnline && <WifiOff className="h-3 w-3" />}
      {isOnline ? "Online" : "Offline Mode"}
    </Badge>
  );
}