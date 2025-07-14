"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api, Id } from "@/lib/convex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target,
  Clock,
  Award,
  Activity,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/types/scoring";

interface ShooterDashboardProps {
  shooterId: Id<"users">;
  tournamentId: Id<"tournaments">;
  className?: string;
}

export function ShooterDashboard({ shooterId, tournamentId, className }: ShooterDashboardProps) {
  const progress = useQuery(api.scoring.getShooterProgress, {
    shooterId,
    tournamentId,
  });
  
  const tournament = useQuery(api.tournaments.getTournamentById, { tournamentId });
  
  if (!progress || !tournament) {
    return null;
  }
  
  const { shooter, ranking, performance, stageResults } = progress;
  const completionPercentage = (performance.completedStages / performance.totalStages) * 100;
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800/50 border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-400 mb-2">
                {shooter.name}
              </h1>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-900/50 border-blue-800">
                  {shooter.division}
                </Badge>
                <Badge className="bg-purple-900/50 border-purple-800">
                  {shooter.classification}
                </Badge>
                <span className="text-sm text-gray-400">
                  {tournament.name}
                </span>
              </div>
            </div>
            
            {ranking && !ranking.dnf && !ranking.dq && (
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  {ranking.rank <= 3 ? (
                    <Trophy className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <Award className="h-6 w-6 text-gray-400" />
                  )}
                  <span className="text-3xl font-bold text-green-400">
                    #{ranking.rank}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Current Position
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completion</p>
                <p className="text-2xl font-bold text-green-400">
                  {Math.round(completionPercentage)}%
                </p>
                <p className="text-xs text-gray-500">
                  {performance.completedStages}/{performance.totalStages} stages
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Accuracy</p>
                <p className="text-2xl font-bold text-blue-400">
                  {performance.accuracy.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Hit percentage</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Time</p>
                <p className="text-2xl font-bold text-yellow-400 font-mono">
                  {formatTime(performance.totalTime)}
                </p>
                <p className="text-xs text-gray-500">All stages</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Time</p>
                <p className="text-2xl font-bold text-purple-400 font-mono">
                  {performance.completedStages > 0 ? formatTime(performance.averageTime) : "--"}
                </p>
                <p className="text-xs text-gray-500">Per stage</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Progress Overview */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Tournament Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Overall Completion</span>
              <span className="text-sm text-gray-300">
                {performance.completedStages} of {performance.totalStages} stages
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>
      
      {/* Stage Breakdown */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Stage Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stageResults.map((stage) => (
              <StageResultCard key={stage.stageId} stage={stage} />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Current Ranking Details */}
      {ranking && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Current Standing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-gray-800/50 rounded">
                <p className="text-sm text-gray-400 mb-1">Overall Rank</p>
                <p className="text-2xl font-bold text-green-400">#{ranking.rank}</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded">
                <p className="text-sm text-gray-400 mb-1">Division Rank</p>
                <p className="text-2xl font-bold text-blue-400">
                  #{ranking.rank}
                </p>
                <p className="text-xs text-gray-500">{shooter.division}</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded">
                <p className="text-sm text-gray-400 mb-1">Total Time</p>
                <p className="text-2xl font-bold text-yellow-400 font-mono">
                  {formatTime(ranking.totalTime || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface StageResultCardProps {
  stage: {
    stageId: string;
    stageNumber: number;
    stageName: string;
    scored: boolean;
    score: {
      dnf?: boolean;
      dq?: boolean;
      finalTime?: number;
      rawTime?: number;
      pointsDown?: number;
      penaltyTime?: number;
    } | null;
  };
}

function StageResultCard({ stage }: StageResultCardProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {stage.scored ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-gray-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-200">
            Stage {stage.stageNumber}: {stage.stageName}
          </p>
          {stage.scored && stage.score && (
            <p className="text-sm text-gray-400">
              {stage.score.dnf ? "DNF" : stage.score.dq ? "DQ" : "Completed"}
            </p>
          )}
        </div>
      </div>
      
      <div className="text-right">
        {stage.scored && stage.score ? (
          <>
            {stage.score.dnf || stage.score.dq ? (
              <span className="text-red-400 font-bold text-sm">
                {stage.score.dnf ? "DNF" : "DQ"}
              </span>
            ) : (
              <>
                <p className="text-lg font-bold text-green-400 font-mono">
                  {formatTime(stage.score.finalTime || 0)}
                </p>
                <p className="text-xs text-gray-500">
                  Raw: {formatTime(stage.score.rawTime || 0)}
                  {stage.score.pointsDown && stage.score.pointsDown > 0 && ` +${stage.score.pointsDown}pd`}
                  {stage.score.penaltyTime && stage.score.penaltyTime > 0 && ` +${stage.score.penaltyTime}s`}
                </p>
              </>
            )}
          </>
        ) : (
          <span className="text-gray-500 text-sm">Not scored</span>
        )}
      </div>
    </div>
  );
}