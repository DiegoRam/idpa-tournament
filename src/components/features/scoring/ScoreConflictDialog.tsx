"use client";

import React from "react";
import { 
  ScoreConflict, 
  ConflictResolution, 
  useScoreConflictResolution 
} from "@/hooks/useScoreConflictResolution";
import { calculateScoreBreakdown, formatTime } from "@/types/scoring";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  Clock, 
  User, 
  Zap, 
  CheckCircle, 
  X,
  Merge
} from "lucide-react";

interface ScoreConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScoreConflictDialog({ open, onOpenChange }: ScoreConflictDialogProps) {
  const {
    conflicts,
    isResolving,
    autoResolveConflict,
    resolveConflict,
    autoResolveAllConflicts,
    clearAllConflicts,
    getConflictSummary
  } = useScoreConflictResolution();

  const summary = getConflictSummary();

  const handleAutoResolveAll = async () => {
    const result = await autoResolveAllConflicts();
    if (result.remaining === 0) {
      onOpenChange(false);
    }
  };

  const handleManualResolve = async (conflictIndex: number, action: "use_local" | "use_server") => {
    const resolution: ConflictResolution = { action };
    await resolveConflict(conflictIndex, resolution);
  };

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Score Conflicts Detected
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {summary.total} score conflicts need resolution. {summary.autoResolvable} can be auto-resolved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Actions */}
          <div className="flex gap-3">
            {summary.autoResolvable > 0 && (
              <Button
                onClick={handleAutoResolveAll}
                disabled={isResolving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Auto-Resolve {summary.autoResolvable} Conflicts
              </Button>
            )}
            <Button
              onClick={clearAllConflicts}
              disabled={isResolving}
              variant="outline"
              className="text-gray-400"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          {/* Individual Conflicts */}
          <div className="space-y-4">
            {conflicts.map((conflict, index) => (
              <ConflictCard
                key={`${conflict.scoreId}-${index}`}
                conflict={conflict}
                index={index}
                onResolve={handleManualResolve}
                autoResolution={autoResolveConflict(conflict)}
                isResolving={isResolving}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ConflictCardProps {
  conflict: ScoreConflict;
  index: number;
  onResolve: (index: number, action: "use_local" | "use_server") => void;
  autoResolution: ConflictResolution | null;
  isResolving: boolean;
}

function ConflictCard({ 
  conflict, 
  index, 
  onResolve, 
  autoResolution, 
  isResolving 
}: ConflictCardProps) {
  const localScore = calculateScoreBreakdown(conflict.localVersion.strings, conflict.localVersion.penalties);
  const serverScore = calculateScoreBreakdown(conflict.serverVersion.strings, conflict.serverVersion.penalties);

  const getVersionDifferences = () => {
    const diffs = [];
    
    if (JSON.stringify(conflict.localVersion.strings) !== JSON.stringify(conflict.serverVersion.strings)) {
      diffs.push("String times/hits");
    }
    if (JSON.stringify(conflict.localVersion.penalties) !== JSON.stringify(conflict.serverVersion.penalties)) {
      diffs.push("Penalties");
    }
    if (conflict.localVersion.dnf !== conflict.serverVersion.dnf) {
      diffs.push("DNF status");
    }
    if (conflict.localVersion.dq !== conflict.serverVersion.dq) {
      diffs.push("DQ status");
    }
    
    return diffs;
  };

  const differences = getVersionDifferences();

  return (
    <Card className="bg-gray-800/50 border-red-800">
      <CardHeader>
        <CardTitle className="text-lg text-red-400 flex items-center justify-between">
          <span>Conflict #{index + 1}</span>
          {autoResolution && (
            <Badge variant="outline" className="text-green-400 border-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Auto-resolvable
            </Badge>
          )}
        </CardTitle>
        <div className="text-sm text-gray-400">
          <p>Differences found in: {differences.join(", ")}</p>
          {autoResolution && (
            <p className="text-green-400 mt-1">
              Recommended: {autoResolution.action.replace('_', ' ')}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Local Version */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-blue-400">Your Version (Local)</h4>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(conflict.localVersion.lastModified).toLocaleTimeString()}
              </Badge>
            </div>
            
            <ScoreVersionDisplay
              strings={conflict.localVersion.strings}
              penalties={conflict.localVersion.penalties}
              dnf={conflict.localVersion.dnf}
              dq={conflict.localVersion.dq}
              finalTime={localScore.finalTime}
              variant="local"
            />
          </div>

          {/* Server Version */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-orange-400">Server Version</h4>
              <Badge variant="outline" className="text-orange-400 border-orange-400">
                <User className="h-3 w-3 mr-1" />
                Official
              </Badge>
            </div>
            
            <ScoreVersionDisplay
              strings={conflict.serverVersion.strings}
              penalties={conflict.serverVersion.penalties}
              dnf={conflict.serverVersion.dnf}
              dq={conflict.serverVersion.dq}
              finalTime={serverScore.finalTime}
              variant="server"
            />
          </div>
        </div>

        {/* Resolution Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <Button
            onClick={() => onResolve(index, "use_local")}
            disabled={isResolving}
            variant="outline"
            className="flex-1 text-blue-400 border-blue-400 hover:bg-blue-400/10"
          >
            Use Your Version
          </Button>
          
          {autoResolution?.action === "merge" && (
            <Button
              onClick={() => onResolve(index, "use_local")} // Will use the merged version
              disabled={isResolving}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Merge className="h-4 w-4 mr-2" />
              Use Merged Version
            </Button>
          )}
          
          <Button
            onClick={() => onResolve(index, "use_server")}
            disabled={isResolving}
            variant="outline"
            className="flex-1 text-orange-400 border-orange-400 hover:bg-orange-400/10"
          >
            Use Server Version
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ScoreVersionDisplayProps {
  strings: {
    time: number;
    hits: {
      down0: number;
      down1: number;
      down3: number;
      miss: number;
      nonThreat: number;
    };
  }[];
  penalties: {
    procedural: number;
    nonThreat: number;
    failureToNeutralize: number;
    flagrant: number;
    ftdr: number;
    other: { type: string; count: number; seconds: number; description?: string }[];
  };
  dnf: boolean;
  dq: boolean;
  finalTime: number;
  variant: "local" | "server";
}

function ScoreVersionDisplay({
  strings,
  penalties,
  dnf,
  dq,
  finalTime,
  variant
}: ScoreVersionDisplayProps) {
  const colorClass = variant === "local" ? "text-blue-400" : "text-orange-400";
  
  return (
    <div className="bg-gray-900/50 rounded-lg p-3 space-y-2">
      {/* Status */}
      {(dnf || dq) && (
        <Alert className="bg-red-900/20 border-red-800 py-2">
          <AlertDescription className="text-red-400 text-sm">
            {dnf && "DNF"} {dq && "DQ"}
          </AlertDescription>
        </Alert>
      )}

      {/* Final Time */}
      <div className="text-center">
        <div className="text-2xl font-bold font-mono" style={{ color: variant === "local" ? "#60a5fa" : "#fb923c" }}>
          {dnf || dq ? "N/A" : formatTime(finalTime)}
        </div>
        <div className="text-xs text-gray-400">Final Time</div>
      </div>

      {/* Quick String Summary */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-gray-400">Strings</div>
          <div className={colorClass}>{strings.length}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Penalties</div>
          <div className={colorClass}>
            {penalties.procedural + penalties.nonThreat + penalties.failureToNeutralize + 
             penalties.flagrant + penalties.ftdr + penalties.other.length}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Total Hits</div>
          <div className={colorClass}>
            {strings.reduce((total, s) => 
              total + s.hits.down0 + s.hits.down1 + s.hits.down3 + s.hits.miss + s.hits.nonThreat, 0
            )}
          </div>
        </div>
      </div>
    </div>
  );
}