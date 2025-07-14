"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api, Id } from "@/lib/convex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Target, 
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Activity
} from "lucide-react";

export default function TournamentScoringPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as Id<"tournaments">;
  
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const tournament = useQuery(api.tournaments.getTournamentById, { tournamentId });
  const stages = useQuery(api.stages.getStagesByTournament, { tournamentId });
  const squads = useQuery(api.squads.getSquadsWithMembers, { tournamentId });
  
  // Check if user has SO permissions for this tournament
  const userSquadAssignments = useQuery(
    api.squads.getUserSquadAssignments,
    currentUser ? { userId: currentUser._id, tournamentId } : "skip"
  );
  
  const hasAccess = currentUser && (
    currentUser.role === "admin" || 
    (currentUser.role === "securityOfficer" && userSquadAssignments && userSquadAssignments.length > 0)
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
  
  if (!tournament || !stages || !squads || !currentUser) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/scoring")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-green-400">
            {tournament.name}
          </h1>
          <p className="text-gray-400">
            {new Date(tournament.date).toLocaleDateString()} • {tournament.location.venue}
          </p>
        </div>
        <Badge 
          variant={tournament.status === "active" ? "default" : "secondary"}
          className={tournament.status === "active" ? "bg-green-600" : ""}
        >
          {tournament.status}
        </Badge>
      </div>
      
      {/* Admin Actions */}
      {currentUser?.role === "admin" && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => router.push(`/scoring/${tournamentId}/stages`)}
          >
            <Target className="h-4 w-4 mr-2" />
            Manage Stages
          </Button>
        </div>
      )}
      
      {/* Tabs for different views */}
      <Tabs defaultValue="squads" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="squads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            By Squad
          </TabsTrigger>
          <TabsTrigger value="stages" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            By Stage
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Progress
          </TabsTrigger>
        </TabsList>
        
        {/* Squad View */}
        <TabsContent value="squads" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {squads.map((squad) => (
              <SquadScoringCard
                key={squad._id}
                squad={squad}
                stages={stages}
                tournamentId={tournamentId}
                onClick={() => router.push(`/scoring/${tournamentId}/squad/${squad._id}`)}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Stage View */}
        <TabsContent value="stages" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stages.map((stage) => (
              <StageScoringCard
                key={stage._id}
                stage={stage}
                tournamentId={tournamentId}
                onClick={() => router.push(`/scoring/${tournamentId}/stage/${stage._id}`)}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Progress View */}
        <TabsContent value="progress">
          <TournamentProgress 
            tournamentId={tournamentId}
            stages={stages}
            squads={squads}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SquadScoringCardProps {
  squad: {
    _id: Id<"squads">;
    name: string;
    timeSlot: string;
    members?: Array<{ userId: Id<"users"> }>;
  };
  stages: Array<{ _id: Id<"stages">; stageNumber: number; name: string; strings: number; roundCount: number }>;
  tournamentId: Id<"tournaments">;
  onClick: () => void;
}

function SquadScoringCard({ squad, stages, tournamentId, onClick }: SquadScoringCardProps) {
  const progress = useQuery(api.scoring.getSquadScoringProgress, {
    squadId: squad._id,
    tournamentId,
  });
  
  const totalShooters = squad.members?.length || 0;
  const totalStages = stages.length;
  const totalScores = totalShooters * totalStages;
  const completedScores = progress?.reduce((sum, p) => sum + p.completedStages, 0) || 0;
  const progressPercentage = totalScores > 0 ? (completedScores / totalScores) * 100 : 0;
  
  return (
    <Card 
      className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-lg text-green-400 flex items-center justify-between">
          <span>{squad.name}</span>
          <Badge variant="outline" className="text-xs">
            {squad.timeSlot}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Shooters</span>
            <span className="text-gray-300">{totalShooters}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Scores Entered</span>
            <span className="text-gray-300">
              {completedScores} / {totalScores}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <Button className="w-full bg-green-600 hover:bg-green-700">
          <span>Score Squad</span>
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

interface StageScoringCardProps {
  stage: {
    _id: Id<"stages">;
    stageNumber: number;
    name: string;
    strings: number;
    roundCount: number;
    parTime?: number;
  };
  tournamentId: Id<"tournaments">;
  onClick: () => void;
}

function StageScoringCard({ stage, onClick }: StageScoringCardProps) {
  const scores = useQuery(api.scoring.getScoresByStage, {
    stageId: stage._id,
  });
  
  const scoreCount = scores?.length || 0;
  
  return (
    <Card 
      className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-lg text-green-400">
          Stage {stage.stageNumber}: {stage.name}
        </CardTitle>
        <p className="text-sm text-gray-400">
          {stage.strings} strings • {stage.roundCount} rounds
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Scores Entered</span>
            <span className="text-gray-300">{scoreCount}</span>
          </div>
          {stage.parTime && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Par Time</span>
              <span className="text-gray-300">{stage.parTime}s</span>
            </div>
          )}
        </div>
        
        <Button className="w-full bg-green-600 hover:bg-green-700">
          <span>View Stage Scores</span>
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

interface TournamentProgressProps {
  tournamentId: Id<"tournaments">;
  stages: Array<{ _id: Id<"stages">; stageNumber: number; name: string }>;
  squads: Array<{ _id: Id<"squads">; name: string; timeSlot: string; members?: Array<{ userId: Id<"users"> }> }>;
}

function TournamentProgress({ tournamentId, stages, squads }: TournamentProgressProps) {
  // Get all registrations
  const registrations = useQuery(api.registrations.getRegistrationsByTournament, {
    tournamentId,
  });
  
  const checkedIn = registrations?.filter(r => r.status === "checked_in").length || 0;
  //const totalShooters = registrations?.length || 0;
  const totalPossibleScores = checkedIn * stages.length;
  
  // Get total completed scores for the tournament
  const completedScores = useQuery(api.scoring.getTournamentCompletedScoresCount, {
    tournamentId,
  }) || 0;
  
  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-green-400">
            Tournament Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-gray-800/50 rounded">
              <p className="text-3xl font-bold text-green-400">{checkedIn}</p>
              <p className="text-sm text-gray-400">Shooters Checked In</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded">
              <p className="text-3xl font-bold text-yellow-400">{stages.length}</p>
              <p className="text-sm text-gray-400">Total Stages</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded">
              <p className="text-3xl font-bold text-blue-400">{squads.length}</p>
              <p className="text-sm text-gray-400">Active Squads</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Overall Scoring Progress</span>
              <span className="text-gray-300">
                {completedScores} / {totalPossibleScores} scores
              </span>
            </div>
            <Progress 
              value={totalPossibleScores > 0 ? (completedScores / totalPossibleScores) * 100 : 0} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Squad Progress Details */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg text-gray-200">
            Squad Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {squads.map((squad) => (
              <SquadProgressRow
                key={squad._id}
                squad={squad}
                stages={stages}
                tournamentId={tournamentId}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SquadProgressRowProps {
  squad: {
    _id: Id<"squads">;
    name: string;
    timeSlot: string;
    members?: Array<{ userId: Id<"users"> }>;
  };
  stages: Array<{ _id: Id<"stages"> }>;
  tournamentId: Id<"tournaments">;
}

function SquadProgressRow({ squad, stages, tournamentId }: SquadProgressRowProps) {
  const progress = useQuery(api.scoring.getSquadScoringProgress, {
    squadId: squad._id,
    tournamentId,
  });
  
  const totalShooters = squad.members?.length || 0;
  const totalStages = stages.length;
  const totalScores = totalShooters * totalStages;
  const completedScores = progress?.reduce((sum, p) => sum + p.completedStages, 0) || 0;
  const progressPercentage = totalScores > 0 ? (completedScores / totalScores) * 100 : 0;
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
      <div className="flex-1">
        <p className="font-medium text-gray-200">{squad.name}</p>
        <p className="text-sm text-gray-400">
          {totalShooters} shooters • {squad.timeSlot}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-300">
            {completedScores} / {totalScores}
          </p>
          <p className="text-xs text-gray-500">scores</p>
        </div>
        <div className="w-24">
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>
    </div>
  );
}