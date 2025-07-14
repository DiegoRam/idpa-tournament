"use client";

import { useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useOfflineStatus } from "./useOfflineStatus";
import { toast } from "sonner";

export function useOfflineSync() {
  const { isOnline } = useOfflineStatus();
  
  const addToQueue = useMutation(api.offlineSync.addToOfflineQueue);
  const processItem = useMutation(api.offlineSync.processOfflineItem);
  const clearCompleted = useMutation(api.offlineSync.clearCompletedItems);
  
  const pendingItems = useQuery(api.offlineSync.getPendingOfflineItems);
  const syncStatus = useQuery(api.offlineSync.getSyncStatus);

  // Process pending items when online
  const processPendingItems = useCallback(async () => {
    if (!isOnline || !pendingItems || pendingItems.length === 0) return;

    let processed = 0;
    let failed = 0;

    for (const item of pendingItems) {
      try {
        await processItem({ queueId: item._id });
        processed++;
      } catch (error) {
        console.error("Failed to process offline item:", error);
        failed++;
      }
    }

    if (processed > 0) {
      toast.success(`Synced ${processed} offline actions`);
    }
    
    if (failed > 0) {
      toast.error(`Failed to sync ${failed} actions`);
    }

    // Clean up old completed items
    await clearCompleted();
  }, [isOnline, pendingItems, processItem, clearCompleted]);

  // Process items when coming back online
  useEffect(() => {
    const handleOnline = () => {
      processPendingItems();
    };

    window.addEventListener("app:online", handleOnline);
    
    // Process on mount if online
    if (isOnline) {
      processPendingItems();
    }

    return () => {
      window.removeEventListener("app:online", handleOnline);
    };
  }, [isOnline, processPendingItems]);

  // Wrapper for offline-capable mutations
  const executeOfflineAction = useCallback(async (
    action: string,
    data: unknown,
    onlineAction?: () => Promise<unknown>
  ) => {
    if (isOnline && onlineAction) {
      try {
        return await onlineAction();
      } catch (error) {
        console.error("Online action failed, queueing for offline:", error);
        await addToQueue({ action, data });
        toast.info("Action saved for offline sync");
        throw error;
      }
    } else {
      await addToQueue({ action, data });
      toast.info("You're offline. Action will sync when connection is restored.");
      return { offline: true, queued: true };
    }
  }, [isOnline, addToQueue]);

  return {
    isOnline,
    syncStatus,
    pendingCount: pendingItems?.length || 0,
    executeOfflineAction,
    processPendingItems,
  };
}