"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Id } from "@/lib/convex";
import { StringScore, IDPAPenalties, HitZone } from "@/types/scoring";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TargetHitZones } from "./TargetHitZones";
import { PenaltySelector } from "./PenaltySelector";
import { ScoreReview } from "./ScoreReview";
import { 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Save,
  Wifi,
  WifiOff,
  CloudOff
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreEntryFormProps {
  tournamentId: Id<"tournaments">;
  stageId: Id<"stages">;
  shooterId: Id<"users">;
  squadId: Id<"squads">;
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ScoreEntryForm({
  tournamentId,
  stageId,
  shooterId,
  squadId,
  onComplete,
  onCancel,
  className,
}: ScoreEntryFormProps) {
  // Fetch stage details
  const stage = useQuery(api.stages.getStage, { stageId });
  
  // Fetch shooter details
  const registration = useQuery(api.registrations.getRegistrationByShooterAndTournament, {
    shooterId,
    tournamentId,
  });
  
  // Fetch existing score if any
  const existingScore = useQuery(api.scoring.getScoreByStageAndShooter, {
    stageId,
    shooterId,
  });
  
  // Mutations
  const submitScore = useMutation(api.scoring.submitScore);
  const updateScore = useMutation(api.scoring.updateScore);
  
  // Current user (scorer)
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  
  // Offline capabilities
  const { isOnline, executeOfflineAction, pendingCount } = useOfflineSync();
  const { storeOfflineScore, isInitialized: storageInitialized } = useOfflineStorage();
  
  // Form state
  const [currentString, setCurrentString] = useState(0);
  const [strings, setStrings] = useState<StringScore[]>([]);
  const [penalties, setPenalties] = useState<IDPAPenalties>({
    procedural: 0,
    nonThreat: 0,
    failureToNeutralize: 0,
    flagrant: 0,
    ftdr: 0,
    other: [],
  });
  const [dnf, setDnf] = useState(false);
  const [dq, setDq] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize strings based on stage configuration
  useEffect(() => {
    if (stage && strings.length === 0) {
      const initialStrings: StringScore[] = Array(stage.strings).fill(null).map(() => ({
        time: 0,
        hits: {
          down0: 0,
          down1: 0,
          down3: 0,
          miss: 0,
          nonThreat: 0,
        },
      }));
      setStrings(initialStrings);
    }
  }, [stage, strings.length]);
  
  // Load existing score if editing
  useEffect(() => {
    if (existingScore) {
      setStrings(existingScore.strings);
      setPenalties(existingScore.penalties);
      setDnf(existingScore.dnf);
      setDq(existingScore.dq);
    }
  }, [existingScore]);
  
  if (!stage || !registration || !currentUser) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  const shooter = registration.shooter;
  if (!shooter) {
    return (
      <Alert className="bg-red-900/20 border-red-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Shooter information not found</AlertDescription>
      </Alert>
    );
  }
  
  // Handlers
  const handleTimeChange = (stringIndex: number, time: number) => {
    const newStrings = [...strings];
    newStrings[stringIndex] = {
      ...newStrings[stringIndex],
      time: Math.max(0, time),
    };
    setStrings(newStrings);
  };
  
  const handleTargetHitsChange = (stringIndex: number, targetId: string, hits: HitZone) => {
    const newStrings = [...strings];
    // For simplicity, we're treating targetId as the zone type
    // In a real implementation, you'd have multiple targets per string
    newStrings[stringIndex] = {
      ...newStrings[stringIndex],
      hits: hits,
    };
    setStrings(newStrings);
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate all strings have times
      const invalidStrings = strings.findIndex(s => s.time === 0);
      if (invalidStrings !== -1 && !dnf && !dq) {
        throw new Error(`String ${invalidStrings + 1} is missing time`);
      }
      
      const scoreData = {
        stageId,
        shooterId,
        squadId,
        division: registration.division,
        classification: registration.classification,
        scoredBy: currentUser._id,
        strings,
        penalties,
        dnf,
        dq,
      };
      
      // Use offline-capable execution
      if (existingScore) {
        await executeOfflineAction(
          "updateScore",
          { scoreId: existingScore._id, ...scoreData },
          () => updateScore({ scoreId: existingScore._id, ...scoreData })
        );
      } else {
        await executeOfflineAction(
          "submitScore",
          scoreData,
          () => submitScore(scoreData)
        );
      }
      
      // Store locally for offline reference if storage is available
      if (storageInitialized && !isOnline) {
        await storeOfflineScore(scoreData);
      }
      
      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit score");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const canNavigateNext = currentString < stage.strings - 1;
  const canNavigatePrev = currentString > 0;
  
  if (showReview) {
    return (
      <ScoreReview
        shooterName={shooter.name}
        division={registration.division}
        classification={registration.classification}
        stageName={stage.name}
        strings={strings}
        penalties={penalties}
        dnf={dnf}
        dq={dq}
        onEdit={() => setShowReview(false)}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
        className={className}
      />
    );
  }
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-green-400">
              Score Entry - {stage.name}
            </CardTitle>
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <Wifi className="h-4 w-4" />
                  <span>Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <WifiOff className="h-4 w-4" />
                  <span>Offline</span>
                </div>
              )}
              {pendingCount > 0 && (
                <div className="flex items-center gap-1 text-blue-400 text-sm">
                  <CloudOff className="h-4 w-4" />
                  <span>{pendingCount} pending</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            <p>
              <span className="font-medium">Shooter:</span> {shooter.name} ({registration.division}/{registration.classification})
            </p>
            <p>
              <span className="font-medium">Stage:</span> {stage.strings} strings, {stage.roundCount} rounds per string
            </p>
            {!isOnline && (
              <p className="text-yellow-400 text-xs">
                You&apos;re offline. Scores will be synced when connection is restored.
              </p>
            )}
          </div>
        </CardHeader>
      </Card>
      
      {error && (
        <Alert className="bg-red-900/20 border-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* DNF/DQ Options */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dnf}
                onChange={(e) => setDnf(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-red-500"
              />
              <span className="text-sm text-gray-300">Did Not Finish (DNF)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dq}
                onChange={(e) => setDq(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-red-500"
              />
              <span className="text-sm text-gray-300">Disqualified (DQ)</span>
            </label>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Scoring Tabs */}
      <Tabs defaultValue="strings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="strings" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Strings & Hits
          </TabsTrigger>
          <TabsTrigger value="penalties" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Penalties
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="strings" className="space-y-4">
          {/* String Navigation */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  String {currentString + 1} of {stage.strings}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentString(currentString - 1)}
                    disabled={!canNavigatePrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentString(currentString + 1)}
                    disabled={!canNavigateNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Entry */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">
                  Time (seconds)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={strings[currentString]?.time || 0}
                  onChange={(e) => handleTimeChange(currentString, parseFloat(e.target.value) || 0)}
                  className="bg-gray-800 border-gray-700 text-2xl font-mono text-center"
                  placeholder="0.00"
                />
              </div>
              
              {/* Target Hit Zones */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Target Hits
                </h3>
                <TargetHitZones
                  targetId="1"
                  hits={strings[currentString]?.hits || {
                    down0: 0,
                    down1: 0,
                    down3: 0,
                    miss: 0,
                    nonThreat: 0,
                  }}
                  maxRounds={stage.roundCount}
                  onChange={(_, hits) => handleTargetHitsChange(currentString, "1", hits)}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* String Summary */}
          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {strings.map((string, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex justify-between p-2 rounded",
                      index === currentString ? "bg-gray-700/50" : "bg-gray-800/50"
                    )}
                  >
                    <span className="text-gray-400">String {index + 1}:</span>
                    <span className="font-mono font-bold">
                      {string.time > 0 ? `${string.time.toFixed(2)}s` : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="penalties">
          <PenaltySelector
            penalties={penalties}
            onChange={setPenalties}
          />
        </TabsContent>
      </Tabs>
      
      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={() => setShowReview(true)}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Review Score
        </Button>
        {existingScore && (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="outline"
            className="flex-1"
          >
            {isOnline ? <Save className="h-4 w-4 mr-2" /> : <CloudOff className="h-4 w-4 mr-2" />}
            {isSubmitting ? "Saving..." : isOnline ? "Save Draft" : "Save Offline"}
          </Button>
        )}
      </div>
    </div>
  );
}