"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api, Id } from "@/lib/convex";
import { StringScore, IDPAPenalties } from "@/types/scoring";
import { toast } from "sonner";

export interface ScoreConflict {
  scoreId: Id<"scores">;
  localVersion: {
    strings: StringScore[];
    penalties: IDPAPenalties;
    dnf: boolean;
    dq: boolean;
    lastModified: number;
  };
  serverVersion: {
    strings: StringScore[];
    penalties: IDPAPenalties;
    dnf: boolean;
    dq: boolean;
    lastModified: number;
    scoredBy: Id<"users">;
  };
  stageId: Id<"stages">;
  shooterId: Id<"users">;
}

export interface ConflictResolution {
  action: "use_local" | "use_server" | "merge" | "manual";
  resolvedScore?: {
    strings: StringScore[];
    penalties: IDPAPenalties;
    dnf: boolean;
    dq: boolean;
  };
}

export function useScoreConflictResolution() {
  const [conflicts, setConflicts] = useState<ScoreConflict[]>([]);
  const [isResolving, setIsResolving] = useState(false);

  const updateScore = useMutation(api.scoring.updateScore);

  // Detect conflicts when syncing offline scores
  const detectConflict = useCallback(async (
    scoreId: Id<"scores">,
    localScore: {
      strings: StringScore[];
      penalties: IDPAPenalties;
      dnf: boolean;
      dq: boolean;
      lastModified: number;
    },
    serverScore: {
      strings: StringScore[];
      penalties: IDPAPenalties;
      dnf: boolean;
      dq: boolean;
      _creationTime?: number;
      updatedAt?: number;
      scoredBy: Id<"users">;
      stageId: Id<"stages">;
      shooterId: Id<"users">;
    }
  ): Promise<boolean> => {
    // Check if server version was modified after local version
    const serverModified = serverScore._creationTime || serverScore.updatedAt || 0;
    const localModified = localScore.lastModified || 0;

    if (serverModified > localModified) {
      // Potential conflict - check if scores are actually different
      const hasStringDifferences = JSON.stringify(localScore.strings) !== JSON.stringify(serverScore.strings);
      const hasPenaltyDifferences = JSON.stringify(localScore.penalties) !== JSON.stringify(serverScore.penalties);
      const hasStatusDifferences = localScore.dnf !== serverScore.dnf || localScore.dq !== serverScore.dq;

      if (hasStringDifferences || hasPenaltyDifferences || hasStatusDifferences) {
        const conflict: ScoreConflict = {
          scoreId,
          localVersion: localScore,
          serverVersion: {
            strings: serverScore.strings,
            penalties: serverScore.penalties,
            dnf: serverScore.dnf,
            dq: serverScore.dq,
            lastModified: serverModified,
            scoredBy: serverScore.scoredBy
          },
          stageId: serverScore.stageId,
          shooterId: serverScore.shooterId
        };

        setConflicts(prev => [...prev, conflict]);
        return true;
      }
    }

    return false;
  }, []);

  // Auto-resolve simple conflicts
  const autoResolveConflict = useCallback((conflict: ScoreConflict): ConflictResolution | null => {
    const { localVersion, serverVersion } = conflict;

    // Rule 1: If local is DNF/DQ but server isn't, prefer local (scorer decision)
    if ((localVersion.dnf || localVersion.dq) && !serverVersion.dnf && !serverVersion.dq) {
      return {
        action: "use_local",
        resolvedScore: localVersion
      };
    }

    // Rule 2: If server is DNF/DQ but local isn't, prefer server (official decision)
    if ((serverVersion.dnf || serverVersion.dq) && !localVersion.dnf && !localVersion.dq) {
      return {
        action: "use_server",
        resolvedScore: serverVersion
      };
    }

    // Rule 3: If only string times differ (hits are same), use most recent
    const localHits = JSON.stringify(localVersion.strings.map(s => s.hits));
    const serverHits = JSON.stringify(serverVersion.strings.map(s => s.hits));
    const localTimes = localVersion.strings.map(s => s.time);
    const serverTimes = serverVersion.strings.map(s => s.time);

    if (localHits === serverHits && JSON.stringify(localTimes) !== JSON.stringify(serverTimes)) {
      // Use the version with the most recent timestamp
      if (localVersion.lastModified > serverVersion.lastModified) {
        return {
          action: "use_local",
          resolvedScore: localVersion
        };
      } else {
        return {
          action: "use_server",
          resolvedScore: serverVersion
        };
      }
    }

    // Rule 4: If penalties are different but scores are same, merge penalties (add them)
    const localScoreHash = JSON.stringify({
      strings: localVersion.strings,
      dnf: localVersion.dnf,
      dq: localVersion.dq
    });
    const serverScoreHash = JSON.stringify({
      strings: serverVersion.strings,
      dnf: serverVersion.dnf,
      dq: serverVersion.dq
    });

    if (localScoreHash === serverScoreHash && 
        JSON.stringify(localVersion.penalties) !== JSON.stringify(serverVersion.penalties)) {
      
      // Merge penalties (conservative approach - take the higher penalty in each category)
      const mergedPenalties: IDPAPenalties = {
        procedural: Math.max(localVersion.penalties.procedural, serverVersion.penalties.procedural),
        nonThreat: Math.max(localVersion.penalties.nonThreat, serverVersion.penalties.nonThreat),
        failureToNeutralize: Math.max(localVersion.penalties.failureToNeutralize, serverVersion.penalties.failureToNeutralize),
        flagrant: Math.max(localVersion.penalties.flagrant, serverVersion.penalties.flagrant),
        ftdr: Math.max(localVersion.penalties.ftdr, serverVersion.penalties.ftdr),
        other: [...localVersion.penalties.other, ...serverVersion.penalties.other]
      };

      return {
        action: "merge",
        resolvedScore: {
          ...localVersion,
          penalties: mergedPenalties
        }
      };
    }

    // Cannot auto-resolve - requires manual intervention
    return null;
  }, []);

  // Resolve a specific conflict
  const resolveConflict = useCallback(async (
    conflictIndex: number,
    resolution: ConflictResolution
  ) => {
    const conflict = conflicts[conflictIndex];
    if (!conflict) return;

    setIsResolving(true);
    try {
      const resolvedScore = resolution.resolvedScore || 
        (resolution.action === "use_local" ? conflict.localVersion : conflict.serverVersion);

      await updateScore({
        scoreId: conflict.scoreId,
        strings: resolvedScore.strings,
        penalties: resolvedScore.penalties,
        dnf: resolvedScore.dnf,
        dq: resolvedScore.dq,
        scoredBy: conflict.serverVersion.scoredBy
      });

      // Remove resolved conflict
      setConflicts(prev => prev.filter((_, index) => index !== conflictIndex));
      
      toast.success(`Score conflict resolved using ${resolution.action.replace('_', ' ')} version`);
    } catch (error) {
      console.error("Failed to resolve conflict:", error);
      toast.error("Failed to resolve score conflict");
    } finally {
      setIsResolving(false);
    }
  }, [conflicts, updateScore]);

  // Resolve all conflicts automatically where possible
  const autoResolveAllConflicts = useCallback(async () => {
    setIsResolving(true);
    let resolved = 0;
    let failed = 0;

    for (let i = conflicts.length - 1; i >= 0; i--) {
      const conflict = conflicts[i];
      const resolution = autoResolveConflict(conflict);

      if (resolution) {
        try {
          await resolveConflict(i, resolution);
          resolved++;
        } catch {
          failed++;
        }
      }
    }

    setIsResolving(false);

    if (resolved > 0) {
      toast.success(`Auto-resolved ${resolved} conflicts`);
    }
    if (failed > 0) {
      toast.error(`Failed to resolve ${failed} conflicts`);
    }

    return { resolved, failed, remaining: conflicts.length - resolved };
  }, [conflicts, autoResolveConflict, resolveConflict]);

  // Clear all conflicts (for manual override)
  const clearAllConflicts = useCallback(() => {
    setConflicts([]);
    toast.info("All conflicts cleared");
  }, []);

  // Get conflict summary
  const getConflictSummary = useCallback(() => {
    const autoResolvable = conflicts.filter(conflict => autoResolveConflict(conflict) !== null).length;
    const manualRequired = conflicts.length - autoResolvable;

    return {
      total: conflicts.length,
      autoResolvable,
      manualRequired
    };
  }, [conflicts, autoResolveConflict]);

  return {
    conflicts,
    isResolving,
    detectConflict,
    autoResolveConflict,
    resolveConflict,
    autoResolveAllConflicts,
    clearAllConflicts,
    getConflictSummary
  };
}