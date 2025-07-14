"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api, Id } from "@/lib/convex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  Users, 
  Target, 
  CheckCircle, 
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SquadScoringPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as Id<"tournaments">;
  const squadId = params.squadId as Id<"squads">;
  
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const tournament = useQuery(api.tournaments.getTournamentById, { tournamentId });
  const squad = useQuery(api.squads.getSquad, { squadId });
  const stages = useQuery(api.stages.getStagesByTournament, { tournamentId });
  const progress = useQuery(api.scoring.getSquadScoringProgress, {
    squadId,
    tournamentId,
  });
  
  // Check access
  const hasAccess = currentUser && (
    currentUser.role === "admin" || 
    currentUser.role === "securityOfficer"
  );
  
  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-red-900/20 border-red-800">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              You are not authorized to score this tournament.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!tournament || !squad || !stages || !progress) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/scoring/${tournamentId}`)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournament
        </Button>
        <h1 className="text-2xl font-bold text-green-400">
          {squad.name} - Scoring
        </h1>
        <p className="text-gray-400">
          {tournament.name} • Start Time: {squad.timeSlot}
        </p>
      </div>
      
      {/* Squad Overview */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Squad Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progress.map((shooter) => (
              <ShooterScoringCard
                key={shooter.shooterId}
                shooter={shooter}
                stages={stages}
                tournamentId={tournamentId}
                squadId={squadId}
                onScoreStage={(stageId) => 
                  router.push(`/scoring/${tournamentId}/score/${stageId}/${shooter.shooterId}`)
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-gray-200">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/scoring/${tournamentId}/leaderboard`)}
          >
            View Leaderboard
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/scoring/${tournamentId}/stages`)}
          >
            Manage Stages
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface ShooterScoringCardProps {
  shooter: {
    shooterId: string;
    shooterName: string;
    division: string;
    classification: string;
    completedStages: number;
    totalStages: number;
    progressPercentage: number;
    stageProgress: Array<{
      stageId: Id<"stages">;
      stageNumber: number;
      stageName: string;
      scored: boolean;
      finalTime?: number;
      dnf: boolean;
      dq: boolean;
    }>;
  };
  stages: Array<{ _id: Id<"stages"> }>;
  tournamentId: Id<"tournaments">;
  squadId: Id<"squads">;
  onScoreStage: (stageId: Id<"stages">) => void;
}

function ShooterScoringCard({ 
  shooter, 
  onScoreStage 
}: ShooterScoringCardProps) {
  const completionPercentage = shooter.progressPercentage || 0;
  
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-200">
              {shooter.shooterName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {shooter.division}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {shooter.classification}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-300">
              {shooter.completedStages} / {shooter.totalStages}
            </p>
            <p className="text-xs text-gray-500">stages completed</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={completionPercentage} className="h-2" />
        
        {/* Stage Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {shooter.stageProgress.map((stage) => (
            <Button
              key={stage.stageId}
              size="sm"
              variant={stage.scored ? "secondary" : "outline"}
              className={cn(
                "relative",
                stage.scored && "bg-green-900/20 border-green-800 hover:bg-green-900/30",
                stage.dnf && "bg-red-900/20 border-red-800",
                stage.dq && "bg-red-900/20 border-red-800"
              )}
              onClick={() => onScoreStage(stage.stageId)}
            >
              <span className="flex items-center gap-1">
                {stage.scored && <CheckCircle className="h-3 w-3" />}
                Stage {stage.stageNumber}
              </span>
              {stage.scored && stage.finalTime && !stage.dnf && !stage.dq && (
                <span className="absolute -top-2 -right-2 text-xs bg-gray-700 px-1 rounded">
                  {stage.finalTime.toFixed(2)}s
                </span>
              )}
              {(stage.dnf || stage.dq) && (
                <span className="absolute -top-2 -right-2 text-xs bg-red-700 px-1 rounded">
                  {stage.dnf ? "DNF" : "DQ"}
                </span>
              )}
            </Button>
          ))}
        </div>
        
        {/* Quick Score Button */}
        {shooter.completedStages < shooter.totalStages && (
          <Button
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => {
              // Find first unscored stage
              const unscoredStage = shooter.stageProgress.find((s) => !s.scored);
              if (unscoredStage) {
                onScoreStage(unscoredStage.stageId);
              }
            }}
          >
            <Target className="h-4 w-4 mr-2" />
            Score Next Stage
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}