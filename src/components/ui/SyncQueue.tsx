"use client";

import { useOfflineSync } from "@/hooks/useOfflineSync";
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SyncQueueProps {
  className?: string;
  showDetails?: boolean;
}

export function SyncQueue({ className, showDetails = false }: SyncQueueProps) {
  const { syncStatus, pendingCount, processPendingItems, isOnline } = useOfflineSync();

  if (!syncStatus || (pendingCount === 0 && syncStatus.failed === 0)) {
    return null;
  }

  return (
    <div className={cn("p-4 bg-card rounded-lg border", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Sync Status</h3>
        {isOnline && pendingCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={processPendingItems}
            className="h-8 px-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Sync Now
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
            <span>{pendingCount} pending actions</span>
          </div>
        )}

        {syncStatus.processing > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
            <span>{syncStatus.processing} processing</span>
          </div>
        )}

        {syncStatus.failed > 0 && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>{syncStatus.failed} failed</span>
          </div>
        )}

        {'completed' in syncStatus && syncStatus.completed > 0 && showDetails && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <CheckCircle className="h-4 w-4" />
            <span>{syncStatus.completed} completed</span>
          </div>
        )}
      </div>

      {!isOnline && pendingCount > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Actions will sync when connection is restored
        </p>
      )}
    </div>
  );
}

export function SyncIndicator({ className }: { className?: string }) {
  const { pendingCount, syncStatus } = useOfflineSync();
  const hasPending = pendingCount > 0;
  const hasFailed = syncStatus && 'failed' in syncStatus && syncStatus.failed > 0;

  if (!hasPending && !hasFailed) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {hasFailed ? (
        <AlertCircle className="h-4 w-4 text-red-500" />
      ) : (
        <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      )}
      <span className="text-sm">
        {hasFailed ? `${syncStatus.failed} failed` : `${pendingCount} pending`}
      </span>
    </div>
  );
}