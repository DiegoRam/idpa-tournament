"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api, Id } from "@/lib/convex";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Cloud, 
  CloudOff,
  Database,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TournamentOfflineManagerProps {
  tournamentId: Id<"tournaments">;
  className?: string;
}

export function TournamentOfflineManager({
  tournamentId,
  className
}: TournamentOfflineManagerProps) {
  const { isOnline } = useOfflineStatus();
  const { 
    cacheTournamentData, 
    getCachedTournamentData, 
    isTournamentCached, 
    getCacheAge,
    isInitialized 
  } = useOfflineStorage();

  const [isCaching, setIsCaching] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [cacheSize, setCacheSize] = useState<number>(0);

  // Fetch live tournament data
  const tournament = useQuery(api.tournaments.getTournamentById, { tournamentId });
  const squads = useQuery(api.squads.getSquadsByTournament, { tournamentId });
  const stages = useQuery(api.stages.getStagesByTournament, { tournamentId });
  const registrations = useQuery(api.registrations.getRegistrationsByTournament, { tournamentId });

  // Check cache status
  const checkCacheStatus = useCallback(async () => {
    if (!isInitialized) return;

    try {
      const cached = await isTournamentCached(tournamentId);
      setIsCached(cached);

      if (cached) {
        const age = await getCacheAge(tournamentId);
        setCacheAge(age);

        // Estimate cache size
        const cachedData = await getCachedTournamentData(tournamentId);
        if (cachedData) {
          const size = JSON.stringify(cachedData).length;
          setCacheSize(size);
        }
      }
    } catch (error) {
      console.error("Failed to check cache status:", error);
    }
  }, [isInitialized, tournamentId, isTournamentCached, getCacheAge, getCachedTournamentData]);

  useEffect(() => {
    checkCacheStatus();
  }, [checkCacheStatus]);

  // Cache tournament data
  const handleCacheData = async () => {
    if (!tournament || !squads || !stages || !registrations) {
      toast.error("Tournament data not fully loaded");
      return;
    }

    setIsCaching(true);
    try {
      await cacheTournamentData(tournamentId, {
        tournament,
        squads,
        stages,
        registrations
      });

      // Send message to service worker to cache additional data
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_TOURNAMENT_DATA',
          tournamentId,
          data: { tournament, squads, stages, registrations }
        });
      }

      await checkCacheStatus();
      toast.success("Tournament data cached for offline use");
    } catch (error) {
      console.error("Failed to cache tournament data:", error);
      toast.error("Failed to cache tournament data");
    } finally {
      setIsCaching(false);
    }
  };

  // Force refresh cache
  const handleRefreshCache = async () => {
    if (!isOnline) {
      toast.error("Cannot refresh cache while offline");
      return;
    }
    
    await handleCacheData();
  };

  if (!isInitialized) {
    return null;
  }

  const formatCacheAge = (ageMs: number) => {
    const minutes = Math.floor(ageMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const formatCacheSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Card className={cn("bg-gray-900/50 border-gray-800", className)}>
      <CardHeader>
        <CardTitle className="text-lg text-green-400 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Offline Data Management
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Cloud className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">Online</span>
              </>
            ) : (
              <>
                <CloudOff className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">Offline</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isCached ? (
              <Badge variant="outline" className="text-green-400 border-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Cached
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-400 border-gray-400">
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Cached
              </Badge>
            )}
          </div>
        </div>

        {/* Cache Information */}
        {isCached && cacheAge !== null && (
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Last Updated:</span>
              <span className="text-gray-300 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatCacheAge(cacheAge)}
              </span>
            </div>
            {cacheSize > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Cache Size:</span>
                <span className="text-gray-300">{formatCacheSize(cacheSize)}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {!isCached ? (
            <Button
              onClick={handleCacheData}
              disabled={isCaching || !tournament}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isCaching ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isCaching ? "Caching..." : "Cache for Offline Use"}
            </Button>
          ) : (
            <Button
              onClick={handleRefreshCache}
              disabled={isCaching || !isOnline}
              variant="outline"
              className="w-full"
            >
              {isCaching ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isCaching ? "Updating..." : "Update Cache"}
            </Button>
          )}
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <Alert className="bg-yellow-900/20 border-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-yellow-400">
              {isCached 
                ? "You're offline but can continue using cached tournament data."
                : "You're offline. Tournament data may be limited without cached data."
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Cache Benefits Info */}
        {!isCached && isOnline && (
          <Alert className="bg-blue-900/20 border-blue-800">
            <Database className="h-4 w-4" />
            <AlertDescription className="text-blue-400">
              <div className="space-y-1">
                <p className="font-medium">Offline caching enables:</p>
                <ul className="text-xs space-y-0.5 ml-4">
                  <li>• Score entry without internet</li>
                  <li>• Tournament data access offline</li>
                  <li>• Automatic sync when reconnected</li>
                  <li>• Reliable tournament operations</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}