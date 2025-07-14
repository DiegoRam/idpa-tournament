"use client";

import { useQuery } from "convex/react";
import { api, Id } from "@/lib/convex";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShooterDashboard } from "@/components/features/dashboard/ShooterDashboard";
import { 
  Trophy, 
  Calendar,
  Target,
  Activity,
  ExternalLink,
  AlertCircle
} from "lucide-react";

export default function ShooterDashboardPage() {
  const router = useRouter();
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  
  // Get user's active tournament registrations
  const registrations = useQuery(api.registrations.getRegistrationsByUser, 
    currentUser ? {
      userId: currentUser._id,
      status: "checked_in",
    } : "skip"
  );
  
  if (!currentUser) {
    return null;
  }
  
  // Filter to only tournaments that are active
  const activeTournaments = registrations || [];
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-green-400 flex items-center gap-3">
          <Trophy className="h-8 w-8" />
          My Performance
        </h1>
        <p className="text-gray-400">
          Track your tournament progress and performance metrics
        </p>
      </div>
      
      {/* Active Tournaments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Active Tournaments
        </h2>
        
        {activeTournaments.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-600 mb-4" />
              <p className="text-gray-400 mb-2">No active tournaments</p>
              <p className="text-sm text-gray-500 mb-4">
                Register for a tournament to see your performance dashboard
              </p>
              <Button 
                onClick={() => router.push("/tournaments")}
                className="bg-green-600 hover:bg-green-700"
              >
                Browse Tournaments
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {activeTournaments.map((registration) => (
              <TournamentDashboardCard 
                key={registration._id}
                registration={registration}
                onViewDetails={(tournamentId) => 
                  router.push(`/tournaments/${tournamentId}/leaderboard`)
                }
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Recent Performance */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Performance Summary
        </h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-200">
                {activeTournaments.length}
              </p>
              <p className="text-sm text-gray-400">Active Tournaments</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-200">--</p>
              <p className="text-sm text-gray-400">Avg Accuracy</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-200">--</p>
              <p className="text-sm text-gray-400">Stages Completed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface TournamentDashboardCardProps {
  registration: {
    _id: string;
    tournamentId: Id<"tournaments">;
    shooterId: Id<"users">;
    division: string;
    classification: string;
    status: string;
  };
  onViewDetails: (tournamentId: string) => void;
}

function TournamentDashboardCard({ registration, onViewDetails }: TournamentDashboardCardProps) {
  const tournament = useQuery(api.tournaments.getTournamentById, { 
    tournamentId: registration.tournamentId 
  });
  
  // Get shooter progress for future enhancements
  // const progress = useQuery(api.scoring.getShooterProgress, {
  //   shooterId: registration.shooterId,
  //   tournamentId: registration.tournamentId,
  // });
  
  if (!tournament) {
    return null;
  }
  
  // const completionPercentage = progress 
  //   ? (progress.performance.completedStages / progress.performance.totalStages) * 100
  //   : 0;
  
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-green-400">
              {tournament.name}
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(tournament.date).toLocaleDateString()} • {tournament.location.venue}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-blue-900/50 border-blue-800">
                {registration.division}
              </Badge>
              <Badge className="bg-purple-900/50 border-purple-800">
                {registration.classification}
              </Badge>
              <Badge 
                variant={tournament.status === "active" ? "default" : "secondary"}
                className={tournament.status === "active" ? "bg-green-600" : ""}
              >
                {tournament.status}
              </Badge>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(tournament._id)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tournament Dashboard */}
        {tournament.status === "active" && (
          <ShooterDashboard
            shooterId={registration.shooterId}
            tournamentId={registration.tournamentId}
          />
        )}
        
        {tournament.status !== "active" && (
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <AlertCircle className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">Tournament not yet active</p>
              <p className="text-sm text-gray-500">
                Dashboard will be available when the tournament begins
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}