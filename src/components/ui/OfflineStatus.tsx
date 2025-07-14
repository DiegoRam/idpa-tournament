"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Wifi, WifiOff, RotateCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

export function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [pendingActions, setPendingActions] = useState(0);
  const t = useTranslations('offline');

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine && pendingActions > 0) {
        setSyncStatus('syncing');
        // Simulate sync process
        setTimeout(() => {
          setSyncStatus('success');
          setPendingActions(0);
          setTimeout(() => setSyncStatus('idle'), 2000);
        }, 1500);
      }
    };

    // Check if there are pending actions in localStorage
    const checkPendingActions = () => {
      const pending = localStorage.getItem('idpa-pending-actions');
      if (pending) {
        try {
          const actions = JSON.parse(pending);
          setPendingActions(Array.isArray(actions) ? actions.length : 0);
        } catch {
          setPendingActions(0);
        }
      }
    };

    updateOnlineStatus();
    checkPendingActions();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check for pending actions periodically
    const interval = setInterval(checkPendingActions, 5000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, [pendingActions]);

  if (isOnline && syncStatus === 'idle' && pendingActions === 0) {
    return null; // Don't show anything when everything is normal
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex flex-col gap-2">
        {/* Online/Offline Status */}
        <Badge
          variant={isOnline ? 'status' : 'destructive'}
          className={cn(
            "flex items-center gap-2 px-3 py-2 shadow-lg",
            !isOnline && "animate-pulse"
          )}
        >
          {isOnline ? (
            <Wifi className="h-4 w-4" aria-hidden="true" />
          ) : (
            <WifiOff className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="text-sm font-medium">
            {isOnline ? 'Online' : t('title')}
          </span>
        </Badge>

        {/* Sync Status */}
        {(syncStatus !== 'idle' || pendingActions > 0) && (
          <Badge
            variant={syncStatus === 'error' ? 'destructive' : 'secondary'}
            className="flex items-center gap-2 px-3 py-2 shadow-lg"
          >
            {syncStatus === 'syncing' && (
              <RotateCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {syncStatus === 'success' && (
              <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
            )}
            {syncStatus === 'error' && (
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="text-sm font-medium">
              {syncStatus === 'syncing' && t('sync')}
              {syncStatus === 'success' && t('synced')}
              {syncStatus === 'error' && 'Sync Error'}
              {syncStatus === 'idle' && pendingActions > 0 && (
                `${pendingActions} ${t('pending')}`
              )}
            </span>
          </Badge>
        )}
      </div>
    </div>
  );
}

// Hook to manage offline queue
export function useOfflineQueue() {
  const addToQueue = (action: Record<string, unknown>) => {
    try {
      const pending = localStorage.getItem('idpa-pending-actions');
      const actions = pending ? JSON.parse(pending) : [];
      actions.push({
        ...action,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      });
      localStorage.setItem('idpa-pending-actions', JSON.stringify(actions));
    } catch (error) {
      console.error('Failed to add action to offline queue:', error);
    }
  };

  const clearQueue = () => {
    localStorage.removeItem('idpa-pending-actions');
  };

  const getQueue = () => {
    try {
      const pending = localStorage.getItem('idpa-pending-actions');
      return pending ? JSON.parse(pending) : [];
    } catch {
      return [];
    }
  };

  return { addToQueue, clearQueue, getQueue };
}