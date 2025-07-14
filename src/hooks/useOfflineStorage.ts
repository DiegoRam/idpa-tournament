"use client";

import { useState, useEffect, useCallback } from "react";
import { Id } from "@/lib/convex";

// IndexedDB wrapper for offline storage
class OfflineStorage {
  private dbName = "idpa-tournament-offline";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tournament data store
        if (!db.objectStoreNames.contains("tournaments")) {
          const tournamentStore = db.createObjectStore("tournaments", { keyPath: "_id" });
          tournamentStore.createIndex("status", "status", { unique: false });
        }

        // Squad data store
        if (!db.objectStoreNames.contains("squads")) {
          const squadStore = db.createObjectStore("squads", { keyPath: "_id" });
          squadStore.createIndex("tournamentId", "tournamentId", { unique: false });
        }

        // Stage data store
        if (!db.objectStoreNames.contains("stages")) {
          const stageStore = db.createObjectStore("stages", { keyPath: "_id" });
          stageStore.createIndex("tournamentId", "tournamentId", { unique: false });
        }

        // Registration data store
        if (!db.objectStoreNames.contains("registrations")) {
          const registrationStore = db.createObjectStore("registrations", { keyPath: "_id" });
          registrationStore.createIndex("tournamentId", "tournamentId", { unique: false });
          registrationStore.createIndex("shooterId", "shooterId", { unique: false });
        }

        // Offline scores store (before sync)
        if (!db.objectStoreNames.contains("offlineScores")) {
          const scoresStore = db.createObjectStore("offlineScores", { keyPath: "localId" });
          scoresStore.createIndex("stageId_shooterId", ["stageId", "shooterId"], { unique: true });
          scoresStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        // Cache metadata store
        if (!db.objectStoreNames.contains("cacheMetadata")) {
          db.createObjectStore("cacheMetadata", { keyPath: "key" });
        }
      };
    });
  }

  async store<T extends Record<string, unknown>>(storeName: string, data: T): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async getByIndex<T>(storeName: string, indexName: string, value: string | number): Promise<T[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async setCacheMetadata(key: string, metadata: Record<string, unknown>): Promise<void> {
    await this.store("cacheMetadata", { key, ...metadata, timestamp: Date.now() });
  }

  async getCacheMetadata(key: string): Promise<Record<string, unknown> | null> {
    return await this.get("cacheMetadata", key);
  }
}

// Singleton instance
const offlineStorage = new OfflineStorage();

// Hook for offline storage operations
export function useOfflineStorage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    offlineStorage.init()
      .then(() => setIsInitialized(true))
      .catch((err) => setError(err.message));
  }, []);

  // Cache tournament data for offline use
  const cacheTournamentData = useCallback(async (tournamentId: Id<"tournaments">, data: {
    tournament: Record<string, unknown>;
    squads: Record<string, unknown>[];
    stages: Record<string, unknown>[];
    registrations: Record<string, unknown>[];
  }) => {
    if (!isInitialized) return;

    try {
      // Store tournament
      await offlineStorage.store("tournaments", data.tournament);
      
      // Store squads
      for (const squad of data.squads) {
        await offlineStorage.store("squads", squad);
      }
      
      // Store stages
      for (const stage of data.stages) {
        await offlineStorage.store("stages", stage);
      }
      
      // Store registrations
      for (const registration of data.registrations) {
        await offlineStorage.store("registrations", registration);
      }

      // Update cache metadata
      await offlineStorage.setCacheMetadata(`tournament_${tournamentId}`, {
        lastCached: Date.now(),
        dataTypes: ["tournament", "squads", "stages", "registrations"]
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cache tournament data");
    }
  }, [isInitialized]);

  // Get cached tournament data
  const getCachedTournamentData = useCallback(async (tournamentId: Id<"tournaments">) => {
    if (!isInitialized) return null;

    try {
      const tournament = await offlineStorage.get("tournaments", tournamentId);
      const squads = await offlineStorage.getByIndex("squads", "tournamentId", tournamentId);
      const stages = await offlineStorage.getByIndex("stages", "tournamentId", tournamentId);
      const registrations = await offlineStorage.getByIndex("registrations", "tournamentId", tournamentId);

      return { tournament, squads, stages, registrations };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get cached data");
      return null;
    }
  }, [isInitialized]);

  // Store offline score
  const storeOfflineScore = useCallback(async (scoreData: Record<string, unknown>) => {
    if (!isInitialized) return null;

    try {
      const localId = `${scoreData.stageId}_${scoreData.shooterId}_${Date.now()}`;
      const offlineScore = {
        localId,
        ...scoreData,
        timestamp: Date.now(),
        synced: false
      };

      await offlineStorage.store("offlineScores", offlineScore);
      return localId;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to store offline score");
      return null;
    }
  }, [isInitialized]);

  // Get offline scores
  const getOfflineScores = useCallback(async () => {
    if (!isInitialized) return [];

    try {
      return await offlineStorage.getAll("offlineScores");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to get offline scores");
      return [];
    }
  }, [isInitialized]);

  // Mark offline score as synced
  const markScoreSynced = useCallback(async (localId: string) => {
    if (!isInitialized) return;

    try {
      await offlineStorage.delete("offlineScores", localId);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to mark score as synced");
    }
  }, [isInitialized]);

  // Check if tournament data is cached
  const isTournamentCached = useCallback(async (tournamentId: Id<"tournaments">) => {
    if (!isInitialized) return false;

    try {
      const metadata = await offlineStorage.getCacheMetadata(`tournament_${tournamentId}`);
      return !!metadata;
    } catch {
      return false;
    }
  }, [isInitialized]);

  // Get cache age
  const getCacheAge = useCallback(async (tournamentId: Id<"tournaments">) => {
    if (!isInitialized) return null;

    try {
      const metadata = await offlineStorage.getCacheMetadata(`tournament_${tournamentId}`);
      if (metadata?.lastCached && typeof metadata.lastCached === 'number') {
        return Date.now() - metadata.lastCached;
      }
      return null;
    } catch {
      return null;
    }
  }, [isInitialized]);

  // Clear all cached data
  const clearCache = useCallback(async () => {
    if (!isInitialized) return;

    try {
      await Promise.all([
        offlineStorage.clear("tournaments"),
        offlineStorage.clear("squads"),
        offlineStorage.clear("stages"),
        offlineStorage.clear("registrations"),
        offlineStorage.clear("cacheMetadata")
      ]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to clear cache");
    }
  }, [isInitialized]);

  return {
    isInitialized,
    error,
    cacheTournamentData,
    getCachedTournamentData,
    storeOfflineScore,
    getOfflineScores,
    markScoreSynced,
    isTournamentCached,
    getCacheAge,
    clearCache,
    storage: offlineStorage
  };
}