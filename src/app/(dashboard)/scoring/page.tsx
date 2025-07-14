"use client";

import { useQuery } from "convex/react";
import { api, Id } from "@/lib/convex";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Users, 
  Target, 
  
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Trophy
} from "lucide-react";

export default function ScoringDashboard() {
  const router = useRouter();
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  
  // Get upcoming tournaments
  const upcomingTournaments = useQuery(api.tournaments.getUpcomingTournaments, {});
  
  // Get all squads to check SO assignments
  const allSquads = useQuery(api.squads.getSquadsByUser, 
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  
  // Get unique tournament IDs where user is assigned as SO
  const soTournamentIds = new Set(
    allSquads?.map(squad => squad.tournamentId) || []
  );
  
  // Filter tournaments where user is assigned as SO to any squad
  const soTournaments = upcomingTournaments?.filter(tournament => 
    soTournamentIds.has(tournament._id) && 
    (tournament.status === "published" || tournament.status === "active")
  ) || [];
  
  // Check if user has SO permissions
  if (currentUser && currentUser.role !== "securityOfficer" && currentUser.role !== "admin") {
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
              You must be a Security Officer to access the scoring dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-green-400 flex items-center gap-3">
          <Shield className="h-8 w-8" />
          Security Officer Dashboard
        </h1>
        <p className="text-gray-400">
          Manage scoring for your assigned tournaments and squads
        </p>
      </div>
      
      {/* Active Tournaments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-200">
          Active Tournaments
        </h2>
        
        {soTournaments.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="h-12 w-12 text-gray-600 mb-4" />
              <p className="text-gray-400 mb-2">No active tournaments assigned</p>
              <p className="text-sm text-gray-500">
                You&apos;ll see tournaments here when you&apos;re assigned as a Security Officer
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {soTournaments.map((tournament) => (
              <TournamentCard
                key={tournament._id}
                tournament={tournament}
                onClick={() => router.push(`/scoring/${tournament._id}`)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Recent Scoring Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-200">
          Recent Scoring Activity
        </h2>
        <RecentScoringActivity userId={currentUser._id} />
      </div>
    </div>
  );
}

interface TournamentCardProps {
  tournament: {
    _id: Id<"tournaments">;
    name: string;
    date: number;
    status: string;
  };
  onClick: () => void;
}

function TournamentCard({ tournament, onClick }: TournamentCardProps) {
  const registrations = useQuery(api.registrations.getRegistrationsByTournament, {
    tournamentId: tournament._id,
  });
  
  const stages = useQuery(api.stages.getStagesByTournament, {
    tournamentId: tournament._id,
  });
  
  const checkedInCount = registrations?.filter(r => r.status === "checked_in").length || 0;
  const totalRegistrations = registrations?.length || 0;
  
  return (
    <Card 
      className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-green-400">
              {tournament.name}
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(tournament.date).toLocaleDateString()}
            </p>
          </div>
          <Badge 
            variant={tournament.status === "active" ? "default" : "secondary"}
            className={tournament.status === "active" ? "bg-green-600" : ""}
          >
            {tournament.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shooter Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Shooters
            </span>
            <span className="text-gray-300">
              {checkedInCount} / {totalRegistrations}
            </span>
          </div>
          <Progress 
            value={(checkedInCount / Math.max(totalRegistrations, 1)) * 100} 
            className="h-2"
          />
        </div>
        
        {/* Stage Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Stages
          </span>
          <span className="text-gray-300">
            {stages?.length || 0}
          </span>
        </div>
        
        {/* Action */}
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <span>Manage Scoring</span>
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

interface RecentScoringActivityProps {
  userId?: string;
}

function RecentScoringActivity({ }: RecentScoringActivityProps) {
  // In a real implementation, you'd have a query to get recent scores by this SO
  // For now, we'll show a placeholder
  
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardContent className="py-6">
        <div className="space-y-4">
          {/* Placeholder for recent scores */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-200">
                  John Doe - Stage 1
                </p>
                <p className="text-xs text-gray-400">
                  Final time: 45.32s
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              5 minutes ago
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-200">
                  Jane Smith - Stage 2
                </p>
                <p className="text-xs text-gray-400">
                  Final time: 52.18s
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              12 minutes ago
            </span>
          </div>
          
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Recent scoring activity will appear here
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}